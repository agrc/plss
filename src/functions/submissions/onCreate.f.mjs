import { logger, firestore } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import got from 'got';

const client = got.extend({
  prefixUrl:
    'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services',
  responseType: 'json',
  resolveBodyOnly: true,
});

const getCountyFromId = async (id) => {
  // query points for shape
  const featureSet = await client
    .get('PLSSPoint_AGRC/FeatureServer/0/query', {
      searchParams: {
        where: `POINTID='${id}'`,
        returnGeometry: true,
        f: 'json',
      },
    })
    .json();

  logger.debug('featureSet', featureSet, { structuredData: true });

  // query county for name
  const countyFeatureSet = await client
    .get('UtahCountyBoundaries/FeatureServer/0/query', {
      searchParams: {
        where: '',
        fields: 'name',
        geometry: JSON.stringify(featureSet.features[0].geometry),
        geometryType: 'esriGeometryPoint',
        spatialRel: 'esriSpatialRelIntersects',
        returnGeometry: false,
        f: 'json',
      },
    })
    .json();

  logger.debug('countyFeatureSet', countyFeatureSet, { structuredData: true });

  return countyFeatureSet.features[0].attributes['NAME'];
};

const onCreateUpdateCounty = firestore
  .document('/submissions/{docId}')
  .onCreate(async (snap, context) => {
    const blmPointId = snap.data().blmPointId;

    logger.info('getting county for new document', blmPointId, {
      structuredData: true,
    });

    const db = getFirestore();
    const doc = await db.collection('submissions').doc(context.params.docId);

    // exit if county already set
    if (doc.data().county) {
      return;
    }

    const county = await getCountyFromId(blmPointId);

    logger.info('setting county', county, {
      structuredData: true,
    });

    const result = await doc.update({ county });

    return result;
  });

export default onCreateUpdateCounty;
