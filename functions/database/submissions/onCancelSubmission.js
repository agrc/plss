import { logger } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { safelyInitializeApp } from '../../firebase.js';
import { getContactsToNotify, notify } from '../../emailHelpers.js';

safelyInitializeApp();
const db = getFirestore();

export const cancelSubmission = async (before) => {
  // only email ugrc with empty county
  const to = await getContactsToNotify(db, null);

  if (!to || to.length === 0) {
    logger.error('no contacts to notify');

    return;
  }

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

  logger.debug('sending notification email to', { to, templateData });

  try {
    const result = await notify(
      process.env.SENDGRID_API_KEY ?? 'null',
      template,
    );

    logger.debug('mail sent with status', { statusCode: result[0].statusCode });

    return result;
  } catch (error) {
    logger.error('mail failed', { error });

    throw error;
  }
};
