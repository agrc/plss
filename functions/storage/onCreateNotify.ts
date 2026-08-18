import type { ClientRequest } from '@sendgrid/client/src/request.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions/v2';
import {
  getBase64EncodedAttachment,
  getContactsToNotify,
  notify,
} from '../emailHelpers.js';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();

type SubmissionSummary = {
  type: string;
  submitted_by: { name: string };
  blm_point_id: string;
  county: string;
};

const getDocument = async (documentId: string): Promise<SubmissionSummary> => {
  try {
    const reference = db.collection('submissions').doc(documentId);
    const snapshot = await reference.get();
    const data = snapshot.data();

    if (data) {
      return {
        type: data.type,
        submitted_by: data.submitted_by,
        blm_point_id: data.blm_point_id,
        county: data.county,
      };
    }
  } catch (error) {
    logger.error('error querying for submission', { error, documentId });
  }

  return {
    type: 'unknown',
    submitted_by: { name: 'unknown' },
    blm_point_id: 'unknown',
    county: 'unknown',
  };
};

export const createNotify = async (
  name: string,
  { documentId, pointId }: { documentId: string; pointId: string },
  fileBucket: string,
  contentType: string,
): Promise<unknown> => {
  const bucket = getStorage().bucket(fileBucket);

  const record = await getDocument(documentId);
  const content = await getBase64EncodedAttachment(
    bucket.file(name).createReadStream(),
  );

  const to = await getContactsToNotify(db, null);

  if (to.length === 0) {
    logger.error('no contacts to notify');

    return;
  }

  const template: ClientRequest = {
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
            county: record.county ?? 'unknown',
          },
        },
      ],
      attachments: [
        {
          content: content.toString(),
          filename: `${pointId}.pdf`,
          type: contentType,
          disposition: 'attachment',
        },
      ],
    },
  };

  const templateData = template.body?.personalizations?.[0]?.dynamic_template_data;

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