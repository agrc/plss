import { https, logger } from 'firebase-functions/v2';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import type { DocumentData } from 'firebase-admin/firestore';
import type { AuthData } from 'firebase-functions/tasks';
import { parseDms } from 'dms-conversion';
import * as schemas from '@ugrc/plss-shared/corner-submission/schema';
import { formatDegrees } from '@ugrc/plss-shared';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  stripUnknown: true,
  abortEarly: false,
};

type Dms = {
  degrees: number;
  minutes: number;
  seconds: number;
};

type GeographicInput = {
  northing: Dms;
  easting: Dms;
  unit: string;
  elevation: number;
};

type GridInput = {
  northing: number;
  easting: number;
  zone: string;
  unit: string;
  elevation?: number;
  verticalDatum?: string;
};

type CornerSubmissionInput = {
  type: 'new' | 'existing';
  blmPointId: string;
  county: string;
  datum?: string;
  metadata: DocumentData;
  geographic: GeographicInput;
  grid: GridInput;
  images: DocumentData;
  existing: {
    pdf: string;
    mrrc: boolean;
  };
};

type SubmissionAuth = AuthData & {
  displayName?: string;
};

export const saveCorner = async (
  data: unknown,
  auth: SubmissionAuth,
): Promise<1> => {
  logger.info('validating corner submission', { data, uid: auth.uid });

  try {
    const result = await validateSubmission(data);
    logger.debug('corner validation result', { result });
  } catch (error) {
    logger.error('corner validation error', { error });

    throw new https.HttpsError(
      'invalid-argument',
      'corner submission data is invalid',
      error,
    );
  }

  const submission = data as CornerSubmissionInput;
  logger.debug('formatting corner document', { type: submission.type });

  const doc = formatDataForFirestore(submission, auth);

  logger.info('saving corner submission', { doc, auth });

  try {
    await db.collection('submissions').add(doc);
  } catch (error) {
    logger.error('error saving corner', { error, doc });

    throw new https.HttpsError('internal', 'The corner was not saved');
  }

  return 1;
};

export const validateSubmission = async (data: unknown): Promise<true> => {
  await schemas.cornerData.validate(data, options);

  if (!data || typeof data !== 'object' || !('type' in data)) {
    throw new Error('Invalid submission type');
  }

  if (data.type === 'new') {
    return await validateNewSubmission(data);
  } else if (data.type === 'existing') {
    return await validateExistingSubmission(data);
  }

  throw Error('Invalid submission type');
};

export const validateNewSubmission = async (data: unknown): Promise<true> => {
  const submission = data as Partial<CornerSubmissionInput> | undefined;
  await schemas.metadataSchema.validate(submission?.metadata, options);
  await schemas.coordinatePickerSchema.validate(submission, options);
  await schemas.geographicHeightSchema.validate(
    submission?.geographic,
    options,
  );
  await schemas.longitudeSchema.validate(submission?.geographic, options);
  await schemas.latitudeSchema.validate(submission?.geographic, options);
  await schemas.gridCoordinatesSchema.validate(submission?.grid, options);
  await schemas.imagesSchema.validate(submission?.images, options);

  return true;
};

export const validateExistingSubmission = async (
  data: unknown,
): Promise<true> => {
  const submission = data as Partial<CornerSubmissionInput> | undefined;
  await schemas.existingSheetSchema.validate(submission?.existing, options);

  // coordinates are not required for existing corners
  if (submission?.datum) {
    await schemas.coordinatePickerSchema.validate(submission, options);
    await schemas.geographicHeightSchema.validate(
      submission.geographic,
      options,
    );
    await schemas.longitudeSchema.validate(submission.geographic, options);
    await schemas.latitudeSchema.validate(submission.geographic, options);
    await schemas.gridCoordinatesSchema.validate(submission.grid, options);
  }

  return true;
};

