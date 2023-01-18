import { logger, firestore } from 'firebase-functions/v1';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import {
  createPdfDocument,
  generatePdfDefinition,
  getPdfAssets,
} from '../../pdfHelpers.mjs';
import setupFirebase from '../../firebase.mjs';

const config = setupFirebase();
const db = getFirestore();
const bucket = getStorage().bucket(config.storageBucket);

const onCreateMonumentRecord = firestore
  .document('/submissions/{docId}')
  .onCreate(async (snap, context) => {
    const newSubmissionDoc = snap.data();

    logger.debug('trigger: new submission for', context.params.docId, {
      structuredData: true,
    });

    let surveyor = {};

    try {
      const snapshot = await db
        .collection('submitters')
        .doc(newSubmissionDoc.submitted_by.id)
        .get();

      const surveyorDoc = snapshot.data();

      surveyor.name = surveyorDoc.displayName;
      surveyor.license = surveyorDoc.license;
      surveyor.seal = surveyorDoc.seal;
    } catch (error) {
      logger.error(
        'error fetching surveyor license. using empty string',
        newSubmissionDoc.submitted_by,
        {
          structuredData: true,
        }
      );
    }

    const { images, pdfs } = await getPdfAssets(
      bucket,
      newSubmissionDoc.images,
      surveyor.seal
    );

    const definition = generatePdfDefinition(
      newSubmissionDoc,
      surveyor,
      images,
      false
    );

    const fileName = `under-review/${newSubmissionDoc.blm_point_id}/${newSubmissionDoc.submitted_by.id}/${context.params.docId}.pdf`;
    const file = bucket.file(fileName);

    try {
      let pdf = await createPdfDocument(definition, pdfs);

      await file.save(pdf);
      await file.setMetadata({
        contentType: 'application/pdf',
        contentDisposition: 'inline',
      });
    } catch (error) {
      logger.error(
        'error generating monument',
        error,
        newSubmissionDoc,
        context.params.docId,
        {
          structuredData: true,
        }
      );
    }

    try {
      const doc = db.collection('submissions').doc(context.params.docId);

      await doc.update({ monument: fileName });
    } catch (error) {
      logger.error('error updating monument record sheet', fileName, {
        structuredData: true,
      });
    }

    return true;
  });

export default onCreateMonumentRecord;
