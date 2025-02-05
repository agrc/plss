import { https, logger } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();

export const myProfile = async (auth) => {
  let profile = {
    displayName: auth.token.displayName,
    email: auth.token.email,
    license: '',
    seal: '',
  };

  try {
    const snapshot = await db.collection('submitters').doc(auth.uid).get();

    profile = snapshot.data();
  } catch (error) {
    logger.error('error querying profile', error, auth, {
      structuredData: true,
    });
  }

  if (!profile) {
    logger.warn('profile is empty', profile, {
      structuredData: true,
    });

    throw new https.HttpsError(
      'failed-precondition',
      'profile has not been written yet',
    );
  }

  return profile;
};
