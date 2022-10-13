import { info, warn, error as logError } from 'firebase-functions/logger';
import { onCall } from 'firebase-functions/v1/https';
import { HttpsError } from 'firebase-functions/v1/auth';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import * as schemas from '../../components/pageElements/CornerSubmission/Schema.mjs';

const postCorner = onCall(async (data, context) => {
  if (!context.auth) {
    warn('unauthenticated request', {
      structuredData: true,
    });

    throw new HttpsError('unauthenticated', 'You must log in');
  }

  // validation
  try {
    const options = {
      stripUnknown: true,
      abortEarly: false,
    };

    await schemas.metadataSchema.validate(data, options);
    await schemas.coordinatePickerSchema.validate(data, options);

    const [datum] = data.datum.split('-');

    if (datum !== 'grid') {
      await schemas.geographicHeightSchema.validate(data, options);
      await schemas.longitudeSchema.validate(data, options);
      await schemas.latitudeSchema.validate(data, options);
    } else {
      await schemas.gridCoordinatesSchema.validate(data, options);
    }
  } catch (error) {
    logError('validation error', error, {
      structuredData: true,
    });

    throw new HttpsError(
      'invalid-argument',
      'form submission data is invalid',
      error
    );
  }

  // supplementals
  // county from point id or TRS or input coordinates
  // project coordinates to what I believe we want them in Geographic Lat Long Height in NAD83 (2011)
  // Grid coordinates should be meters state plane NAD83
  // blm point id extractions

  const db = getFirestore();
  data.created_at = new Date();
  // data.location = new GeoPoint(data.northing.degrees, data.easting.degrees);
  data.submittedBy = {
    id: context.auth.uid,
    name: context.auth.token.name,
    ref: db.collection('submitters').doc(context.auth.uid),
  };

  info('saving corner submission', data, context.auth.uid, {
    structuredData: true,
  });

  try {
    await db.collection('submissions').add(data);
  } catch (error) {
    logError('error saving corner', error, context.auth, {
      structuredData: true,
    });

    throw new HttpsError('internal', 'The corner was not saved');
  }

  return 1;
});

export default postCorner;
