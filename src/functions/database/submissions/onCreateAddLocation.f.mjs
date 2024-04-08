import { logger, firestore } from 'firebase-functions/v1';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import ky from 'ky';
import setupFirebase from '../../firebase.mjs';

setupFirebase();

const client = ky.extend({
  prefixUrl:
    'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services',
});

const getLocationFromId = async (id) => {
  // query points for shape
  const featureSet = await client
    .get('UtahPLSSGCDBPoints/FeatureServer/0/query', {
      searchParams: {
        where: `POINTID='${id}'`,
        returnGeometry: true,
        outSR: 4326,
        f: 'json',
      },
    })
    .json();

  logger.debug('featureSet', featureSet, { structuredData: true });

  if (featureSet.features.length === 0) {
    return {};
  }

  return new GeoPoint(
    featureSet.features[0].geometry.y,
    featureSet.features[0].geometry.x,
  );
};

const onCreateAddLocation = firestore
  .document('/submissions/{docId}')
  .onCreate(async (snap, context) => {
    const document = snap.data();

    if (document.type === 'new') {
      logger.debug('skipping location update. reason: new submission');

      return;
    }

    if (document.location) {
      logger.debug(
        'skipping location update. reason: existing submission with coordinates',
      );

      return;
    }

    logger.info('getting location for submission', document.blm_point_id, {
      structuredData: true,
    });

    const db = getFirestore();
    const doc = db.collection('submissions').doc(context.params.docId);

    const location = await getLocationFromId(document.blm_point_id);

    logger.debug('setting location', location, {
      structuredData: true,
    });

    const result = await doc.update({ location });

    return result;
  });

export default onCreateAddLocation;
