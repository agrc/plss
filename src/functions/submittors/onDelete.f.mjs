import { auth, logger, storage } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

const syncProfileImage = storage
  .bucket(process.env.VITE_FIREBASE_STORAGE_BUCKET)
  .object()
  .onDelete(async (object) => {
    const { name } = object;

    logger.info('storage object deleted', name, { structuredData: true });

    const match = /submitters\/(?<uid>.+)\/profile\/seal\.(png|jpe?g)$/.exec(
      name
    );

    if (!match) {
      return;
    }

    try {
      const docRef = await db.collection('submitters').doc(match.groups.uid);
      await docRef.update({ seal: '' });
      logger.info('seal path removed');
    } catch (error) {
      logger.error('error syncing seal photo', error, {
        structuredData: true,
      });

      throw new auth.HttpsError('internal', 'error syncing seal photo');
    }
  });

export default syncProfileImage;
