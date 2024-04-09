import { https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { profileSchema } from '../../src/components/pageElements/CornerSubmission/Schema.mjs';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  stripUnknown: true,
  abortEarly: false,
};

export const updateProfile = async (data, uid) => {
  logger.info('validating profile data', data, uid, {
    structuredData: true,
  });

  try {
    const result = await validate(data);
    logger.debug('validation result', result, {
      structuredData: true,
    });
  } catch (error) {
    logger.error('validation error', error, {
      structuredData: true,
    });

    throw new https.HttpsError(
      'invalid-argument',
      'form data is invalid',
      error,
    );
  }

  const doc = formatDataForFirestore(data);

  logger.info('saving profile', doc, uid, {
    structuredData: true,
  });

  try {
    const docRef = db.collection('submitters').doc(uid);
    await docRef.update(doc);
  } catch (error) {
    logger.error('error saving profile', error, doc, {
      structuredData: true,
    });

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
    license: data?.license,
    seal: data?.seal,
  };
};
