import { describe, expect, test } from 'vitest';
import { updateContext } from './index.js';

describe('updateContext', () => {
  test('it can add a simple property to a null object', () => {
    expect(updateContext(null, 'property', 'value')).toEqual({
      property: 'value',
    });
  });

  test('it can add a simple property to an empty object', () => {
    expect(updateContext({}, 'property', 'value')).toEqual({
      property: 'value',
    });
  });

  test('it can update an existing property on an existing object', () => {
    expect(
      updateContext({ property: 'value' }, 'property', 'new value')
    ).toEqual({
      property: 'new value',
    });
  });

  test('it can update a property with an object', () => {
    expect(updateContext({}, 'property', { a: 1, b: 2, c: 3 })).toEqual({
      property: { a: 1, b: 2, c: 3 },
    });
  });

  test('it can merge a property within an object', () => {
    expect(
      updateContext(
        { geography: { northing: { degrees: 1, minutes: 1, seconds: 1 } } },
        'geography',
        { elevation: 100 }
      )
    ).toEqual({
      geography: {
        northing: {
          degrees: 1,
          minutes: 1,
          seconds: 1,
        },
        elevation: 100,
      },
    });
  });
});
