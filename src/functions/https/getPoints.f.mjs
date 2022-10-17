import { auth, https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import initializeApp from '../firebase.mjs';
import { graphicConverter } from '../converters.mjs';

initializeApp();

const getPoints = https.onCall(async (_, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  const points = [];

  try {
    const db = getFirestore();
    const snapshot = await db
      .collection('submitters')
      .doc(context.auth.uid)
      .collection('points')
      .withConverter(graphicConverter)
      .get();

    snapshot.forEach((doc) => {
      points.push(doc.data());
    });
  } catch (error) {
    logger.error('error querying points', error, context.auth, {
      structuredData: true,
    });

    throw new auth.HttpsError('internal', 'Your points could not be retrieved');
  }

  return points;
});

export default getPoints;
