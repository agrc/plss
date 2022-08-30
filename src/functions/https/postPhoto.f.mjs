import { warn, info, error as logError } from 'firebase-functions/logger';
import { onCall } from 'firebase-functions/v1/https';
import { HttpsError } from 'firebase-functions/v1/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const postPhoto = onCall(async (data, context) => {
  if (!context.auth) {
    warn('unauthenticated request', { structuredData: true });

    throw new HttpsError('unauthenticated', 'You must log in');
  }

  data.created_at = new Date();
  info('uploading image', data, context.auth.uid, {
    structuredData: true,
  });

  try {
    const storage = getStorage();
  } catch (error) {
    logError('error storing image', error, context.auth, {
      structuredData: true,
    });

    throw new HttpsError('internal', 'Your image was not saved');
  }

  // try {
  //   const db = getFirestore();

  //   await db
  //     .collection('submitters')
  //     .doc(context.auth.uid)
  //     .collection('points')
  //     .add(data);
  // } catch (error) {
  //   logError('error adding point', error, context.auth, {
  //     structuredData: true,
  //   });

  //   throw new HttpsError('internal', 'Your point was not saved');
  // }

  return 1;
});

export default postPhoto;
