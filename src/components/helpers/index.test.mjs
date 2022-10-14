import { parseBool, getDefault, formatDatum } from './index.mjs';
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
