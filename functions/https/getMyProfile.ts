import type { Profile } from '@ugrc/plss-shared/corner-submission/schema';
import { getFirestore } from 'firebase-admin/firestore';
import { https, logger } from 'firebase-functions/v2';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();

type CallableAuth = NonNullable<CallableRequest['auth']>;

export const myProfile = async (
  auth: CallableAuth,
): Promise<Partial<Profile>> => {
  let profile: Partial<Profile> | undefined = {
    displayName: auth.token.displayName as string | undefined,
    email: auth.token.email as string | undefined,
    license: '',
    seal: '',
  };

  try {
    const snapshot = await db.collection('submitters').doc(auth.uid).get();

    profile = snapshot.data() as Partial<Profile> | undefined;
  } catch (error) {
    logger.error('error querying profile', { error, auth });
  }

  if (!profile) {
    logger.warn('profile is empty', { profile });

    throw new https.HttpsError(
      'failed-precondition',
      'profile has not been written yet',
    );
  }

  return profile;
};