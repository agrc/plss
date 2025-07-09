import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { https, logger } from 'firebase-functions/v2';
import {
  createPdfDocument,
  generatePdfDefinition,
  getPdfAssets,
} from '../pdfHelpers.js';
import { validateNewSubmission } from './postCorner.js';
import { safelyInitializeApp } from '../firebase.js';

const config = safelyInitializeApp();
const bucket = getStorage().bucket(config.storageBucket);
const db = getFirestore();
const oneDay = 1000 * 60 * 60 * 24;

export const generatePreview = async (data, auth) => {
  try {
    const result = await validateNewSubmission(data);
    logger.debug('validation result', { result });
  } catch (error) {
    logger.error('validation error', { error });

    throw new https.HttpsError(
      'invalid-argument',
      'pdf preview data is invalid',
      error,
    );
  }

  let surveyor = {
    name: auth.token.name,
    license: '',
    seal: '',
  };

  try {
    logger.debug('getting surveyor data', { uid: auth.uid });

    const snapshot = await db.collection('submitters').doc(auth.uid).get();

    const { license, seal } = snapshot.data();

    surveyor.seal = seal;
    surveyor.license = license;
  } catch (error) {
    logger.error('error fetching surveyor license. using empty string', {
      uid: auth.uid,
      error,
    });
  }

  const { images, pdfs } = await getPdfAssets(
    bucket,
    data.images,
    surveyor.seal,
  );

  const definition = generatePdfDefinition(data, surveyor, images, true);

  const fileName = `submitters/${auth.uid}/new/${data.blmPointId}/preview.pdf`;
  const file = bucket.file(fileName);

  try {
    let pdf = await createPdfDocument(definition, pdfs);

    await file.save(pdf);
    await file.setMetadata({
      contentType: 'application/pdf',
      contentDisposition: 'inline',
    });
  } catch (error) {
    logger.error('error generating preview', { error, data });

    throw new https.HttpsError(
      'internal',
      'There was a problem creating the pdf',
    );
  }

  const record = {
    created_at: new Date(),
    id: data.blmPointId,
    preview: fileName,
    ttl: new Date(Date.now() + oneDay),
  };

  try {
    logger.debug('updating firestore', { record });

    await db
      .collection('previews')
      .doc(auth.uid)
      .collection('documents')
      .add(record);
  } catch (error) {
    logger.error(
      'error storing preview record. you will need to clean up the storage',
      { fileName, error },
    );
  }

  return fileName;
};
