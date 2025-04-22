import { logger } from 'firebase-functions/v2';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { safelyInitializeApp } from '../firebase.js';
import {
  getContactsToNotify,
  getBase64EncodedAttachment,
  notify,
} from '../emailHelpers.js';

safelyInitializeApp();
const db = getFirestore();

const getDocument = async (documentId) => {
  try {
    const reference = db.collection('submissions').doc(documentId);

    const snapshot = await reference.get();

    const { type, submitted_by, blm_point_id, county } = snapshot.data();

    return { type, submitted_by, blm_point_id, county };
  } catch (error) {
    logger.error('error querying for submission', error, documentId, {
      structuredData: true,
    });
  }

  return {
    type: 'unknown',
    submitted_by: { name: 'unknown' },
    blm_point_id: 'unknown',
    county: 'unknown',
  };
};

export const createNotify = async (
  name,
  { documentId, pointId },
  fileBucket,
  contentType,
) => {
  const bucket = getStorage().bucket(fileBucket);

  const record = await getDocument(documentId);
  const content = await getBase64EncodedAttachment(
    bucket.file(name).createReadStream(),
  );

  // TODO add document.county to add the county contacts #199
  const to = await getContactsToNotify(db, null);

  if (!to || to.length === 0) {
    logger.error('no contacts to notify', { structuredData: true });

    return;
  }

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
            type: record.type,
            surveyor: record.submitted_by.name,
            blmPointId: record.blm_point_id,
            county: record?.county ?? 'unknown',
          },
        },
      ],
      attachments: [
        {
          content,
          filename: `${pointId}.pdf`,
          type: contentType,
          disposition: 'attachment',
        },
      ],
    },
  };

  const templateData = template.body.personalizations[0].dynamic_template_data;

  logger.debug('sending notification email to', to, templateData, {
    structuredData: true,
  });

  try {
    const result = await notify(process.env.SENDGRID_API_KEY, template);

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
