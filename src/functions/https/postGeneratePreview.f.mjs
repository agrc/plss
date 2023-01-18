import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { auth, https, logger } from 'firebase-functions/v1';
import {
  createPdfDocument,
  generatePdfDefinition,
  getPdfAssets,
} from '../pdfHelpers.mjs';
import { validateNewSubmission } from './postCorner.f.mjs';
import setupFirebase from '../firebase.mjs';

const config = setupFirebase();
const bucket = getStorage().bucket(config.storageBucket);
const db = getFirestore();
const oneDay = 1000 * 60 * 60 * 24;

const postGeneratePreview = https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.warn('unauthenticated request', { structuredData: true });

    throw new auth.HttpsError('unauthenticated', 'You must log in');
  }

  try {
    const result = await validateNewSubmission(data);
    logger.debug('validation result', result, {
      structuredData: true,
    });
  } catch (error) {
    logger.error('validation error', error, {
      structuredData: true,
    });

    throw new auth.HttpsError(
      'invalid-argument',
      'pdf preview data is invalid',
      error
    );
  }

  let surveyor = {
    name: context.auth.token.name,
    license: '',
    seal: '',
  };

  try {
    logger.debug('getting surveyor data', context.auth.uid, {
      structuredData: true,
    });

    const snapshot = await db
      .collection('submitters')
      .doc(context.auth.uid)
      .get();

    const { license, seal } = snapshot.data();

    surveyor.seal = seal;
    surveyor.license = license;
  } catch (error) {
    logger.error(
      'error fetching surveyor license. using empty string',
      context.auth.uid,
      {
        structuredData: true,
      }
    );
  }

  const { images, pdfs } = await getPdfAssets(
    bucket,
    data.images,
    surveyor.seal
  );

  const definition = generatePdfDefinition(data, surveyor, images, true);

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
