import { logger } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import {
  createPdfDocument,
  generatePdfDefinition,
  getBinaryPdfs,
  getPdfAssets,
} from '../../pdfHelpers.js';
import { safelyInitializeApp } from '../../firebase.js';
import { uploadFile } from '../../drive.js';

const config = safelyInitializeApp();
const db = getFirestore();
const bucket = getStorage().bucket(config.storageBucket);

const getFiscalYear = (now) => {
  const july = 6; // July is month 6 (0-indexed)
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let fiscalYear = currentYear;
  if (currentMonth >= july) {
    fiscalYear += 1;
  }

  return fiscalYear.toString().slice(-2);
};

const fiscalYear = getFiscalYear(new Date());

export const createMonumentRecord = async (record, id, sharedDriveId) => {
  logger.debug('trigger: new submission for', id, record.type, {
    structuredData: true,
  });

  if (record.type === 'existing') {
    let data;
    try {
      const fileName = `under-review/${record.blm_point_id}/${record.submitted_by.id}/${id}.pdf`;
      const file = bucket.file(fileName);

      data = await getBinaryPdfs(bucket, { pdf: record.pdf });

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

    if (!record.metadata.mrrc) {
      return true;
    }

    try {
      if (data) {
        await uploadFile(
          sharedDriveId,
          data.pdf,
          record.blm_point_id,
          record.county,
          fiscalYear,
        );
      } else {
        logger.error(
          'error placing file in drive: pdf not created',
          record,
          id,
          {
            structuredData: true,
          },
        );
      }
    } catch (error) {
      logger.error('error placing file in drive', error, record, id, {
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
      error,
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

  let pdf = null;
  try {
    pdf = await createPdfDocument(definition, pdfs);

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
    logger.error('error updating monument record sheet', fileName, error, {
      structuredData: true,
    });
  }

  if (!record.metadata.mrrc) {
    return true;
  }

  try {
    if (pdf) {
      await uploadFile(
        sharedDriveId,
        pdf,
        record.blm_point_id,
        record.county,
        fiscalYear,
      );
    } else {
      logger.error('error placing file in drive: pdf not created', record, id, {
        structuredData: true,
      });
    }
  } catch (error) {
    logger.error('error placing file in drive', error, record, id, {
      structuredData: true,
    });
  }

  return true;
};