export const formatDataForFirestore = (
  data: CornerSubmissionInput,
  user: SubmissionAuth,
): DocumentData => {
  const defaults = {
    created_at: new Date(),
    blm_point_id: data.blmPointId,
    county: data.county,
    published: false,
    status: {
      ugrc: {
        approved: null,
        comments: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      county: {
        approved: null,
        comments: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      sgid: {
        approved: null,
      },
      user: {
        cancelled: null,
      },
    },
    submitted_by: {
      id: user.uid,
      name: user.token?.name || user.displayName,
      ref: db.collection('submitters').doc(user.uid),
    },
  };

  if (data.type === 'new') {
    return formatNewCorner(data, defaults);
  } else if (data.type === 'existing') {
    return formatExistingCorner(data, defaults);
  }

  throw Error('Invalid submission type');
};

export const formatNewCorner = (
  data: CornerSubmissionInput,
  defaults: DocumentData,
): DocumentData => {
  const coordinates = getLatLon(data.geographic);
  if (!coordinates) {
    throw new Error('Geographic coordinates are required');
  }
  const [y, x] = coordinates;

  const record = {
    type: 'new',
    ...defaults,
    location: new GeoPoint(y, x),
    metadata: {
      status: data.metadata.status,
      accuracy: data.metadata.accuracy,
      collected: data.metadata.collected,
      description: data.metadata.description,
      notes: data.metadata.notes,
      mrrc: data.metadata.mrrc,
      section: data.metadata.section,
      corner: data.metadata.corner,
    },
    datum: data.datum,
    grid: convertUndefinedToNull({
      northing: data.grid.northing,
      easting: data.grid.easting,
      zone: data.grid.zone,
      unit: data.grid.unit,
      elevation: data.grid.elevation,
      verticalDatum: data.grid.verticalDatum,
    }),
    geographic: convertUndefinedToNull({
      northing: {
        degrees: data.geographic.northing.degrees,
        minutes: data.geographic.northing.minutes,
        seconds: data.geographic.northing.seconds,
      },
      easting: {
        degrees: data.geographic.easting.degrees,
        minutes: data.geographic.easting.minutes,
        seconds: data.geographic.easting.seconds,
      },
      unit: data.geographic.unit,
      elevation: data.geographic.elevation,
    }),
    images: {
      map: data.images.map,
      monument: data.images.monument,
      closeUp: data.images.closeUp,
      extra1: data.images.extra1,
      extra2: data.images.extra2,
      extra3: data.images.extra3,
      extra4: data.images.extra4,
      extra5: data.images.extra5,
      extra6: data.images.extra6,
      extra7: data.images.extra7,
      extra8: data.images.extra8,
      extra9: data.images.extra9,
      extra10: data.images.extra10,
    },
  };

  return record;
};

export const convertUndefinedToNull = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== 'object') {
    return obj === undefined ? null : obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = convertUndefinedToNull(obj[i]);
    }
    return obj;
  }

  // Handle objects
  const record = obj as Record<string, unknown>;
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      if (record[key] === undefined) {
        record[key] = null;
      } else {
        record[key] = convertUndefinedToNull(record[key]);
      }
    }
  }
  return record;
};

export const formatExistingCorner = (
  data: CornerSubmissionInput,
  defaults: DocumentData,
): DocumentData => {
  let record: DocumentData = {
    ...defaults,
    pdf: data.existing.pdf,
    type: 'existing',
  };

  if (!record.metadata) {
    record.metadata = {};
  }
  record.metadata.mrrc = data.existing.mrrc;

  if (data.datum) {
    const coordinates = getLatLon(data.geographic);
    if (!coordinates) {
      throw new Error('Geographic coordinates are required');
    }
    const [y, x] = coordinates;

    record = Object.assign(record, {
      datum: data.datum,
      location: new GeoPoint(y, x),
      grid: convertUndefinedToNull({
        northing: data.grid.northing,
        easting: data.grid.easting,
        zone: data.grid.zone,
        unit: data.grid.unit,
        elevation: data.grid.elevation,
        verticalDatum: data.grid.verticalDatum,
      }),
      geographic: convertUndefinedToNull({
        northing: {
          degrees: data.geographic.northing.degrees,
          minutes: data.geographic.northing.minutes,
          seconds: data.geographic.northing.seconds,
        },
        easting: {
          degrees: data.geographic.easting.degrees,
          minutes: data.geographic.easting.minutes,
          seconds: data.geographic.easting.seconds,
        },
        unit: data.geographic.unit,
        elevation: data.geographic.elevation,
      }),
    });
  }

  return record;
};

export const getLatLon = (
  data?: Partial<GeographicInput>,
): [number, number] | null => {
  if (!data || !data.northing || !data.easting) {
    return null;
  }

  const dms = [
    `${formatDegrees(data.northing)} N`,
    `${formatDegrees(data.easting)} W`,
  ];

  return [parseDms(dms[0]), parseDms(dms[1])];
};
