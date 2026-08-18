import type { DocumentData } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { graphicConverter, myContentConverter } from '../converters.js';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();

export const myContent = async (
  uid: string,
): Promise<{ submissions: DocumentData[]; points: DocumentData[] }> => {
  const points: DocumentData[] = [];
  const submissions: DocumentData[] = [];

  try {
    const snapshot = await db
      .collection('submitters')
      .doc(uid)
      .collection('points')
      .withConverter(graphicConverter)
      .get();

    if (snapshot.empty) {
      logger.debug('user points are empty', { uid });
    } else {
      snapshot.forEach((doc) => {
        points.push(doc.data());
      });
    }
  } catch (error) {
    logger.error('error querying points', { error, uid });
  }

  try {
    const filter = db
      .collectionGroup('submissions')
      .where('submitted_by.id', '==', uid)
      .where('status.user.cancelled', '==', null);

    const snapshot = await filter.withConverter(myContentConverter).get();

    if (snapshot.empty) {
      logger.debug('user submissions are empty', { uid });
    } else {
      snapshot.forEach((doc) => {
        submissions.push(doc.data());
      });
    }
  } catch (error) {
    logger.error('error querying submissions', { error, uid });
  }

  return { submissions, points };
};
