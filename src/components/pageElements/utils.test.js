import { describe, expect, test } from 'vitest';
import { getPointIdWhereClause, normalizePointId } from './utils.js';

describe('normalizePointId', () => {
  test('returns an empty string when the point id is empty', () => {
    expect(normalizePointId('')).toBe('');
  });

  test('returns an empty string when the point id is nullish', () => {
    expect(normalizePointId()).toBe('');
  });

  test('returns a trimmed point id value', () => {
    expect(normalizePointId(' UT260020S0010E0_500640 ')).toBe('UT260020S0010E0_500640');
  });
});

describe('getPointIdWhereClause', () => {
  test('builds a where clause for a standard point id', () => {
    expect(getPointIdWhereClause('UT260020S0010E0_500640')).toBe("point_id='UT260020S0010E0_500640'");
  });

  test('escapes apostrophes in the point id', () => {
    expect(getPointIdWhereClause("UT26'0020")).toBe("point_id='UT26''0020'");
  });
});
