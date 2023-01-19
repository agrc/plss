import { auth, https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import setupFirebase from '../firebase.mjs';

setupFirebase();
const db = getFirestore();

const getProfile = https.onCall(async (_, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  let profile = {
    displayName: context.auth.token.displayName,
    email: context.auth.token.email,
    license: '',
    seal: '',
  };

  try {
    const snapshot = await db
      .collection('submitters')
      .doc(context.auth.uid)
      .get();

    profile = snapshot.data();
  } catch (error) {
    logger.error('error querying profile', error, context.auth, {
      structuredData: true,
    });
  }

  if (!profile) {
    logger.warn('profile is empty', profile, {
      structuredData: true,
    });

    throw new https.HttpsError(
      'failed-precondition',
      'profile has not been written yet'
    );
  }

  return profile;
});

export default getProfile;
