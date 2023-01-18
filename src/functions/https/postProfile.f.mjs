import { auth, https, logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { profileSchema } from '../../components/pageElements/CornerSubmission/Schema.mjs';
import setupFirebase from '../firebase.mjs';

setupFirebase();
const db = getFirestore();
const options = {
  stripUnknown: true,
  abortEarly: false,
};

const postProfile = https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  if (!data) {
    logger.warn('profile data empty', {
      structuredData: true,
    });

    throw new https.HttpsError(
      'invalid-argument',
      'The profile data is missing'
    );
  }

  logger.info('validating profile data', data, context.auth.uid, {
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

    throw new auth.HttpsError(
      'invalid-argument',
      'form data is invalid',
      error
    );
  }

  const doc = formatDataForFirestore(data);

  logger.info('saving profile', doc, context.auth, {
    structuredData: true,
  });

  try {
    const docRef = await db.collection('submitters').doc(context.auth.uid);
    await docRef.update(doc);
  } catch (error) {
    logger.error('error saving profile', error, doc, {
      structuredData: true,
    });

    throw new auth.HttpsError('internal', 'The profile was not saved');
  }

  return doc;
});

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

export default postProfile;
