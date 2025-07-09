import { https, logger } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { profileSchema } from '../shared/cornerSubmission/Schema.js';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  stripUnknown: true,
  abortEarly: false,
};

export const updateProfile = async (data, uid) => {
  logger.info('validating profile data', { data, uid });

  try {
    const result = await validate(data);
    logger.debug('validation result', { result });
  } catch (error) {
    logger.error('validation error', { error });

    throw new https.HttpsError(
      'invalid-argument',
      'form data is invalid',
      error,
    );
  }

  const doc = formatDataForFirestore(data);

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

export const validate = async (data) => {
  await profileSchema.validate(data, options);
};

const formatDataForFirestore = (data) => {
  return {
    displayName: data.displayName,
    email: data.email,
    license: data?.license ?? null,
    seal: data?.seal ?? null,
  };
};
