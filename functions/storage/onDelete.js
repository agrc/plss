import { https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();

export const syncProfileImage = async (uid) => {
  try {
    const docRef = db.collection('submitters').doc(uid);
    await docRef.update({ seal: '' });
    logger.info('seal path removed');
  } catch (error) {
    logger.error('error syncing seal photo', error, {
      structuredData: true,
    });

    throw new https.HttpsError('internal', 'error syncing seal photo');
  }

  return true;
};
