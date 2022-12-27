import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { auth, https, logger } from 'firebase-functions/v1';
import extractTownshipInformation from '../../components/pageElements/CornerSubmission/blmPointId.mjs';
import { constants, createPdfDocument, getPdfAssets } from '../pdfHelpers.mjs';

const bucket = getStorage().bucket(process.env.VITE_FIREBASE_STORAGE_BUCKET);
const db = getFirestore();
const oneDay = 1000 * 60 * 60 * 24;

const empty = {};
const span = (int) => Array(int).fill(empty);

const postGeneratePreview = https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  //TODO! validate data

  const {
    township,
    range,
    meridian: { name: meridian },
  } = extractTownshipInformation(data.blmPointId);

  const { images, pdfs } = await getPdfAssets(
    bucket,
    db,
    data.images,
    context.auth.uid
  );

  var definition = {
    info: {
      title: 'Monument Record Sheet',
      author: 'Utah Geospatial Resource Center (UGRC)',
      subject: `Monument sheet for ${data.blmPointId}`,
      keywords: 'plss utah tiesheet corner',
    },
    pageOrientation: 'LETTER',
    defaultStyle: {
      font: 'Roboto',
    },
    header: {
      text: 'Monument Record Sheet',
      style: constants.header,
    },
    content: [
      { text: 'for', style: ['text-normal', 'bold', 'center', 'sky-800'] },
      { text: 'Beaver County', style: constants.subHeader },
      {
        table: {
          widths: constants.grid,
          body: [
            [
              {
                text: 'BLM Point Name',
                style: constants.label,
              },
              {
                text: 'Contact Name',
                style: constants.label,
                colSpan: 2,
              },
              ...span(1),
              {
                text: 'License Number',
                style: constants.label,
                colSpan: 2,
              },
              ...span(1),
              {
                text: 'Date',
                style: constants.label,
                colSpan: 2,
              },
              ...span(1),
            ],
            [
              {
                text: data.blmPointId,
                style: constants.value,
              },
              {
                text: context.auth.token.name,
                style: constants.value,
                colSpan: 2,
              },
              ...span(1),
              {
                text: '12312312',
                style: constants.value,
                colSpan: 2,
              },
              ...span(1),
              {
                text: '2022/11/14',
                style: constants.value,
                colSpan: 2,
              },
              ...span(1),
            ],
            [
              {
                text: 'Monument Status',
                style: constants.label,
              },
              {
                image: images.map?.length > 0 ? images.map : constants.map,
                fit: [317, 237],
                rowSpan: 12,
                colSpan: 6,
              },
              ...span(4),
            ],
            [
              { text: data.metadata.status, style: constants.value },
              {
                text: 'Map View Photo or Sketch',
                style: constants.label,
                colSpan: 6,
              },
              ...span(5),
            ],
            [
              {
                style: constants.label,
                columns: [
                  {
                    width: constants.half,
                    text: 'County',
                  },
                  {
                    width: constants.half,
                    text: 'State',
                  },
                ],
              },
            ],
            [
              {
                style: constants.value,
                columns: [
                  {
                    width: constants.half,
                    text: data.county ?? '-',
                  },
                  {
                    width: constants.half,
                    text: 'Utah',
                  },
                ],
              },
            ],
            [
              {
                text: 'Base and Meridian',
                style: constants.label,
              },
            ],
            [{ text: meridian ?? '-', style: constants.value }],
            [
              {
                text: 'Township Range Section',
                style: constants.label,
              },
            ],
            [
              {
                text: `T-${township} R-${range} Section ${data.metadata.section}`,
                style: constants.value,
              },
            ],
            [
              {
                text: 'Corner of Section',
                style: constants.label,
              },
            ],
            [{ text: data.metadata.corner, style: constants.value }],
            [
              {
                text: 'Geographic Coordinates',
                style: constants.label,
              },
            ],
            [
              {
                layout: 'noBorders',
                table: {
                  widths: [77, 85],
                  body: [
                    [
                      {
                        text: 'Latitude (DMS)',
                        style: constants.subLabel,
                      },
                      {
                        text: `${data.geographic.northing.degrees}° ${data.geographic.northing.minutes}' ${data.geographic.northing.seconds}"`,
                        style: constants.value,
                      },
                    ],
                    [
                      {
                        text: 'Longitude (DMS)',
                        style: constants.subLabel,
                      },
                      {
                        text: `${data.geographic.easting.degrees}° ${data.geographic.easting.minutes}' ${data.geographic.easting.seconds}"`,
                        style: constants.value,
                      },
                    ],
                    [
                      {
                        text: 'Ellipsoid Height',
                        style: constants.subLabel,
                      },
                      {
                        text: data.geographic.elevation,
                        style: constants.value,
                      },
                    ],
                    [
                      {
                        text: 'Unit',
                        style: constants.subLabel,
                      },
                      {
                        text: data.geographic.unit,
                        style: constants.value,
                      },
                    ],
                  ],
                },
              },
            ],
          ],
        },
      },
      {
        table: {
          pageBreak: 'after',
          widths: constants.grid,
          body: [
            [
              {
                text: 'Grid Coordinates',
                border: [false, false, false, false],
                style: constants.label,
              },
              {
                image:
                  (images.monument?.length ?? 0) > 0
                    ? images.monument
                    : constants.monument,
                fit: [155, 155],
                border: [false, false, false, true],
                colSpan: 3,
                rowSpan: 6,
              },
              ...span(2),
              {
                image:
                  (images.closeUp?.length ?? 0) > 0
                    ? images.closeUp
                    : constants.close,
                fit: [155, 155],
                border: [false, false, true, true],
                colSpan: 3,
                rowSpan: 6,
              },
              ...span(2),
            ],
            [
              {
                layout: 'noBorders',
                table: {
                  widths: [77, 85],
                  body: [
                    [
                      {
                        text: 'Northing',
                        style: constants.subLabel,
                      },
                      {
                        text: data.grid.northing,
                        style: constants.value,
                      },
                    ],
                    [
                      {
                        text: 'Easting',
                        style: constants.subLabel,
                      },
                      {
                        text: data.grid.easting,
                        style: constants.value,
                      },
                    ],
                    [
                      {
                        text: 'Elevation',
                        style: constants.subLabel,
                      },
                      { text: data.grid.elevation, style: constants.value },
                    ],
                    [
                      {
                        text: 'Units',
                        style: constants.subLabel,
                      },
                      {
                        text: data.grid.unit,
                        style: constants.value,
                      },
                    ],
                  ],
                },
              },
            ],
            [
              {
                style: constants.label,
                columns: [
                  {
                    width: constants.half,
                    text: 'Datum',
                  },
                  {
                    width: constants.half,
                    text: 'Vertical Datum',
                  },
                ],
              },
            ],
            [
              {
                style: constants.value,
                columns: [
                  {
                    width: constants.half,
                    text: 'NAD83',
                  },
                  {
                    width: constants.half,
                    text: data.grid.verticalDatum,
                  },
                ],
              },
            ],
            [
              {
                style: constants.label,
                columns: [
                  {
                    width: constants.half,
                    text: 'CRS',
                  },
                  {
                    width: constants.half,
                    text: 'Zone',
                  },
                ],
              },
            ],
            [
              {
                style: constants.value,
                columns: [
                  {
                    width: constants.half,
                    text: 'NAD83 State Plane',
                  },
                  {
                    width: constants.half,
                    text: data.grid.zone,
                  },
                ],
              },
            ],
            [
              {
                text: 'Monument Description',
                style: constants.label,
                colSpan: 7,
              },
            ],
            [
              {
                text: `Accuracy: ${data.metadata.accuracy}.
${data.metadata.description} `,
                style: constants.value,
                colSpan: 7,
              },
            ],
            [
              {
                text: 'General Notes',
                style: constants.label,
                colSpan: 7,
              },
            ],
            [
              { text: data.metadata.notes, style: constants.value, colSpan: 5 },
              ...span(4),
              {
                image:
                  (images.seal?.length ?? 0) > 0 ? images.seal : constants.seal,
                fit: [100, 100],
                alignment: 'center',
                colSpan: 2,
                margin: [0, 0, 0, 0],
              },
              ...span(1),
            ],
          ],
        },
      },
      {
        layout: 'noBorders',
        table: {
          pageBreak: 'before',
          widths: [constants.half, constants.half],
          body: [
            [{ image: constants.additional }, { image: constants.additional }],
            [{ image: constants.additional }, { image: constants.additional }],
            [{ image: constants.additional }, { image: constants.additional }],
          ],
        },
      },
      {
        layout: 'noBorders',
        table: {
          pageBreak: 'before',
          widths: [constants.half, constants.half],
          body: [
            [{ image: constants.additional }, { image: constants.additional }],
            [{ image: constants.additional }, { image: constants.additional }],
            [{ image: constants.additional }, { image: constants.additional }],
          ],
        },
      },
    ],
    watermark: {
      text: 'draft',
      color: constants.sky500,
      opacity: 0.7,
      bold: true,
    },
    footer: [
      {
        style: constants.footer,
        margin: [40, 5, 40, 0],
        text: 'The state of Utah makes no guarantees, representations, or warranties of any kind, expressed or implied, as to the content, accuracy, timeliness, or completeness of any of the data. Unless otherwise noted all images are oriented north and are not to scale. The data is provided on an "as is, where is" basis. The State assumes no obligation or liability for its use by any persons.',
      },
      {
        qr: 'https://plss.utah.gov/monument=blmpointid',
        fit: 50,
        absolutePosition: { x: 5, y: 5 },
        foreground: constants.sky500,
      },
    ],
    styles: {
      'text-xl': {
        fontSize: 34,
      },
      'text-lg': {
        fontSize: 21,
      },
      'text-normal': {
        fontSize: 10,
      },
      'text-sm': {
        fontSize: 8,
      },
      'slate-800': {
        color: '#1e293b',
      },
      'sky-800': {
        color: '#075985',
      },
      'sky-50': {
        color: '#f0f9ff',
      },
      'rose-700': {
        color: '#be123c',
      },
      'bg-sky-800': {
        fillColor: '#075985',
      },
      bold: {
        bold: true,
      },
      italic: {
        italics: true,
      },
      center: {
        alignment: 'center',
      },
    },
  };

  const fileName = `submitters/${context.auth.uid}/new/${data.blmPointId}/preview.pdf`;
  const file = bucket.file(fileName);

  try {
    let pdf = await createPdfDocument(definition, pdfs);

    await file.save(pdf);
    await file.setMetadata({
      contentType: 'application/pdf',
      contentDisposition: 'inline',
    });
  } catch (error) {
    logger.error('error generating preview', error, data, {
      structuredData: true,
    });

    throw new auth.HttpsError(
      'internal',
      'There was a problem creating the pdf'
    );
  }

  const record = {
    created_at: new Date(),
    id: data.blmPointId,
    preview: fileName,
    ttl: new Date(Date.now() + oneDay),
  };

  try {
    logger.debug('updating firestore', record, {
      structuredData: true,
    });

    await db
      .collection('previews')
      .doc(context.auth.uid)
      .collection('documents')
      .add(record);
  } catch (error) {
    logger.error(
      'error storing preview record. you will need to clean up the storage',
      fileName,
      error,
      {
        structuredData: true,
      }
    );
  }

  return fileName;
});

export default postGeneratePreview;
