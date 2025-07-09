import { GeoPoint } from 'firebase-admin/firestore';
import firebaseFunctionsTest from 'firebase-functions-test';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import {
  validateSubmission,
  validateNewSubmission,
  validateExistingSubmission,
  formatDataForFirestore,
  formatExistingCorner,
  formatNewCorner,
  getLatLon,
  convertUndefinedToNull,
} from './postCorner.js';
import { postCorner } from '../index.js';

const addMock = vi.fn();
const docMock = vi.fn(() => 'ref');
// addMock.mockReturnValue(Promise.resolve(true));

describe('postCorner', () => {
  const date = new Date('2021-01-01T00:00:00.000Z');
  const user = {
    uid: 'abc',
    displayName: 'John Doe',
  };
  const metadata = {
    created_at: date,
    blm_point_id: 'point_id',
    county: 'Beaver',
    published: false,
    submitted_by: {
      id: user.uid,
      name: user.displayName,
      ref: 'ref',
    },
    status: {
      ugrc: {
        approved: null,
        comments: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      county: {
        approved: null,
        comments: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      sgid: {
        approved: null,
      },
      user: {
        cancelled: null,
      },
    },
  };

  beforeAll(() => {
    vi.mock('firebase-admin/firestore', async () => {
      const { GeoPoint } = await vi.importActual('firebase-admin/firestore');

      return {
        GeoPoint,
        getFirestore: vi.fn(() => {
          return {
            collection: vi.fn(() => {
              return {
                doc: docMock,
                add: addMock,
              };
            }),
          };
        }),
      };
    });
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });
  afterAll(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  describe('validate new submission', () => {
    test('it throws on invalid data', async () => {
      await expect(validateNewSubmission()).rejects.toThrowError();
    });

    test('it returns true for valid data', async () => {
      const input = {
        blmPointId: 'point_id',
        county: 'Beaver',
        type: 'new',
        metadata: {
          corner: 'NW',
          section: 1,
          mrrc: true,
          notes: 'Some general notes',
          description: 'A monument description',
          collected: '2021-01-01',
          accuracy: 'survey',
          status: 'existing',
        },
        datum: 'grid-nad83',
        grid: {
          verticalDatum: 'NAVD88',
          unit: 'm',
          elevation: 2500,
          easting: 471992.726,
          northing: 1155931.4,
          zone: 'north',
        },
        geographic: {
          northing: { degrees: 41, minutes: 44, seconds: 13.0467 },
          easting: { degrees: 111, minutes: 50, seconds: 11.99469 },
          unit: 'ft',
          elevation: 4500,
        },
        images: {
          map: 'submitters/user_id/new/point_id/map.png',
          monument: '',
          closeUp: '',
          extra1: '',
          extra2: '',
          extra3: '',
          extra4: '',
          extra5: '',
          extra6: '',
          extra7: '',
          extra8: '',
          extra9: '',
          extra10: '',
        },
      };

      await expect(validateNewSubmission(input)).resolves.toBe(true);
      await expect(validateSubmission(input)).resolves.toBe(true);
    });
  });
  describe('validate existing submission', () => {
    test('it throws on invalid data', async () => {
      await expect(validateExistingSubmission()).rejects.toThrowError();
    });

    test('it returns true for valid data', async () => {
      const input = {
        blmPointId: 'point_id',
        county: 'Beaver',
        type: 'existing',
        existing: {
          pdf: 'submitters/uid/existing/point_id/existing-sheet.pdf',
          mrrc: false,
        },
        datum: 'geographic-nad83',
        geographic: {
          northing: { seconds: 10, minutes: 14, degrees: 41 },
          easting: { seconds: 29, minutes: 14, degrees: 111 },
          unit: 'm',
          elevation: 3200,
        },
        grid: {
          zone: 'north',
          unit: 'm',
          easting: 521679.496,
          northing: 1100285.503,
          verticalDatum: '',
          elevation: null,
        },
      };

      await expect(validateExistingSubmission(input)).resolves.toBe(true);
    });

    test('it returns true for valid data when coordinates are skipped', async () => {
      const input = {
        blmPointId: 'point_id',
        county: 'Beaver',
        type: 'existing',
        existing: {
          mrrc: false,
          pdf: 'submitters/uid/existing/point_id/existing-sheet.pdf',
        },
      };

      await expect(validateExistingSubmission(input)).resolves.toBe(true);
    });
  });
  describe('formatting records', () => {
    describe('new corners', () => {
      const parts = {
        blmPointId: 'point_id',
        county: 'Beaver',
        type: 'new',
        metadata: {
          corner: 'NW',
          section: 1,
          mrrc: true,
          collected: '2021-01-01',
          notes: 'Some general notes',
          description: 'A monument description',
          accuracy: 'survey',
          status: 'existing',
        },
        datum: 'grid-nad83',
        grid: {
          verticalDatum: 'NAVD88',
          unit: 'm',
          elevation: 2500,
          easting: 471992.726,
          northing: 1155931.4,
          zone: 'north',
        },
        geographic: {
          northing: { degrees: 41, minutes: 44, seconds: 13.0467 },
          easting: { degrees: 111, minutes: 50, seconds: 11.99469 },
          unit: 'ft',
          elevation: 4500,
        },
        images: {
          map: 'submitters/user_id/new/point_id/map.png',
          monument: '',
          closeUp: '',
          extra1: '',
          extra2: '',
          extra3: '',
          extra4: '',
          extra5: '',
          extra6: '',
          extra7: '',
          extra8: '',
          extra9: '',
          extra10: '',
        },
      };

      test('it returns the same object plus metadata', () => {
        const output = {
          metadata: parts.metadata,
          images: parts.images,
          geographic: parts.geographic,
          grid: parts.grid,
          datum: parts.datum,
          location: new GeoPoint(41.73695741666667, -111.83666519166667),
          ...metadata,
          type: 'new',
        };

        expect(formatDataForFirestore(parts, user)).toEqual(output);
        expect(docMock).toHaveBeenCalledWith('abc');
        expect(docMock).toHaveBeenCalledOnce();
        expect(formatNewCorner(parts, metadata)).toEqual(output);
      });

      test('it plucks out over posted data', () => {
        parts.hackers = false;
        parts.overPosted = {
          more: 'stuff',
        };

        const output = {
          metadata: parts.metadata,
          images: parts.images,
          geographic: parts.geographic,
          grid: parts.grid,
          datum: parts.datum,
          location: new GeoPoint(41.73695741666667, -111.83666519166667),
          extra: 'metadata',
          type: 'new',
        };

        expect(formatNewCorner(parts, { extra: 'metadata' })).toEqual(output);
      });

      test('it handles undefined values', () => {
        expect(
          convertUndefinedToNull({
            type: 'new',
            metadata: {
              status: undefined,
              accuracy: undefined,
              collected: undefined,
              description: undefined,
              notes: undefined,
              mrrc: undefined,
              section: undefined,
              corner: undefined,
            },
            datum: 'geographic-nad83',
            grid: {
              northing: 1142613.184,
              easting: 470654.258,
              zone: 'north',
              unit: 'm',
              elevation: undefined,
              verticalDatum: null,
            },
            geographic: {
              northing: { degrees: 41, minutes: 37, seconds: 1.19 },
              easting: { degrees: 111, minutes: 51, seconds: 7.58 },
              unit: 'm',
              elevation: 765,
            },
            images: {
              map: '',
              monument: '',
              closeUp: '',
              extra1: '',
              extra2: '',
              extra3: '',
              extra4: '',
              extra5: '',
              extra6: '',
              extra7: '',
              extra8: '',
              extra9: '',
              extra10: '',
            },
          }),
        ).toEqual({
          type: 'new',
          metadata: {
            status: null,
            accuracy: null,
            collected: null,
            description: null,
            notes: null,
            mrrc: null,
            section: null,
            corner: null,
          },
          datum: 'geographic-nad83',
          grid: {
            northing: 1142613.184,
            easting: 470654.258,
            zone: 'north',
            unit: 'm',
            elevation: null,
            verticalDatum: null,
          },
          geographic: {
            northing: { degrees: 41, minutes: 37, seconds: 1.19 },
            easting: { degrees: 111, minutes: 51, seconds: 7.58 },
            unit: 'm',
            elevation: 765,
          },
          images: {
            map: '',
            monument: '',
            closeUp: '',
            extra1: '',
            extra2: '',
            extra3: '',
            extra4: '',
            extra5: '',
            extra6: '',
            extra7: '',
            extra8: '',
            extra9: '',
            extra10: '',
          },
        });
      });
    });
    describe('existing corners', () => {
      const parts = {
        blmPointId: 'point_id',
        type: 'existing',
        county: 'Beaver',
        datum: 'grid-nad83',
        grid: {
          verticalDatum: 'NAVD88',
          unit: 'm',
          elevation: 2500,
          easting: 471992.726,
          northing: 1155931.4,
          zone: 'north',
        },
        geographic: {
          northing: { degrees: 41, minutes: 44, seconds: 13.0467 },
          easting: { degrees: 111, minutes: 50, seconds: 11.99469 },
          unit: 'ft',
          elevation: 4500,
        },
        existing: {
          pdf: 'submitters/user_id/new/point_id/map.png',
          mrrc: false,
        },
      };

      test('it returns the same object plus metadata', () => {
        const output = {
          pdf: parts.existing.pdf,
          geographic: parts.geographic,
          grid: parts.grid,
          datum: parts.datum,
          location: new GeoPoint(41.73695741666667, -111.83666519166667),
          metadata: {
            mrrc: false,
          },
          ...metadata,
          type: 'existing',
        };

        expect(formatDataForFirestore(parts, user)).toEqual(output);
        expect(formatExistingCorner(parts, metadata)).toEqual(output);
      });

      test('it returns the same object plus metadata without coordinates', () => {
        const input = {
          existing: parts.existing,
        };

        const output = {
          pdf: parts.existing.pdf,
          extra: 'metadata',
          type: 'existing',
          metadata: {
            mrrc: false,
          },
        };

        expect(formatExistingCorner(input, { extra: 'metadata' })).toEqual(
          output,
        );
      });
    });
    test('it throws on wrong submission type', () => {
      expect(() =>
        formatDataForFirestore({ type: 'wrong' }, user),
      ).toThrowError();
    });
  });
  describe('convert dms to lat lon', () => {
    test('it returns longitude, latitude', () => {
      expect(
        getLatLon({
          northing: { degrees: 41, minutes: 44, seconds: 13.0467 },
          easting: { degrees: 111, minutes: 50, seconds: 11.99469 },
        }),
      ).toEqual([41.73695741666667, -111.83666519166667]);
    });
    test('it returns null if empty parts', () => {
      expect(
        getLatLon({
          easting: { degrees: 111, minutes: 50, seconds: 11.99469 },
        }),
      ).toBeNull();
      expect(
        getLatLon({
          northing: { degrees: 41, minutes: 44, seconds: 13.0467 },
        }),
      ).toBeNull();
      expect(getLatLon({})).toBeNull();
    });
  });
  describe('post corner', () => {
    const { wrap } = firebaseFunctionsTest();
    const func = wrap(postCorner);

    test('throws without authentication', async () => {
      await expect(() =>
        func({ data: undefined, auth: null }),
      ).rejects.toThrowError('You must log in');
    });
    test('throws without data', async () => {
      await expect(() =>
        func({ data: undefined, auth: user }),
      ).rejects.toThrowError('No data provided');
    });
    test('throws with an valid submission', async () => {
      await expect(() => func({ data: {}, auth: user })).rejects.toThrowError(
        'corner submission data is invalid',
      );
    });
    test('returns 1 for a valid submission', async () => {
      await expect(
        func({
          data: {
            blmPointId: 'point_id',
            type: 'existing',
            county: 'Beaver',
            existing: {
              pdf: 'submitters/uid/existing/point_id/existing-sheet.pdf',
              mrrc: true,
            },
            datum: 'geographic-nad83',
            geographic: {
              northing: { seconds: 10, minutes: 14, degrees: 41 },
              easting: { seconds: 29, minutes: 14, degrees: 111 },
              unit: 'm',
              elevation: 3200,
            },
            grid: {
              zone: 'north',
              unit: 'm',
              easting: 521679.496,
              northing: 1100285.503,
              verticalDatum: '',
              elevation: null,
            },
          },
          auth: user,
        }),
      ).resolves.toBe(1);
      expect(addMock).toHaveBeenCalledTimes(1);
    });
  });
});
