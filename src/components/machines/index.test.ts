import { describe, expect, test } from 'vitest';
import { createActor } from 'xstate';
import { dmsToDecimalDegrees, submissionMachine, updateContext } from './index.js';

const startFromForm = (form: string, context: { type: 'new' | 'existing' }) => {
  const snapshot = submissionMachine.resolveState({
    value: { form, projecting: 'idle' },
    context,
  });
  const actor = createActor(submissionMachine, { snapshot });
  actor.start();

  return actor;
};

describe('dmsToDecimalDegrees', () => {
  test('converts degrees, minutes, and seconds to decimal degrees', () => {
    expect(
      dmsToDecimalDegrees({
        degrees: 40,
        minutes: 42,
        seconds: 30,
      }),
    ).toBeCloseTo(40.7083333333);
  });
});

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
    expect(updateContext({ property: 'value' }, 'property', 'new value')).toEqual({
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
        {
          geography: {
            northing: { degrees: 1, minutes: 1, seconds: 1 },
          },
        },
        'geography',
        {
          elevation: 100,
        },
      ),
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

describe('submissionMachine form flow', () => {
  test('starts a new submission from idle', () => {
    const actor = startFromForm('idle', { type: 'new' });

    actor.send({ type: 'start submission' });

    expect(actor.getSnapshot().matches({ form: 'adding metadata' })).toBe(true);
  });

  test('stays on the success screen after a completed submission', () => {
    const actor = startFromForm('reviewing', { type: 'new' });

    actor.send({ type: 'NEXT' });
    actor.send({ type: 'start submission' });

    expect(actor.getSnapshot().matches({ form: 'submitted' })).toBe(true);
    expect(actor.getSnapshot().matches({ form: 'adding metadata' })).toBe(false);
  });

  test('moves to the submission error screen when review fails', () => {
    const actor = startFromForm('reviewing', { type: 'existing' });

    actor.send({ type: 'ERROR' });

    expect(actor.getSnapshot().matches({ form: 'submission error' })).toBe(true);
  });
});
