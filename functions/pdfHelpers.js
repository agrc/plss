import { Base64Encode } from 'base64-stream';
import { Buffer } from 'buffer';
import { logger } from 'firebase-functions/v2';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import PdfPrinter from 'pdfmake';
import { fileURLToPath } from 'url';
import extractTownshipInformation from './shared/cornerSubmission/blmPointId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const empty = {};
const span = (int) => Array(int).fill(empty);

const printer = new PdfPrinter({
  Roboto: {
    normal: __dirname + '/fonts/Roboto-Regular.ttf',
    bold: __dirname + '/fonts/Roboto-Medium.ttf',
    italics: __dirname + '/fonts/Roboto-Italic.ttf',
    bolditalics: __dirname + '/fonts/Roboto-MediumItalic.ttf',
  },
});

export const getPdfAssets = async (bucket, metadata, seal) => {
  const { imagePaths, pdfPaths } = splitImagesFromPdfs(metadata);
  imagePaths.seal = seal;

  let images = {};
  let pdfs = {};

  try {
    images = await getBase64Images(bucket, imagePaths);
  } catch (error) {
    logger.error('could not get binary images', { error });
  }
  try {
    pdfs = await getBinaryPdfs(bucket, pdfPaths);
  } catch (error) {
    logger.error('could not get binary pdfs', { error });
  }

  return { images, pdfs };
};

export const splitImagesFromPdfs = (paths) => {
  const image = /.(jpg|jpeg|png)$/i;
  const pdf = /.(pdf)$/i;

  const imagePaths = {};
  const pdfPaths = {};

  for (const [key, value] of Object.entries(paths)) {
    if ((value?.length ?? 0) === 0) {
      continue;
    }

    if (image.test(value)) {
      imagePaths[key] = value;

      continue;
    }

    if (pdf.test(value) && key.startsWith('extra')) {
      pdfPaths[key] = value;

      continue;
    }
  }

  return { imagePaths, pdfPaths };
};

const getBase64Images = async (bucket, metadata) => {
  const promises = [];

  Object.entries(metadata).forEach(([key, fileName]) => {
    logger.debug('creating stream for', { key });

    if (!fileName) {
      return { [key]: null };
    }

    promises.push(
      getImageData(bucket.file(fileName).createReadStream()).then((result) => {
        return { [key]: result };
      }),
    );
  });

  const results = await Promise.all(promises);

  return results.reduce((obj, item) => {
    const [key, value] = Object.entries(item)[0];

    return Object.assign(obj, { [key]: value });
  }, {});
};

export const getBinaryPdfs = async (bucket, metadata) => {
  const promises = [];

  Object.entries(metadata).forEach(([key, fileName]) => {
    logger.debug('creating stream for', { key });

    promises.push(
      getPdfData(bucket.file(fileName).createReadStream()).then((result) => {
        return { [key]: result };
      }),
    );
  });

  const results = await Promise.all(promises);

  return results.reduce((obj, item) => {
    const [key, value] = Object.entries(item)[0];

    return Object.assign(obj, { [key]: value });
  }, {});
};

const getImageData = (stream) => {
  const chunks = new Base64Encode();
  let contentType = '';

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      logger.error('getImageData error', err);

      return reject(err);
    });
    stream.on('response', (response) => {
      contentType = response.headers['content-type'];

      return;
    });
    stream.on('data', (chunk) => chunks.write(chunk));
    stream.on('end', () => {
      chunks.end();

      return resolve(`data:${contentType};base64,${chunks.read()}`);
    });
  });
};

const getPdfData = (stream) => {
  const chunks = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error) => {
      logger.error('getPdfData error', { error });

      return reject(error);
    });
  });
};

