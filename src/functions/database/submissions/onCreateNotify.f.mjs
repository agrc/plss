import { logger, runWith } from 'firebase-functions/v1';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import client from '@sendgrid/client';
const sendGridApiKey = defineSecret('SENDGRID_API_KEY');

const notify = (template) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.warn(
      'Skipping mail send and returning a fake promise',
      { nodeEnv: process.env.NODE_ENV },
      {
        structuredData: true,
      }
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

  return client.request(template);
};

export const getContactsToNotify = async (county) => {
  const db = getFirestore();
  const documentReference = db.collection('contacts').doc('admin');
  const documentSnapshot = await documentReference.get();
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

const onCreateAdminNotify = runWith({ secrets: [sendGridApiKey] })
  .firestore.document('/submissions/{docId}')
  .onCreate(async (snap) => {
    client.setApiKey(process.env.SENDGRID_API_KEY);
    logger.debug(
      'runWith',
      (process.env.SENDGRID_API_KEY ?? 'null').slice(0, 4),
      {
        structuredData: true,
      }
    );

    const document = snap.data();

    logger.debug('trigger: new submission for', document, {
      structuredData: true,
    });

    const to = await getContactsToNotify(document?.county);

    const template = {
      method: 'post',
      url: '/v3/mail/send',
      body: {
        template_id: 'd-ab6a113177ed4f2b8a868f25400b1baf',
        from: {
          email: 'ugrc-plss-administrators@utah.gov',
          name: 'UGRC PLSS Administrators',
        },
        personalizations: [
          {
            to,
            dynamic_template_data: {
              type: document.type,
              surveyor: document.submitted_by.name,
              blmPointId: document.blm_point_id,
              county: document?.county ?? 'unknown',
            },
          },
        ],
      },
    };

    logger.debug(
      'sending notification email to',
      to,
      template.body.personalizations[0].dynamic_template_data,
      {
        structuredData: true,
      }
    );

    try {
      const result = await notify(template);

      logger.debug('mail sent with status', result[0].statusCode, {
        structuredData: true,
      });

      return result;
    } catch (error) {
      logger.error('mail failed', error, {
        structuredData: true,
      });

      throw error;
    }
  });

export default onCreateAdminNotify;
