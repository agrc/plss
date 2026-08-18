import { GeoPoint, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import ky from 'ky';
import { safelyInitializeApp } from '../../firebase.js';

safelyInitializeApp();

const client = ky.extend({
  prefix: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services',
  timeout: 40000,
  retry: 3,
});

type FeatureSet = {
  features: Array<{
    geometry: {
      x: number;
      y: number;
    };
  }>;
};

const getLocationFromId = async (id: string): Promise<GeoPoint | null> => {
  const featureSet = await client
    .get('UtahPLSSGCDBPoints/FeatureServer/0/query', {
      searchParams: {
        where: `POINTID='${id}'`,
        returnGeometry: true,
        outSR: 4326,
        f: 'json',
      },
    })
    .json<FeatureSet>();

  logger.debug('featureSet', { featureSet });

  const feature = featureSet.features[0];
  if (!feature) {
    return null;
  }

  return new GeoPoint(feature.geometry.y, feature.geometry.x);
};

export const createAddLocation = async (
  id: string,
  blmPointId: string,
): Promise<void> => {
  const db = getFirestore();
  const doc = db.collection('submissions').doc(id);

  const location = await getLocationFromId(blmPointId);

  logger.debug(
    '[database::submissions::onCreateAddLocation] setting location',
    { location },
  );

  await doc.update({ location });
};
