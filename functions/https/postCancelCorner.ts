import type { DocumentData } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { https, logger } from 'firebase-functions/v2';
import { safelyInitializeApp } from '../firebase.js';

const config = safelyInitializeApp();
const db = getFirestore();

type CancelCornerRequest = {
  key?: string;
};

export const cancelCorner = async (
  data: CancelCornerRequest,
  uid: string,
): Promise<0 | 1> => {
  logger.info('validating corner cancellation', { data, uid });

  if (!data.key) {
    throw new https.HttpsError(
      'invalid-argument',
      'corner submission data is invalid',
    );
  }

  try {
    const reference = db.collection('submissions').doc(data.key);
    const snapshot = await reference.get();

    if (!snapshot.exists) {
      throw new https.HttpsError('not-found', 'corner submission not found');
    }

    const record = snapshot.data();
    if (!record) {
      throw new https.HttpsError('not-found', 'corner submission not found');
    }

    if (
      record.status?.ugrc?.reviewedAt ||
      record.status?.county?.reviewedAt ||
      record.published === true ||
      record.sgid.approved === true
    ) {
      logger.info('skipping cancellation because of status', {
        status: record.status,
        published: record.published,
      });

      return 0;
    }

    logger.debug('cancelling submission', { key: data.key });

    await reference.set(
      { status: { user: { cancelled: new Date() } } },
      { merge: true },
    );
    await removeStorage(uid, record);
  } catch (error) {
    logger.error('error finding submission', { error });

    throw new https.HttpsError('internal', 'The submission was not cancelled');
  }

  return 1;
};

export const removeStorage = async (
  user: string,
  submission: DocumentData,
): Promise<void> => {
  const bucket = getStorage().bucket(config.storageBucket);
  const prefix = `submitters/${user}/${submission.type}/${submission.blm_point_id}/`;

  logger.debug('deleting submission files', { prefix });

  try {
    await bucket.deleteFiles({ force: true, prefix });
  } catch (error) {
    logger.warn('had trouble deleting file', { error });
  }
};