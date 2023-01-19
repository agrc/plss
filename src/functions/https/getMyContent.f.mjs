import { auth, https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { graphicConverter, myContentConverter } from '../converters.mjs';
import setupFirebase from '../firebase.mjs';

setupFirebase();
const db = getFirestore();

const getMyContent = https.onCall(async (_, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  const points = [];
  const submissions = [];

  try {
    const snapshot = await db
      .collection('submitters')
      .doc(context.auth.uid)
      .collection('points')
      .withConverter(graphicConverter)
      .get();

    if (snapshot.empty) {
      logger.debug('user points are empty', context.auth.uid, {
        structuredData: true,
      });
    } else {
      snapshot.forEach((doc) => {
        const item = doc.data();
        points.push(item);
      });
    }
  } catch (error) {
    logger.error('error querying points', error, context.auth, {
      structuredData: true,
    });
  }

  try {
    let filter = db
      .collectionGroup('submissions')
      .where('submitted_by.id', '==', context.auth.uid)
      .where('status.user.cancelled', '==', null);

    const snapshot = await filter.withConverter(myContentConverter).get();

    if (snapshot.empty) {
      logger.debug('user submissions are empty', context.auth.uid, {
        structuredData: true,
      });
    } else {
      snapshot.forEach((doc) => {
        submissions.push(doc.data());
      });
    }
  } catch (error) {
    logger.error('error querying submissions', error, context.auth, {
      structuredData: true,
    });
  }

  return { submissions, points };
});

export default getMyContent;
