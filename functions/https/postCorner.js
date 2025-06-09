import { https, logger } from 'firebase-functions/v2';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import { parseDms } from 'dms-conversion';
import * as schemas from '../shared/cornerSubmission/Schema.js';
import { formatDegrees } from '../shared/index.js';
import { safelyInitializeApp } from '../firebase.js';

safelyInitializeApp();
const db = getFirestore();
const options = {
  stripUnknown: true,
  abortEarly: false,
};

export const saveCorner = async (data, auth) => {
  logger.info('validating corner submission', data, auth.uid, {
    structuredData: true,
  });

  try {
    const result = await validateSubmission(data);
    logger.debug('corner validation result', result, {
      structuredData: true,
    });
  } catch (error) {
    logger.error('corner validation error', error, {
      structuredData: true,
    });

    throw new https.HttpsError(
      'invalid-argument',
      'corner submission data is invalid',
      error,
    );
  }

  logger.debug('formatting corner document', data.type, {
    structuredData: true,
  });

  const doc = formatDataForFirestore(data, auth);

  logger.info('saving corner submission', doc, auth, {
    structuredData: true,
  });

  try {
    await db.collection('submissions').add(doc);
  } catch (error) {
    logger.error('error saving corner', error, doc, {
      structuredData: true,
    });

    throw new https.HttpsError('internal', 'The corner was not saved');
  }

  return 1;
};

export const validateSubmission = async (data) => {
  await schemas.cornerData.validate(data, options);

  if (data.type === 'new') {
    return await validateNewSubmission(data);
  } else if (data.type === 'existing') {
    return await validateExistingSubmission(data);
  }

  throw Error('Invalid submission type');
};

export const validateNewSubmission = async (data) => {
  await schemas.metadataSchema.validate(data?.metadata, options);
  await schemas.coordinatePickerSchema.validate(data, options);
  await schemas.geographicHeightSchema.validate(data?.geographic, options);
  await schemas.longitudeSchema.validate(data?.geographic, options);
  await schemas.latitudeSchema.validate(data?.geographic, options);
  await schemas.gridCoordinatesSchema.validate(data?.grid, options);
  await schemas.imagesSchema.validate(data?.images, options);

  return true;
};

export const validateExistingSubmission = async (data) => {
  await schemas.existingSheetSchema.validate(data?.existing, options);

  // coordinates are not required for existing corners
  if (data.datum) {
    await schemas.coordinatePickerSchema.validate(data, options);
    await schemas.geographicHeightSchema.validate(data?.geographic, options);
    await schemas.longitudeSchema.validate(data?.geographic, options);
    await schemas.latitudeSchema.validate(data?.geographic, options);
    await schemas.gridCoordinatesSchema.validate(data?.grid, options);
  }

  return true;
};

export const formatDataForFirestore = (data, user) => {
  const metadata = {
    created_at: new Date(),
    blm_point_id: data.blmPointId,
    county: data.county,
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
    return formatNewCorner(data, metadata);
  } else if (data.type === 'existing') {
    return formatExistingCorner(data, metadata);
  }

  throw Error('Invalid submission type');
};

export const formatNewCorner = (data, metadata) => {
  const [y, x] = getLatLon(data.geographic);

  let record = {
    type: 'new',
    ...metadata,
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

export const convertUndefinedToNull = (obj) => {
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
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === undefined) {
        obj[key] = null;
      } else {
        obj[key] = convertUndefinedToNull(obj[key]);
      }
    }
  }
  return obj;
};

export const formatExistingCorner = (data, metadata) => {
  let record = { ...metadata, pdf: data.existing.pdf, type: 'existing' };

  if (!record.metadata) {
    record.metadata = {};
  }
  record.metadata.mrrc = data.existing.mrrc;

  if (data.datum) {
    const [y, x] = getLatLon(data.geographic);

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

export const getLatLon = (data) => {
  if (!data || !data.northing || !data.easting) {
    return null;
  }

  const dms = [
    `${formatDegrees(data.northing)} N`,
    `${formatDegrees(data.easting)} W`,
  ];

  return dms.map(parseDms);
};
