import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore, type DocumentData } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import {
  createPdfDocument,
  generatePdfDefinition,
  getBinaryPdfs,
  getPdfAssets,
} from '../pdfHelpers.js';

type Mode = 'dry-run' | 'apply';

type Options = {
  bucketName: string;
  projectId: string;
  ids?: Set<string>;
  includeCancelled: boolean;
  limit?: number;
  mode: Mode;
};

type Candidate = {
  id: string;
  reason: string;
  record: DocumentData;
  destination: string;
  source?: string;
};

const underReviewPath = (record: DocumentData, id: string): string =>
  `under-review/${record.blm_point_id}/${record.submitted_by.id}/${id}.pdf`;

const isPath = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !value.startsWith('/');

const isCancelled = (record: DocumentData): boolean =>
  Boolean(record.status?.user?.cancelled);

export const parseOptions = (args: string[]): Options => {
  const values = new Map<string, string>();
  for (const argument of args) {
    const separator = argument.indexOf('=');
    if (separator > 2 && argument.startsWith('--')) {
      values.set(argument.slice(2, separator), argument.slice(separator + 1));
    }
  }

  const required = ['project', 'bucket'];
  const missing = required.filter((name) => !values.get(name));
  if (missing.length > 0) {
    throw new Error(
      `missing required arguments: ${missing.map((name) => `--${name}=...`).join(', ')}`,
    );
  }

  const options: Options = {
    bucketName: values.get('bucket') as string,
    includeCancelled: args.includes('--include-cancelled'),
    mode: args.includes('--apply') ? 'apply' : 'dry-run',
    projectId: values.get('project') as string,
  };

  for (const argument of args) {
    if (argument.startsWith('--limit=')) {
      options.limit = Number(values.get('limit'));
    }

    if (argument.startsWith('--ids=')) {
      options.ids = new Set(
        argument
          .slice('--ids='.length)
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      );
    }
  }

  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error('--limit must be a positive integer');
  }

  return options;
};

const initializeServices = (options: Options) => {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: options.projectId,
    storageBucket: options.bucketName,
  });

  return {
    bucket: getStorage(app).bucket(),
    db: getFirestore(app),
  };
};

const sourceExists = async (
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>,
  path: string,
): Promise<boolean> => {
  const [exists] = await bucket.file(path).exists();
  return exists;
};

export const findCandidates = async (
  db: ReturnType<typeof getFirestore>,
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>,
  options: Options,
): Promise<Candidate[]> => {
  const snapshot = await db.collection('submissions').get();
  const candidates: Candidate[] = [];

  for (const document of snapshot.docs) {
    if (options.ids && !options.ids.has(document.id)) {
      continue;
    }

    const record = document.data();
    if (isCancelled(record) && !options.includeCancelled) {
      continue;
    }

    const hasMonument = isPath(record.monument);
    const monumentExists = hasMonument
      ? await sourceExists(bucket, record.monument)
      : false;

    if (monumentExists) {
      continue;
    }

    if (record.type === 'existing') {
      if (!hasMonument) {
        if (isPath(record.pdf) && (await sourceExists(bucket, record.pdf))) {
          continue;
        }

        console.log(
          `unresolved ${document.id}: existing submission has no recoverable pdf source`,
        );
        continue;
      }

      if (!isPath(record.pdf) || !(await sourceExists(bucket, record.pdf))) {
        console.log(
          `unresolved ${document.id}: defined monument is missing and source pdf is unavailable`,
        );
        continue;
      }

      candidates.push({
        destination: underReviewPath(record, document.id),
        id: document.id,
        reason: 'missing under-review file',
        record,
        source: record.pdf,
      });
      continue;
    }

    if (record.type !== 'new') {
      console.log(`unresolved ${document.id}: unknown submission type`);
      continue;
    }

    const destination = underReviewPath(record, document.id);
    candidates.push({
      destination,
      id: document.id,
      reason: hasMonument ? 'missing under-review file' : 'missing monument field',
      record,
    });
  }

  return options.limit === undefined
    ? candidates
    : candidates.slice(0, options.limit);
};

const generateNewPdf = async (
  db: ReturnType<typeof getFirestore>,
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>,
  record: DocumentData,
): Promise<Buffer> => {
  const surveyorSnapshot = await db
    .collection('submitters')
    .doc(record.submitted_by.id)
    .get();
  const surveyorData = surveyorSnapshot.data();
  const surveyor = {
    license: surveyorData?.license,
    name: surveyorData?.displayName,
    seal: surveyorData?.seal,
  };
  const { images, pdfs } = await getPdfAssets(bucket, record.images, surveyor.seal);
  const definition = generatePdfDefinition(record, surveyor, images, false);

  return createPdfDocument(definition, pdfs);
};

const repairCandidate = async (
  db: ReturnType<typeof getFirestore>,
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>,
  candidate: Candidate,
): Promise<void> => {
  const pdf = candidate.source
    ? (await getBinaryPdfs(bucket, { pdf: candidate.source })).pdf
    : await generateNewPdf(db, bucket, candidate.record);

  if (!pdf) {
    throw new Error('could not load source PDF');
  }

  await bucket.file(candidate.destination).save(pdf, {
    metadata: {
      contentDisposition: 'inline',
      contentType: 'application/pdf',
    },
  });
  await db.collection('submissions').doc(candidate.id).update({
    monument: candidate.destination,
  });
};

export const run = async (args: string[] = process.argv.slice(2)): Promise<number> => {
  const options = parseOptions(args);
  const { bucket, db } = initializeServices(options);
  const candidates = await findCandidates(db, bucket, options);
  let failures = 0;

  for (const candidate of candidates) {
    console.log(`${options.mode} ${candidate.id}: ${candidate.reason} -> ${candidate.destination}`);

    if (options.mode === 'dry-run') {
      continue;
    }

    try {
      await repairCandidate(db, bucket, candidate);
      console.log(`repaired ${candidate.id}`);
    } catch (error) {
      failures += 1;
      console.error(`failed ${candidate.id}:`, error);
    }
  }

  console.log(
    `summary: ${candidates.length} candidate(s), ${candidates.length - failures} repaired, ${failures} failed`,
  );

  return failures === 0 ? 0 : 1;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  run()
    .then((exitCode) => process.exitCode = exitCode)
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
