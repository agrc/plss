import { logger } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { graphicConverter, myContentConverter } from '../converters.js';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();

export const myContent = async (uid) => {
  const points = [];
  const submissions = [];

  try {
    const snapshot = await db
      .collection('submitters')
      .doc(uid)
      .collection('points')
      .withConverter(graphicConverter)
      .get();

    if (snapshot.empty) {
      logger.debug('user points are empty', uid, {
        structuredData: true,
      });
    } else {
      snapshot.forEach((doc) => {
        const item = doc.data();
        points.push(item);
      });
    }
  } catch (error) {
    logger.error('error querying points', error, uid, {
      structuredData: true,
    });
  }

  try {
    let filter = db
      .collectionGroup('submissions')
      .where('submitted_by.id', '==', uid)
      .where('status.user.cancelled', '==', null);

    const snapshot = await filter.withConverter(myContentConverter).get();

    if (snapshot.empty) {
      logger.debug('user submissions are empty', uid, {
        structuredData: true,
      });
    } else {
      snapshot.forEach((doc) => {
        submissions.push(doc.data());
      });
    }
  } catch (error) {
    logger.error('error querying submissions', error, uid, {
      structuredData: true,
    });
  }

  return { submissions, points };
};
