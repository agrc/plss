import {
  profileSchema,
  type Profile,
} from '@ugrc/plss-shared/corner-submission/schema';
import { getFirestore } from 'firebase-admin/firestore';
import { https, logger } from 'firebase-functions/v2';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  stripUnknown: true,
  abortEarly: false,
};

type ProfileDocument = {
  displayName: string;
  email: string;
  license: string | null;
  seal: string | null;
};

export const updateProfile = async (
  data: unknown,
  uid: string,
): Promise<ProfileDocument> => {
  logger.info('validating profile data', { data, uid });

  let profile: Profile;
  try {
    profile = await profileSchema.validate(data, options);
    logger.debug('validation result', { result: profile });
  } catch (error) {
    logger.error('validation error', { error });

    throw new https.HttpsError(
      'invalid-argument',
      'form data is invalid',
      error,
    );
  }

  const doc = formatDataForFirestore(profile);

  logger.info('saving profile', { doc, uid });

  try {
    const docRef = db.collection('submitters').doc(uid);
    await docRef.update(doc);
  } catch (error) {
    logger.error('error saving profile', { error, doc });

    throw new https.HttpsError('internal', 'The profile was not saved');
  }

  return doc;
};

export const validate = async (data: unknown): Promise<void> => {
  await profileSchema.validate(data, options);
};

const formatDataForFirestore = (data: Profile): ProfileDocument => ({
  displayName: data.displayName,
  email: data.email,
  license: data.license ?? null,
  seal: data.seal ?? null,
});
