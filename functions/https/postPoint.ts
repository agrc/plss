import {
  addPointSchema,
  type AddPoint,
} from '@ugrc/plss-shared/corner-submission/schema';
import { getFirestore } from 'firebase-admin/firestore';
import { https, logger } from 'firebase-functions';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  abortEarly: false,
};

type CallableAuth = NonNullable<CallableRequest['auth']>;
type PointSubmission = AddPoint & Record<string, unknown>;

export const savePoint = async (
  data: unknown,
  auth: CallableAuth,
): Promise<1> => {
  logger.info('validating reference point submission', { data, uid: auth.uid });

  let submission: PointSubmission;
  try {
    submission = (await addPointSchema.validate(
      data,
      options,
    )) as PointSubmission;
    logger.debug('reference point validation result', { result: submission });
  } catch (error) {
    logger.error('reference point validation error', { error });

    throw new https.HttpsError(
      'invalid-argument',
      'reference point data is invalid',
      error,
    );
  }

  const doc = formatDataForFirestore(submission);

  logger.info('saving reference point', { doc, auth });

  try {
    await db
      .collection('submitters')
      .doc(auth.uid)
      .collection('points')
      .add(doc);
  } catch (error) {
    logger.error('error adding reference point', { error, auth });

    throw new https.HttpsError(
      'internal',
      'Your reference point was not saved',
    );
  }

  return 1;
};

export const formatDataForFirestore = (data: PointSubmission) => {
  const photos = Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) =>
        key.startsWith('photo') &&
        typeof value === 'string' &&
        value.length > 0,
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