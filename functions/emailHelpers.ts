import client from '@sendgrid/client';
import type { ClientRequest } from '@sendgrid/client/src/request.js';
import { Base64Encode } from 'base64-stream';
import type { Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import type { Readable } from 'node:stream';

export type Contact = {
  name: string;
  email: string;
};

type ContactDocument = Record<string, Contact[]> & {
  ugrc: Contact[];
};

export const notify = (key: string, template: ClientRequest) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.warn('Skipping mail send and returning a fake promise', {
      nodeEnv: process.env.NODE_ENV,
    });

    return Promise.resolve([
      {
        statusCode: 202,
        body: '',
        headers: {
          server: 'nginx',
        },
      },
    ]);
  }

  client.setApiKey(key);

  return client.request(template);
};

export const getContactsToNotify = async (
  db: Firestore,
  county: string | null,
): Promise<Contact[]> => {
  const documentReference = db.collection('contacts').doc('admin');
  const documentSnapshot = await documentReference.get();

  if (!documentSnapshot.exists) {
    logger.error('contacts document does not exist');

    return [];
  }

  const data = documentSnapshot.data() as ContactDocument;
  let contacts = data.ugrc;

  if (!county) {
    return contacts;
  }

  const normalizedCounty = county.toLowerCase();

  if (normalizedCounty in data) {
    contacts = [...contacts, ...data[normalizedCounty]];
  }

  return contacts;
};

export const getBase64EncodedAttachment = (
  stream: Readable,
): Promise<Buffer> => {
  const chunks = new Base64Encode();

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      logger.error('get pdf error', { error });

      reject(error);
    });
    stream.on('data', (chunk) => chunks.write(chunk));
    stream.on('end', () => {
      chunks.end();

      resolve(chunks.read() as Buffer);
    });
  });
};