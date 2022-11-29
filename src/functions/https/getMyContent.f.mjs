import { auth, https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { graphicConverter, myContentConverter } from '../converters.mjs';

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

    snapshot.forEach((doc) => {
      const item = doc.data();
      points.push(item);
    });
  } catch (error) {
    logger.error('error querying points', error, context.auth, {
      structuredData: true,
    });
  }

  logger.debug('successfully queried points', points.length, {
    structuredData: true,
  });

  try {
    const filter = db
      .collection('submissions')
      .where('submitted_by.id', '==', context.auth.uid);

    logger.debug('filter created', `submitted_by.id==${context.auth.uid}`, {
      structuredData: true,
    });

    const snapshot = await filter.withConverter(myContentConverter).get();

    snapshot.forEach((doc) => {
      submissions.push(doc.data());
    });
  } catch (error) {
    logger.error('error querying submissions', error, context.auth, {
      structuredData: true,
    });
  }

  return { submissions, points };
});

export default getMyContent;
