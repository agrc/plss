import { https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { safelyInitializeApp } from '../firebase.js';

const config = safelyInitializeApp();
const db = getFirestore();

export const cancelCorner = async (data, uid) => {
  logger.info('validating corner cancellation', data, uid, {
    structuredData: true,
  });

  if (!data.key) {
    throw new https.HttpsError(
      'invalid-argument',
      'corner submission data is invalid',
    );
  }

  try {
    const reference = db.collection('submissions').doc(data.key);
    const snapshot = await reference.get();

    logger.debug('cancelling submission', data.key, {
      structuredData: true,
    });

    await reference.set(
      { status: { user: { cancelled: new Date() } } },
      { merge: true },
    );
    await removeStorage(uid, snapshot.data());
  } catch (error) {
    logger.error('error finding submission', error, {
      structuredData: true,
    });

    throw new https.HttpsError('internal', 'The submission was not cancelled');
  }

  return 1;
};

export const removeStorage = async (user, submission) => {
  const bucket = getStorage().bucket(config.storageBucket);
  const prefix = `submitters/${user}/${submission.type}/${submission.blm_point_id}/`;

  logger.debug('deleting submission files', prefix, {
    structuredData: true,
  });

  await bucket.deleteFiles(
    {
      force: true,
      prefix,
    },
    (error) => {
      logger.warn('had trouble deleting file', error, {
        structuredData: true,
      });
    },
  );
};
