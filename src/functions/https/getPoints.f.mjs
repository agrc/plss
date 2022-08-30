import { warn, error as logError } from 'firebase-functions/logger';
import { onCall } from 'firebase-functions/v1/https';
import { HttpsError } from 'firebase-functions/v1/auth';
import { getFirestore } from 'firebase-admin/firestore';
import initializeApp from '../firebase.mjs';
import { graphicConverter } from '../converters.mjs';

initializeApp();

const getPoints = onCall(async (_, context) => {
  if (!context.auth) {
    warn('unauthenticated request', { structuredData: true });

    throw new HttpsError('unauthenticated', 'You must log in');
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
    logError('error querying points', error, context.auth, {
      structuredData: true,
    });

    throw new HttpsError('internal', 'Your points could not be retrieved');
  }

  return points;
});

export default getPoints;