export const generatePdfDefinition = (data, surveyor, images, watermark) => {
  const {
    township,
    range,
    meridian: { name: meridian },
  } = extractTownshipInformation(data.blmPointId ?? data.blm_point_id);

  const addExtraImages = (images) => {
    const extras = Object.keys(images ?? {}).filter((key) =>
      key.startsWith('extra'),
    );

    if (extras.length === 0) {
      return [];
    }

    const extraPages = {
      layout: 'noBorders',
      table: {
        pageBreak: 'before',
        widths: [constants.half, constants.half],
        body: [],
      },
    };

    for (let i = 0; i < extras.length; i += 2) {
      const row = [];

      row.push({ image: images[extras[i]], fit: [230, 230] });

      if (extras[i + 1]) {
        row.push({ image: images[extras[i + 1]], fit: [230, 230] });
      } else {
        row.push({});
      }

      extraPages.table.body.push(row);
    }

    return [extraPages];
  };

  const definition = {
    info: {
      title: 'Monument Record Sheet',
      author: 'Utah Geospatial Resource Center (UGRC)',
      subject: `Monument sheet for ${data.blmPointId ?? data.blm_point_id}`,
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
      {
        text: `${data.county ?? 'Unknown'} County`,
        style: constants.subHeader,
      },
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
                text: data.blmPointId ?? data.blm_point_id,
                style: constants.value,
              },
              {
                text: surveyor.name,
                style: constants.value,
                colSpan: 2,
              },
              ...span(1),
              {
                text: surveyor.license,
                style: constants.value,
                colSpan: 2,
              },
              ...span(1),
              {
                text: data.metadata.collected,
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
      ...addExtraImages(images),
    ],
    footer: [
      {
        style: constants.footer,
        margin: [40, 5, 40, 0],
        text: 'The state of Utah makes no guarantees, representations, or warranties of any kind, expressed or implied, as to the content, accuracy, timeliness, or completeness of any of the data. Unless otherwise noted all images are oriented north and are not to scale. The data is provided on an "as is, where is" basis. The State assumes no obligation or liability for its use by any persons.',
      },
      {
        qr: `https://plss.utah.gov?monument=${
          data.blmPointId ?? data.blm_point_id
        }`,
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

  if (watermark) {
    definition.watermark = {
      text: 'draft',
      color: constants.sky500,
      opacity: 0.7,
      bold: true,
    };
  }

  return definition;
};

export const createPdfDocument = async (definition, extraPdfPages) => {
  const partialPdf = await new Promise((resolve, reject) => {
    const chunks = [];
    const stream = printer.createPdfKitDocument(definition);

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error) => reject(error));
    stream.end();
  });

  logger.debug('saved front page now appending extra pages', {
    length: Object.keys(extraPdfPages).length,
  });

  const pdf = await appendPdfPages(partialPdf, extraPdfPages);

  return pdf;
};

export const appendPdfPages = async (original, metadata) => {
  const pdfs = Object.values(metadata ?? {});

  if (pdfs.length === 0) {
    return original;
  }

  const source = await PDFDocument.load(original);

  for (let i = 0; i < pdfs.length; i++) {
    const extraPages = await PDFDocument.load(pdfs[i]);
    const copiedPages = await source.copyPages(
      extraPages,
      extraPages.getPageIndices(),
    );

    copiedPages.forEach((page) => {
      source.addPage(page);
    });
  }

  const complete = await source.save();

  return Buffer.from(complete);
};

const constants = {
  grid: ['40%', '10%', '10%', '10%', '10%', '10%', '10%'],
  half: '50%',
  sky500: '#0ea5e9',
  label: ['text-normal', 'bold', 'bg-sky-800', 'sky-50'],
  value: ['text-normal', 'slate-800'],
  subLabel: ['text-normal', 'slate-800', 'bold'],
  header: ['text-xl', 'bold', 'center', 'sky-800'],
  subHeader: ['text-lg', 'bold', 'center', 'sky-800'],
  footer: ['text-sm', 'italic', 'center', 'rose-700'],
  map: 'data:image/png;base64,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',
  monument:
    'data:image/png;base64,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',
  close:
    'data:image/png;base64,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',
  seal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAB7BJREFUeF7t3HmoTFEcB/Dv2N4fLz2eF3qFf2xREpIshciaUiJKhJKHsu9Z/vCnbMmSJftWSsm+pWyZQiTr2GXrZXs8wuj30x3zxsx9d+4968w9pd7MvXPOub/POb/fffPMRKLRaLy4uBgFBQWwuUUiEZunj8rKSpSXlyMSi8Xi9EPz5s1RVFRk9UXZOvmPHz/i4cOHoI0RefnyZbywsJCfCFHUkzoYFPuKioq/IKWlpUg+EO4UNTCpMX/16tU/EJpCiKIGIlOs/wMJUdSAZFr4aUFCFLkoblkoI0iIIgelupLgChKiiEWpDoNGqxYkRBGD4gXDM0iIEgzFK0ZWICGKP5RsMLIGCVGyQ8kWwxdIiOINxQ+Gb5AQxR3FL0YgkBAlPUoQjMAgIUpVlKAYQkBClL8oIjCEgYickLeSadZZojCEguQrikgM4SD5hiIaQwpIvqDIwJAGkusosjCkguQqikwM6SC5hiIbQwlIrqCowFAGYjuKKgylILaiqMRQDmIbimoMLSC2oOjA0AZiOoouDK0gpqLoxNAOYhqKbgwjQExBMQHDGBDdKKZgGAWiC8UkDONAVKOYhmEkiCoUEzGMBZGNYiqG0SCyUEzGMB5ENIrpGFaAiEKxAcMakKAotmBYBeIXxSYM60CyRbENw0oQryg2YlgLUh2KrRhWg2RCsRnDepBUFHps+zcaefqcOl2oyc3ZFTRH279eKgQxbKVZD5JcM8KUpXl1pSvgYVHXhOIWeJtRrExZXgLu5RxNa8l1WOtAsgl0NueagmMViJ8A+3mNThxrQIIENshrVeNYASIioCL6UIFjPIjIQIrsSxaO0SAyAiijT5E4xoLIDJzMvoPiGAmiImAqxvCDYxyIykCpHMsrjlEgOgKkY0w3HGNAdAZG59ipOEaAmBAQE+ZgxJ9wTQlEdf9xwmsNCHqe1h1iEoYTSN1z0gai+8LdVrLOuWkB0XnBXlOKrjkqB9F1oV4hks/TMVelIDou0A+EThRlIDZi6Cj0SkBsxlCNIh0kFzBUokgFySUMVSjSQHIRQwWKFJBcxpCNIhwkHzBkoggFyScMWSjCQPIRQwaKEJB8xhCNEhgkxPj3RouIWAQCETGBoO81mfb6oDHxDRJ0YNMCKXI+QWLjCyTIgCIv3OS+/MYoaxC/A5kcPFlz8xOrrED8DCDrYjP1W15eji9fvqBp06b/nUKfYS8uLuZ/qe3NmzeorKxEs2bNspry9+/f8ejRI7Rp0yZtn+/evQOdk/px7a9fv+LZs2do0aIFatasmXitZxAbMOiqJk6cyCC7d+9OXCRdeN++fXH//n1+buzYsdiyZQtq1KiBnz9/YtiwYTh8+DAfa9euHc6dO5cWLZ3U3r17ecxPnz4lDqf22bZtW6xduxYdOnRAUVERli9fjkWLFvH5devW5fE6duzIjz2B2ICxb98+HDp0CAcPHsSoUaOqgAwZMgSvX7/m47Sae/bsiQ0bNnAgV61ahcWLF+PMmTMoKSlB//790b59e+zfv991p1y5cgXbt29PjJMMkq5PQlm4cCHD9e7dG9u2bcOAAQMwY8YMnD59Gi9evEDt2rWrB7EBgyI3d+5cPHnyBOfPn0efPn0SgXr79i0aNWqEU6dO8fPUhg8fzkAXLlwABYp2yLJly/jY+vXrUVZWBkp9Y8aM4RRGq5vapEmT8O3bNw7mrl27cOTIEdy9exePHz+uskMy9Umrf9asWYjFYrh8+TL3eevWLd6VZ8+eRa9evdxBbMFIXsojRoxArVq1EiCXLl1Ct27d8OHDB04X1JYsWYKVK1dy0GlVHj16lFcrNVqtlN4o0FRzBg8ejAMHDnAdGD16NK5evYrOnTsnhqSdNmfOnAQIpSu3PgmV6tvq1at5PlRLCgsLsXnzZowfPz4ziI0YFKVUEMrxlMJ+//6NSCTCgaQVPm7cODx9+pR3wMWLF9G1a1c+9uDBA7Rs2RLXrl1Dp06dMHnyZOzcuZOPLViwAPPmzauSylJBqF659Tl06FBMmDCBoZ1CTzuY+p0+fXp6EFsx0oE4O+T9+/do0KABB3PdunXYunUrp42CggIu6FRnqN28eZNrCO2e+vXrw0l5VHypjzp16riC/Pjxw7XPkSNHcpqkuuV8c1G9evU4/Q0aNOh/EJsx0oE4KSE51VDa+PXrFzZt2oTu3buDVu3MmTM50HRzMHv2bDx//pwfT506lYv358+fsWLFCi7CyS11h9Axtz6XLl2KaDTKABRrWjADBw7k+kc7q8pdlu0Y6UDoOcr5jRs35sAeP36cU9iePXtAq3X+/Pm8WwiMCj3lcQroxo0b+VyqLRS8O3fucK2gHURF2GnpQNz6PHbsGAOcOHECrVq1wpQpU3D9+nXcvn0btFMSIFRYbP/yLweE0oqT9+k5CibdwVD6oUZBcO6c6DaUAkR1hFqXLl1w8uRJ/v2kdevW6NevH3bs2MGPe/TowcX7xo0bXLipERztqOTb3kx9UtqLx+OYNm0a1qxZw69v2LAhp0zqj2pKRUUFIrFYLE450/Yv/6qSS1IeUIq6d+8eSktLeSWmNirw9ItikyZN3LrJ6phbnxRveneA0Olmw8lO9C5CJBqNxukHKnBh0xcBurUmqD+z8ywkxEUddwAAAABJRU5ErkJggg==',
  additional:
    'data:image/png;base64,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3eZ+AmTQxN3tIgPWO0IgZgTQGCH2p6urq5DMe2FCcOouHC2ig6giBISAHwg4FTKynJF9Ok8pRAiET8JETeu/5RmonhUCqSGApdDZ2ZlL5j03IfikEJvaBGu8fiPA9vmFF16wjj3u7mydYAh/G0fzu++++7CBoH3AaUGeHA2Isr700ktWsXnHHXccMe/p888/b/t03HHHDVryPI+Fz5HlF77whSEWfi5CgHHwFfiiIe/38lDvUkLgpptuMt/73vcGh/zVr37V/OUvf7F7eT68r3/96+aRRx6xf997773Nrbfeaj9GPmo+1j/84Q/2b1/60pfM3/72N9Pd3T0mfE8//bQ56KCDrEOfQlq4Bx980Oy0005D3jvzzDPN9ddfb1588UX7N0iL9u699177HLokDz/8sNl5553t/89ECL5mmUlpwWms/iJAdC4f1qWXXmrOPfdc++Hz0d15553m29/+tvnxj39sbrnlFvvhQQ4nnHCCOfTQQ83VV19tfvWrX5nLLrvM/o1owyOOOMLstttu5q677hpzwLvuuqvNIg0RIeFOe0cffbT5zW9+M/geJPOtb33L/v+XX37ZWgJPPfWU7dPdd99tyeeiiy6yZIElwfaiJSHgoOB8c8qUKd7lofN3iahnKSHAr+1RRx1lP3byNVL2339/e/R3xx13WKuaD/+cc86xf+PXnY+Yj/WLX/yi/ZghDcp1111nzjrrLLN69Wpz2mmn2S3Etddea//Grz1tUBfbkr///e/mwAMPtH+74oorzC9+8QubKd390mMRnHjiieZ3v/ud3Y6wXTnjjDPsu7fffrt97p///KfZd999zSuvvGJvJY9JCC5TLReUip5rprQwNNY0ESBKF//AnnvuaQEgYpdfez5utgoIA/HBP/HEE/bvfKTHHnusTUzEv7/+9a/myCOPtH976KGHrPWAb4AfYt7n1xxh4lNOOcU8/vjj1rx/5plnzB577GEJCAc/2we+USwLfsSxNNjan3TSSebggw+2hMCpw2GHHWalCCAqLAK2J1/72tfMn/70J9vWqIRA5BM+A59z2ae5/DRqnxHgg8aXgO/gX//6l/1w+VjZUpx33nkG5+Evf/lLc/rpp5sf/ehH1gJ47LHHzH777WeHxS81DkLe3WuvvczZZ59t/Q2UH/7wh+biiy8eMnye51f/ySeftFsV3qF+/Ab8tyVLlgwhhN///vfmu9/9rt0q7LPPPuanP/2pefTRR63FAFGNSAhOJh3HRrux0T5PnvomBMpCAGcdRMCvOR86Hy/bbD7SQw45xNxwww3m+9//vm3uJz/5ibn88svtrza/8Oz1v/GNb9i/Pfvss9aHwJYB0x4zn4tLRB+ireiuBhCVeOWVV9q6jj/+eLuN4NYjp4DkiMQi+fKXv2y3J5DIH//4R0sW3HegbzfffLO1JCCBX//619a3wOnHMEJgj4Jl0NPTI5n0slaL6okaATz9fPR8rHxoW8bnuF/8+++/35rrFBx//PKzJcd6OOaYY8z5559v/4Yj8oILLrD6iZQf/OAHtk7auOaaa6yVQTn11FMNdfI8WwJXnnvuuUHi4b+tWbPGOhTZXvzsZz+zWxm2Kbvssou1ViAsthVcpcaqGUIIsBz7FryXEIKKEBACrRFw3vw///nPQ7KQkZWMeASOGfmeIAK+se985zv2yBFr4pJLLjE33nij9Q3gi8CKwCH529/+1tx3333Wt0C9xBJceOGF1oLg+2QLctVVVw36HuglcQ+cPmxZ2I5Qn/MhQCpYDzg1IZmTTz7ZSrFBLEMIgc5jGeCYKEtsoTWUekIIhI8A+/Gf//znwwbyzW9+09xzzz32SA8nIr/UFEx59vKY+JwKcELBh+v+9sADD1jrgVOCww8/3B5Z8v8POOAA+zy/9NQ9UiFEYMvyj3/8w3zlK18ZJAS2IM66cO3ddtttBgUmLBvq7+jv79/M9WUcHK0CIsKfPo1ACNSPgEts7I7vt77/wy82v/CcSNRR2C5wcODaw2dBH/BbdCxZsmQzRMCxBB2FZUb7X9fZVs/V/feRQBzt0lWW8dUxKUWxrLNvaisdBNhWII78f543G6dT5yDLAAAAAElFTkSuQmCC',
};
