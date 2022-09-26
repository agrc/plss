import { describe, expect, test } from 'vitest';
import { getStateValue } from './CornerSubmission.jsx';

const id = 'UT260080S0040W0_360520';
const value = 'value';

describe('CornerSubmission', () => {
  describe('getStateValue', () => {
    describe('top level properties', () => {
      test('it returns the value for the property', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {
              property: value,
            },
          },
        };

        expect(getStateValue(state, id, 'property')).toBe(value);
      });

      test('it returns empty string for a property that does not exist', () => {
        const state = {};

        expect(getStateValue(state, id, 'property')).toBe('');
      });

      test('it returns empty string for a property that does not exist with submissions', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {},
          },
        };

        expect(getStateValue(state, id, 'property')).toBe('');
      });

      test('it returns empty string for a property that is null', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {
              property: null,
            },
          },
        };

        expect(getStateValue(state, id, 'property')).toBe('');
      });
    });

    describe('nested properties', () => {
      test('it returns the value for a sub property', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {
              sub: {
                property: value,
              },
            },
          },
        };
        expect(getStateValue(state, id, 'sub.property')).toBe(value);
      });

      test('it returns empty string for a sub property where the sub object does not exist', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {},
          },
        };
        expect(getStateValue(state, id, 'sub.property')).toBe('');
      });

      test('it returns empty string for a sub property where the property does not exist', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {
              sub: {},
            },
          },
        };
        expect(getStateValue(state, id, 'sub.property')).toBe('');
      });

      test('it returns empty string for a sub property that is null', () => {
        const state = {
          submissions: {
            UT260080S0040W0_360520: {
              sub: {
                property: null,
              },
            },
          },
        };
        expect(getStateValue(state, id, 'sub.property')).toBe('');
      });
    });
  });
});
