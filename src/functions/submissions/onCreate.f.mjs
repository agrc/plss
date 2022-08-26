import { getFirestore } from 'firebase-admin/firestore';
import { document } from 'firebase-functions/v1/firestore';
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

  return countyFeatureSet.features[0].attributes['NAME'];
};

const onCreateUpdateCounty = document('/submissions/{docId}').onCreate(
  async (snap, context) => {
    const blmPointId = snap.data().blmPointId;

    const db = getFirestore();
    const doc = await db.collection('submissions').doc(context.params.docId);

    const county = await getCountyFromId(blmPointId);

    const result = await doc.update({ county });

    return result;
  }
);

export default onCreateUpdateCounty;
