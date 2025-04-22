import client from '@sendgrid/client';
import { Base64Encode } from 'base64-stream';
import { logger } from 'firebase-functions/v2';

export const notify = (key, template) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.warn(
      'Skipping mail send and returning a fake promise',
      { nodeEnv: process.env.NODE_ENV },
      {
        structuredData: true,
      },
    );

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

export const getContactsToNotify = async (db, county) => {
  const documentReference = db.collection('contacts').doc('admin');
  const documentSnapshot = await documentReference.get();
  if (!documentSnapshot.exists) {
    logger.error('contacts document does not exist', {
      structuredData: true,
    });

    return [];
  }

  const data = documentSnapshot.data();

  let contacts = data.ugrc;

  if (!county) {
    return contacts;
  }

  county = county.toLowerCase();

  if (county in data) {
    contacts = [...contacts, ...data[county]];
  }

  return contacts;
};

export const getBase64EncodedAttachment = (stream) => {
  const chunks = new Base64Encode();

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      logger.error('get pdf error', err, { structuredData: true });

      return reject(err);
    });
    stream.on('data', (chunk) => chunks.write(chunk));
    stream.on('end', () => {
      chunks.end();

      return resolve(chunks.read());
    });
  });
};
