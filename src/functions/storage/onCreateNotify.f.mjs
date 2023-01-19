import { logger, runWith } from 'firebase-functions/v1';
import { getStorage } from 'firebase-admin/storage';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import setupFirebase from '../firebase.mjs';
import {
  getContactsToNotify,
  getBase64EncodedAttachment,
  notify,
} from '../emailHelpers.mjs';

const config = setupFirebase();
const db = getFirestore();

const sendGridApiKey = defineSecret('SENDGRID_API_KEY');

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

const onCreateNotify = runWith({ secrets: [sendGridApiKey] })
  .storage.bucket(config.storageBucket)
  .object()
  .onFinalize(async (object) => {
    const { name, contentType, bucket: fileBucket } = object;

    logger.debug('trigger: storage object created', name, {
      structuredData: true,
    });

    const match =
      /under-review\/(?<pointId>.+)\/(?<userId>.+)\/(?<documentId>.*)\.pdf$/i.exec(
        name
      );

    if (!match) {
      logger.debug('skipping creation notify. reason: not a final pdf');

      return;
    }

    const apiSnippet = (process.env.SENDGRID_API_KEY ?? 'null').slice(0, 4);

    logger.debug('runWith', apiSnippet, {
      structuredData: true,
    });

    const bucket = getStorage().bucket(fileBucket);

    const document = await getDocument(match.groups.documentId);
    const content = await getBase64EncodedAttachment(
      bucket.file(name).createReadStream()
    );

    // TODO add document.county to add the county contacts #199
    const to = await getContactsToNotify(db, null);

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
        attachments: [
          {
            content,
            filename: `${match.groups.pointId}.pdf`,
            type: contentType,
            disposition: 'attachment',
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
  });

export default onCreateNotify;
