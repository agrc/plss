import type { DocumentData } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions/v2';
import { uploadFile } from '../../drive.js';
import { safelyInitializeApp } from '../../firebase.js';
import {
  createPdfDocument,
  generatePdfDefinition,
  getBinaryPdfs,
  getPdfAssets,
} from '../../pdfHelpers.js';

const config = safelyInitializeApp();
const db = getFirestore();
const bucket = getStorage().bucket(config.storageBucket);

const getFiscalYear = (now: Date): string => {
  const july = 6;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let fiscalYear = currentYear;
  if (currentMonth >= july) {
    fiscalYear += 1;
  }

  return fiscalYear.toString().slice(-2);
};

const fiscalYear = getFiscalYear(new Date());

export const createMonumentRecord = async (
  record: DocumentData,
  id: string,
  sharedDriveId: string,
): Promise<true> => {
  logger.debug('trigger: new submission for', { id, type: record.type });

  if (record.type === 'existing') {
    let data: Record<string, Buffer> | undefined;
    try {
      const fileName = `under-review/${record.blm_point_id}/${record.submitted_by.id}/${id}.pdf`;
      const file = bucket.file(fileName);

      const loadedPdfs = await getBinaryPdfs(bucket, { pdf: record.pdf });
      const existingPdf = loadedPdfs?.pdf;
      if (!existingPdf) {
        throw new Error('Existing monument PDF could not be loaded');
      }
      data = loadedPdfs;

      await file.save(existingPdf);
      await file.setMetadata({
        contentType: 'application/pdf',
        contentDisposition: 'inline',
      });

      const doc = db.collection('submissions').doc(id);
      await doc.update({ monument: fileName });
    } catch (error) {
      logger.error('error generating monument', { error, record, id });
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
        logger.error('error placing file in drive: pdf not created', {
          record,
          id,
        });
      }
    } catch (error) {
      logger.error('error placing file in drive', { error, record, id });
    }

    return true;
  }

  const surveyor: DocumentData = {};

  try {
    const snapshot = await db
      .collection('submitters')
      .doc(record.submitted_by.id)
      .get();

    const surveyorDoc = snapshot.data();

    surveyor.name = surveyorDoc?.displayName;
    surveyor.license = surveyorDoc?.license;
    surveyor.seal = surveyorDoc?.seal;
  } catch (error) {
    logger.error('error fetching surveyor license. using empty string', {
      error,
      submittedBy: record.submitted_by,
    });
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
    const createdPdf = (await createPdfDocument(definition, pdfs)) as Buffer;

    await file.save(createdPdf);
    await file.setMetadata({
      contentType: 'application/pdf',
      contentDisposition: 'inline',
    });

    const doc = db.collection('submissions').doc(id);
    await doc.update({ monument: fileName });

    if (!record.metadata.mrrc) {
      return true;
    }

    try {
      await uploadFile(
        sharedDriveId,
        createdPdf,
        record.blm_point_id,
        record.county,
        fiscalYear,
      );
    } catch (error) {
      logger.error('error placing file in drive', { error, record, id });
    }
  } catch (error) {
    logger.error('error generating monument', { error, record, id });
    throw error;
  }

  return true;
};
