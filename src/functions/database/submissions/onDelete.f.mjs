import { logger, firestore } from 'firebase-functions/v1';
import { getStorage } from 'firebase-admin/storage';

const bucket = getStorage().bucket(process.env.VITE_FIREBASE_STORAGE_BUCKET);

const onCleanUpPointAttachments = firestore
  .document('/submitters/{userId}/points/{docId}')
  .onDelete(async (snap, context) => {
    const document = snap.data();

    logger.debug('onCleanUpPointAttachments', document, context, {
      structuredData: true,
    });

    if ((document.photos?.length ?? 0) < 1) {
      logger.debug('skipping photo clean up. reason: empty');

      return;
    }

    logger.info('deleting reference point blobs', document.photos, {
      structuredData: true,
    });

    for (const photo of document.photos) {
      await bucket.file(photo).delete();
    }
  });

export default onCleanUpPointAttachments;
