import { logger } from 'firebase-functions/v1';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import ky from 'ky';
import { safelyInitializeApp } from '../../firebase.js';

safelyInitializeApp();

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

export const createAddLocation = async (id, blmPointId) => {
  const db = getFirestore();
  const doc = db.collection('submissions').doc(id);

  const location = await getLocationFromId(blmPointId);

  logger.debug(
    '[database::submissions::onCreateAddLocation] setting location',
    location,
    {
      structuredData: true,
    },
  );

  const result = await doc.update({ location });

  return result;
};
