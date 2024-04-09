import { https, logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { addPointSchema as schema } from '../shared/cornerSubmission/Schema.js';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  abortEarly: false,
};

export const savePoint = async (data, auth) => {
  logger.info('validating reference point submission', data, auth.uid, {
    structuredData: true,
  });

  try {
    const result = await schema.validate(data, options);
    logger.debug('reference point validation result', result, {
      structuredData: true,
    });
  } catch (error) {
    logger.error('reference point validation error', error, {
      structuredData: true,
    });

    throw new https.HttpsError(
      'invalid-argument',
      'reference point data is invalid',
      error,
    );
  }

  logger.debug('formatting reference point document', data.type, {
    structuredData: true,
  });

  const doc = formatDataForFirestore(data, auth);

  logger.info('saving reference point', doc, auth, {
    structuredData: true,
  });

  try {
    await db
      .collection('submitters')
      .doc(auth.uid)
      .collection('points')
      .add(doc);
  } catch (error) {
    logger.error('error adding reference point', error, auth, {
      structuredData: true,
    });

    throw new https.HttpsError(
      'internal',
      'Your reference point was not saved',
    );
  }

  return 1;
};

export const formatDataForFirestore = (data) => {
  const photos = Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) => key.startsWith('photo') && (value?.length ?? 0) > 0,
    ),
  );

  return {
    created_at: new Date(),
    name: data.name,
    notes: data.notes,
    color: data.color,
    location: data.location,
    photos: Object.values(photos),
  };
};
