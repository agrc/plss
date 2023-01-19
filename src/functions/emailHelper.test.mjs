import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { getContactsToNotify } from './emailHelpers.mjs';

const docMock = vi.fn(() => {
  return {
    get: vi.fn(() => {
      return {
        data: vi.fn(() => {
          return {
            ugrc: [{ name: 'UGRC', email: 'ugrc-email' }],
            beaver: [{ name: 'beaver', email: 'beaver-email' }],
          };
        }),
      };
    }),
  };
});
let db;
describe('email helper tests', async () => {
  beforeAll(() => {
    db = vi.fn(() => {
      return {
        collection: vi.fn(() => {
          return {
            doc: docMock,
          };
        }),
      };
    })();
  });
  afterAll(() => {
    vi.clearAllMocks();
  });

  test('it returns the ugrc contact if no county is provided', async () => {
    await expect(getContactsToNotify(db, null)).resolves.toStrictEqual([
      { name: 'UGRC', email: 'ugrc-email' },
    ]);
  });
  test('it returns the combined contacts for the county', async () => {
    await expect(getContactsToNotify(db, 'beaver')).resolves.toStrictEqual([
      { name: 'UGRC', email: 'ugrc-email' },
      { name: 'beaver', email: 'beaver-email' },
    ]);
  });
  test('it returns the combined contacts for the county despite the case', async () => {
    await expect(getContactsToNotify(db, 'BEAVER')).resolves.toStrictEqual([
      { name: 'UGRC', email: 'ugrc-email' },
      { name: 'beaver', email: 'beaver-email' },
    ]);
  });
});
