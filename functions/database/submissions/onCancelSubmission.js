import { logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { safelyInitializeApp } from '../../firebase.js';
import { getContactsToNotify, notify } from '../../emailHelpers.mjs';

safelyInitializeApp();
const db = getFirestore();

export const cancelSubmission = async (before) => {
  // only email ugrc with empty county
  const to = await getContactsToNotify(db, null);

  const template = {
    method: 'post',
    url: '/v3/mail/send',
    body: {
      template_id: 'd-88f9bc055fe04135980694ad7f29b164',
      from: {
        email: 'ugrc-plss-administrators@utah.gov',
        name: 'UGRC PLSS Administrators',
      },
      personalizations: [
        {
          to,
          dynamic_template_data: {
            type: before.get('type'),
            surveyor: before.get('submitted_by.name'),
            blmPointId: before.get('blm_point_id'),
          },
        },
      ],
    },
  };

  const templateData = template.body.personalizations[0].dynamic_template_data;

  logger.debug('sending notification email to', to, templateData, {
    structuredData: true,
  });

  try {
    const result = await notify(
      process.env.SENDGRID_API_KEY ?? 'null',
      template,
    );

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
};
