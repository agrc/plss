import { logger } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import {
  createPdfDocument,
  generatePdfDefinition,
  getBinaryPdfs,
  getPdfAssets,
} from '../../pdfHelpers.js';
import { safelyInitializeApp } from '../../firebase.js';

const config = safelyInitializeApp();
const db = getFirestore();
const bucket = getStorage().bucket(config.storageBucket);

export const createMonumentRecord = async (record, id) => {
  logger.debug('trigger: new submission for', id, record.type, {
    structuredData: true,
  });

  if (record.type === 'existing') {
    try {
      const fileName = `under-review/${record.blm_point_id}/${record.submitted_by.id}/${id}.pdf`;
      const file = bucket.file(fileName);

      const data = await getBinaryPdfs(bucket, { pdf: record.pdf });

      await file.save(data.pdf);
      await file.setMetadata({
        contentType: 'application/pdf',
        contentDisposition: 'inline',
      });
    } catch (error) {
      logger.error('error generating monument', error, record, id, {
        structuredData: true,
      });
    }

    return true;
  }

  let surveyor = {};

  try {
    const snapshot = await db
      .collection('submitters')
      .doc(record.submitted_by.id)
      .get();

    const surveyorDoc = snapshot.data();

    surveyor.name = surveyorDoc.displayName;
    surveyor.license = surveyorDoc.license;
    surveyor.seal = surveyorDoc.seal;
  } catch (error) {
    logger.error(
      'error fetching surveyor license. using empty string',
      record.submitted_by,
      {
        structuredData: true,
      },
    );
  }

  const { images, pdfs } = await getPdfAssets(
    bucket,
    record.images,
    surveyor.seal,
  );

  const definition = generatePdfDefinition(record, surveyor, images, false);

  const fileName = `under-review/${record.blm_point_id}/${record.submitted_by.id}/${id}.pdf`;
  const file = bucket.file(fileName);

  try {
    let pdf = await createPdfDocument(definition, pdfs);

    await file.save(pdf);
    await file.setMetadata({
      contentType: 'application/pdf',
      contentDisposition: 'inline',
    });
  } catch (error) {
    logger.error('error generating monument', error, record, id, {
      structuredData: true,
    });
  }

  try {
    const doc = db.collection('submissions').doc(id);

    await doc.update({ monument: fileName });
  } catch (error) {
    logger.error('error updating monument record sheet', fileName, {
      structuredData: true,
    });
  }

  return true;
};
