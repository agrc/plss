import { logger, runWith } from 'firebase-functions/v1';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import setupFirebase from '../../firebase.mjs';
import { getContactsToNotify, notify } from '../../emailHelpers.mjs';

setupFirebase();
const db = getFirestore();

const sendGridApiKey = defineSecret('SENDGRID_API_KEY');

const onCancelSubmission = runWith({ secrets: [sendGridApiKey] })
  .firestore.document('/submissions/{docId}')
  .onUpdate(async (change, context) => {
    const current = change.after.get('status.user.cancelled');
    const previous = change.before.get('status.user.cancelled');

    logger.debug('trigger: submission document updated', context.params.docId, {
      structuredData: true,
    });

    if (current === null) {
      logger.debug('skipping cancellation email. reason: not cancelled');

      return;
    }

    if (current === previous) {
      logger.debug(
        'skipping cancellation email. reason: status did not change'
      );

      return;
    }

    logger.debug('cancelled before and after', previous, current, {
      structuredData: true,
    });

    const apiSnippet = (process.env.SENDGRID_API_KEY ?? 'null').slice(0, 4);

    logger.debug('runWith', apiSnippet, {
      structuredData: true,
    });

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
              type: change.before.get('type'),
              surveyor: change.before.get('submitted_by.name'),
              blmPointId: change.before.get('blm_point_id'),
            },
          },
        ],
      },
    };

    const templateData =
      template.body.personalizations[0].dynamic_template_data;

    logger.debug('sending notification email to', to, templateData, {
      structuredData: true,
    });

    try {
      const result = await notify(
        process.env.SENDGRID_API_KEY ?? 'null',
        template
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
  });

export default onCancelSubmission;
