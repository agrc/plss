import {
  parseBool,
  getDefault,
  formatDatum,
  createProjectFormData,
  roundAccurately,
  getStatus,
} from './index.js';
import { describe, expect, test } from 'vitest';

describe('parseBool', () => {
  test('it returns default value for empties', () => {
    expect(parseBool(null, false)).toBe(false);
    expect(parseBool(undefined, false)).toBe(false);
    expect(parseBool('', false)).toBe(false);
  });

  test('it returns bool value for strings', () => {
    expect(parseBool('true', false)).toBe(true);
    expect(parseBool('false', false)).toBe(false);
  });
});

describe('getDefault', () => {
  test('it returns default value for empties', () => {
    expect(getDefault(null)).toBe('-');
    expect(getDefault(undefined)).toBe('-');
    expect(getDefault('')).toBe('-');
    expect(getDefault('null')).toBe('-');
    expect(getDefault('<NULL>')).toBe('-');
  });

  test('it returns value for strings', () => {
    expect(getDefault('test')).toBe('test');
    expect(getDefault('test', '-', 'suffix')).toBe('test suffix');
  });
});

describe('formatDatum', () => {
  test('it handles empty values', () => {
    expect(formatDatum(null)).toBe('');
    expect(formatDatum(undefined)).toBe('');
    expect(formatDatum('')).toBe('');
  });

  test('it handles unexpected values', () => {
    expect(formatDatum('unknown')).toBe('-');
  });

  test('it formats datum', () => {
    expect(formatDatum('geographic-nad83')).toBe('NAD83 Geographic');
    expect(formatDatum('grid-nad83')).toBe('NAD83 2011 State Plane');
  });
});

describe('roundAccurately', () => {
  test.each([
    [1.123456789, 2, 1.12],
    [1.123456789, 3, 1.123],
    [1.123456789, 5, 1.12346],
  ])('roundAccurately(%d, %i) -> %d', (value, places, expected) => {
    expect(roundAccurately(value, places)).toBe(expected);
  });
});

describe('createProjectFormData', () => {
  test('it handles empty values', () => {
    expect(createProjectFormData({})).toBeNull();
  });

  test('it handles unexpected values', () => {
    expect(createProjectFormData({ type: 'unknown' })).toBeNull();
  });

  test.each([
    [
      'north',
      'm',
      {
        inSr: 6620,
        outSr: 6318,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'central',
      'm',
      {
        inSr: 6619,
        outSr: 6318,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'south',
      'm',
      {
        inSr: 6621,
        outSr: 6318,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'north',
      'ft',
      {
        inSr: 103166,
        outSr: 6318,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'central',
      'ft',
      {
        inSr: 103167,
        outSr: 6318,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'south',
      'ft',
      {
        inSr: 103168,
        outSr: 6318,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
  ])(
    'it creates project form data for grid coordinates (%s, %s)',
    (zone, unit, expected) => {
      const formData = createProjectFormData({
        type: 'grid',
        coordinates: { zone, unit, easting: 2, northing: 1 },
      });

      expect(formData).toStrictEqual(expected);
    },
  );

  test.each([
    [
      'north',
      'm',
      {
        inSr: 6318,
        outSr: 6620,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'central',
      'm',
      {
        inSr: 6318,
        outSr: 6619,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
    [
      'south',
      'm',
      {
        inSr: 6318,
        outSr: 6621,
        f: 'json',
        geometries:
          '{"geometryType":"esriGeometryPoint","geometries":[{"x":2,"y":1}]}',
      },
    ],
  ])(
    'it creates project form data for geographic coordinates (%s, %s)',
    (zone, unit, expected) => {
      const formData = createProjectFormData({
        type: 'geographic',
        coordinates: { zone, unit, y: 1, x: 2 },
      });

      expect(formData).toStrictEqual(expected);
    },
  );
});

describe('get submission status', () => {
  test.each([
    {
      state: 'initial submission',
      values: {
        published: false,
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
      result: {
        label: 'Pending UGRC review',
        received: 'yes',
        reviewed: 'waiting',
        sheetPublished: 'pending',
        dataPublished: 'pending',
      },
    },
    {
      state: 'ugrc approved',
      values: {
        published: false,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
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
      result: {
        label: 'Pending county review',
        received: 'yes',
        reviewed: 'waiting',
        sheetPublished: 'pending',
        dataPublished: 'pending',
      },
    },
    {
      state: 'ugrc rejected',
      values: {
        published: false,
        ugrc: {
          approved: false,
          comments: 'ugrc comment',
          reviewedAt: new Date(),
          reviewedBy: 'ugrc reviewer',
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
      result: {
        label: 'UGRC rejected submission. ugrc comment',
        received: 'yes',
        reviewed: 'rejected',
        sheetPublished: 'rejected',
        dataPublished: 'rejected',
      },
    },
    {
      state: 'county approved',
      values: {
        published: false,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'ugrc reviewer',
        },
        county: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'auto approved',
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      },
      result: {
        label: 'Pending monument record sheet publishing',
        received: 'yes',
        reviewed: 'approved',
        sheetPublished: 'waiting',
        dataPublished: 'pending',
      },
    },
    {
      state: 'county rejected',
      values: {
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: null,
        },
        county: {
          approved: false,
          comments: 'county comment',
          reviewedAt: new Date(),
          reviewedBy: null,
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      },
      result: {
        label: 'The county rejected the submission. county comment',
        received: 'yes',
        reviewed: 'rejected',
        sheetPublished: 'rejected',
        dataPublished: 'rejected',
      },
    },
    {
      state: 'sheet published',
      values: {
        published: true,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'test reviewer',
        },
        county: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'test reviewer',
        },
        sgid: {
          approved: null,
        },
        user: {
          cancelled: null,
        },
      },
      result: {
        label: 'Pending PLSS geometry corrections',
        received: 'yes',
        reviewed: 'approved',
        sheetPublished: 'yes',
        dataPublished: 'waiting',
      },
    },
    {
      state: 'geometry corrections complete',
      values: {
        published: true,
        ugrc: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'test reviewer',
        },
        county: {
          approved: true,
          comments: null,
          reviewedAt: new Date(),
          reviewedBy: 'test reviewer',
        },
        sgid: {
          approved: true,
        },
        user: {
          cancelled: null,
        },
      },
      result: {
        label: 'Sheet and geometry corrections are live',
        received: 'yes',
        reviewed: 'approved',
        sheetPublished: 'yes',
        dataPublished: 'yes',
      },
    },
  ])('getStatus returns $result.label on $state', ({ values, result }) => {
    expect(getStatus(values)).toEqual(result);
  });
});
