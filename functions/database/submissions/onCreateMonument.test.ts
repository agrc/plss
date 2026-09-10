import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const update = vi.fn();
  const save = vi.fn();
  const setMetadata = vi.fn();
  const getBinaryPdfs = vi.fn();
  const getPdfAssets = vi.fn();
  const createPdfDocument = vi.fn();
  const generatePdfDefinition = vi.fn();

  return {
    createPdfDocument,
    generatePdfDefinition,
    getBinaryPdfs,
    getPdfAssets,
    save,
    setMetadata,
    update,
  };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({ update: mocks.update }),
    }),
  }),
}));

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: () => ({
      file: () => ({
        save: mocks.save,
        setMetadata: mocks.setMetadata,
      }),
    }),
  }),
}));

vi.mock('firebase-functions/v2', () => ({ logger: { debug: vi.fn(), error: vi.fn() } }));
vi.mock('../../drive.js', () => ({ uploadFile: vi.fn() }));
vi.mock('../../firebase.js', () => ({ safelyInitializeApp: () => ({}) }));
vi.mock('../../pdfHelpers.js', () => ({
  createPdfDocument: mocks.createPdfDocument,
  generatePdfDefinition: mocks.generatePdfDefinition,
  getBinaryPdfs: mocks.getBinaryPdfs,
  getPdfAssets: mocks.getPdfAssets,
}));

import { createMonumentRecord } from './onCreateMonument.js';

const record = {
  type: 'existing',
  pdf: 'submitters/user-id/existing/point-id/source.pdf',
  blm_point_id: 'point-id',
  submitted_by: { id: 'user-id' },
  metadata: { mrrc: false },
};

const newRecord = {
  type: 'new',
  blm_point_id: 'point-id',
  submitted_by: { id: 'user-id' },
  metadata: { mrrc: false },
  images: { monument: 'submitters/user-id/new/point-id/monument.jpg' },
};

describe('createMonumentRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue(undefined);
    mocks.setMetadata.mockResolvedValue(undefined);
    mocks.update.mockResolvedValue(undefined);
    mocks.getPdfAssets.mockResolvedValue({ images: {}, pdfs: {} });
    mocks.generatePdfDefinition.mockReturnValue({});
    mocks.createPdfDocument.mockResolvedValue(Buffer.from('generated pdf'));
  });

  test('stores the review PDF path after copying an existing submission', async () => {
    mocks.getBinaryPdfs.mockResolvedValue({ pdf: Buffer.from('existing pdf') });

    await createMonumentRecord(record, 'submission-id', 'shared-drive-id');

    expect(mocks.save).toHaveBeenCalledWith(Buffer.from('existing pdf'));
    expect(mocks.update).toHaveBeenCalledWith({
      monument: 'under-review/point-id/user-id/submission-id.pdf',
    });
  });

  test('does not store a review PDF path when the existing source PDF is missing', async () => {
    mocks.getBinaryPdfs.mockResolvedValue(undefined);

    await createMonumentRecord(record, 'submission-id', 'shared-drive-id');

    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  test('stores the review PDF path after generating a new submission', async () => {
    await createMonumentRecord(newRecord, 'submission-id', 'shared-drive-id');

    expect(mocks.save).toHaveBeenCalledWith(Buffer.from('generated pdf'));
    expect(mocks.update).toHaveBeenCalledWith({
      monument: 'under-review/point-id/user-id/submission-id.pdf',
    });
  });

  test('does not store a review PDF path when generating a new submission fails', async () => {
    mocks.createPdfDocument.mockRejectedValue(new Error('generation failed'));

    await expect(
      createMonumentRecord(newRecord, 'submission-id', 'shared-drive-id'),
    ).rejects.toThrow('generation failed');

    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});