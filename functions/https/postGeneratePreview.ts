import type { DocumentData } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { https, logger } from 'firebase-functions/v2';
import type { AuthData } from 'firebase-functions/tasks';
import {
  createPdfDocument,
  generatePdfDefinition,
  getPdfAssets,
} from '../pdfHelpers.js';
import { safelyInitializeApp } from '../firebase.js';
import { validateNewSubmission } from './postCorner.js';

const config = safelyInitializeApp();
const bucket = getStorage().bucket(config.storageBucket);
const db = getFirestore();
const oneDay = 1000 * 60 * 60 * 24;

type PreviewSubmission = DocumentData & {
  blmPointId: string;
  images: Record<string, string>;
};

export const generatePreview = async (
  data: unknown,
  auth: AuthData,
): Promise<string> => {
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

  const submission = data as PreviewSubmission;

  const surveyor = {
    name: auth.token.name,
    license: '',
    seal: '',
  };

  try {
    logger.debug('getting surveyor data', { uid: auth.uid });

    const snapshot = await db.collection('submitters').doc(auth.uid).get();
    const profile = snapshot.data();

    surveyor.seal = profile?.seal ?? '';
    surveyor.license = profile?.license ?? '';
  } catch (error) {
    logger.error('error fetching surveyor license. using empty string', {
      uid: auth.uid,
      error,
    });
  }

  const { images, pdfs } = await getPdfAssets(
    bucket,
    submission.images,
    surveyor.seal,
  );

  const definition = generatePdfDefinition(submission, surveyor, images, true);

  const fileName = `submitters/${auth.uid}/new/${submission.blmPointId}/preview.pdf`;
  const file = bucket.file(fileName);

  try {
    const pdf = await createPdfDocument(definition, pdfs);

    await file.save(pdf);
    await file.setMetadata({
      contentType: 'application/pdf',
      contentDisposition: 'inline',
    });
  } catch (error) {
    logger.error('error generating preview', { error, data: submission });

    throw new https.HttpsError(
      'internal',
      'There was a problem creating the pdf',
    );
  }

  const record = {
    created_at: new Date(),
    id: submission.blmPointId,
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
