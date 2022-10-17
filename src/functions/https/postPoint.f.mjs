import { auth, https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';

const postPoint = https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  data.created_at = new Date();
  logger.info('creating point', data, context.auth.uid, {
    structuredData: true,
  });

  try {
    const db = getFirestore();

    await db
      .collection('submitters')
      .doc(context.auth.uid)
      .collection('points')
      .add(data);
  } catch (error) {
    logger.error('error adding point', error, context.auth, {
      structuredData: true,
    });

    throw new auth.HttpsError('internal', 'Your point was not saved');
  }

  return 1;
});

export default postPoint;
