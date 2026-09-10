import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  exists: vi.fn(),
  get: vi.fn(),
  file: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  applicationDefault: vi.fn(),
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection: mocks.collection }),
}));

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({ bucket: () => ({ file: mocks.file }) }),
}));

vi.mock('../pdfHelpers.js', () => ({
  createPdfDocument: vi.fn(),
  generatePdfDefinition: vi.fn(),
  getBinaryPdfs: vi.fn(),
  getPdfAssets: vi.fn(),
}));

import { findCandidates, parseOptions } from './repair-missing-monuments.js';

describe('repair-missing-monuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.collection.mockReturnValue({ get: mocks.get });
    mocks.get.mockResolvedValue({
      docs: [
        {
          id: 'existing-id',
          data: () => ({
            type: 'existing',
            blm_point_id: 'point-id',
            submitted_by: { id: 'user-id' },
            pdf: 'submitters/user/existing/point/source.pdf',
            status: { user: { cancelled: null } },
          }),
        },
        {
          id: 'new-id',
          data: () => ({
            type: 'new',
            blm_point_id: 'point-id',
            submitted_by: { id: 'user-id' },
            images: {},
            status: { user: { cancelled: null } },
          }),
        },
        {
          id: 'existing-broken-id',
          data: () => ({
            type: 'existing',
            blm_point_id: 'point-id',
            submitted_by: { id: 'user-id' },
            pdf: 'submitters/user/existing/point/source.pdf',
            monument: 'under-review/point-id/user-id/existing-broken-id.pdf',
            status: { user: { cancelled: null } },
          }),
        },
      ],
    });
    mocks.file.mockReturnValue({
      exists: vi.fn().mockResolvedValue([true]),
    });
  });

  test('uses dry-run by default and parses limits and ids', () => {
    expect(
      parseOptions([
        '--project=ut-dts-agrc-plss-prod',
        '--bucket=ut-dts-agrc-plss-prod.appspot.com',
        '--limit=2',
        '--ids=one,two',
      ]),
    ).toMatchObject({
      ids: new Set(['one', 'two']),
      limit: 2,
      mode: 'dry-run',
    });
  });

  test('requires explicit Firebase configuration', () => {
    expect(() => parseOptions([])).toThrow(
      'missing required arguments: --project=..., --bucket=...',
    );
  });

  test('silently skips existing records with a valid source and finds new records', async () => {
    mocks.file.mockImplementation((path: string) => ({
      exists: vi.fn().mockResolvedValue([path.includes('source.pdf')]),
    }));

    const candidates = await findCandidates(
      { collection: mocks.collection } as never,
      { file: mocks.file } as never,
      parseOptions([
        '--project=project',
        '--bucket=bucket',
      ]),
    );

    expect(candidates).toHaveLength(2);
    expect(candidates).toContainEqual(
      expect.objectContaining({
        id: 'existing-broken-id',
        reason: 'missing under-review file',
        destination: 'under-review/point-id/user-id/existing-broken-id.pdf',
        source: 'submitters/user/existing/point/source.pdf',
      }),
    );
    expect(candidates).toContainEqual(
      expect.objectContaining({
        id: 'new-id',
        reason: 'missing monument field',
        destination: 'under-review/point-id/user-id/new-id.pdf',
      }),
    );
  });
});
