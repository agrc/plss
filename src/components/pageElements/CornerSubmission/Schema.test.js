import { describe, expect, test } from 'vitest';
import * as schemas from './Schema.mjs';

const createText = (length) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

describe('schema tests', () => {
  describe('metadata schema', () => {
    describe('section', () => {
      const validSchema = {
        accuracy: 'survey',
        status: 'existing',
        description: 'description',
        notes: 'notes',
        mrrc: false,
        corner: 'NW',
      };

      test.each([[null], [undefined], [''], ['garbage'], [0], [40]])(
        'shows proper error message for %j',
        (section) => {
          let result;

          try {
            schemas.metadataSchema.validateSync({
              ...validSchema,
              section,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Section must be a whole number from 1 to 36.'
          );
        }
      );
    });
    describe('corner', () => {
      const validSchema = {
        accuracy: 'survey',
        status: 'existing',
        description: 'description',
        notes: 'notes',
        mrrc: false,
        section: 1,
      };

      test.each([[null], [undefined], [''], ['garbage'], [0], [100]])(
        'shows proper error message for %j',
        (corner) => {
          let result;

          try {
            schemas.metadataSchema.validateSync({
              ...validSchema,
              corner,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe('Corner is a required field.');
        }
      );
    });
    describe('status', () => {
      const validSchema = {
        accuracy: 'survey',
        corner: 'NW',
        description: 'description',
        notes: 'notes',
        mrrc: false,
        section: 1,
      };

      test.each([[null], [undefined], [''], ['garbage'], [0], [100]])(
        'shows proper error message for %j',
        (status) => {
          let result;

          try {
            schemas.metadataSchema.validateSync({
              ...validSchema,
              status,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe('Status is a required field.');
        }
      );
    });
    describe('accuracy', () => {
      const validSchema = {
        status: 'existing',
        corner: 'NW',
        description: 'description',
        notes: 'notes',
        mrrc: false,
        section: 1,
      };

      test.each([[null], [undefined], [''], ['garbage'], [0], [100]])(
        'shows proper error message for %j',
        (accuracy) => {
          let result;

          try {
            schemas.metadataSchema.validateSync({
              ...validSchema,
              accuracy,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe('Accuracy is a required field.');
        }
      );
    });
    describe('description', () => {
      const validSchema = {
        status: 'existing',
        corner: 'NW',
        accuracy: 'survey',
        notes: 'notes',
        mrrc: false,
        section: 1,
      };

      test.each([[null], [undefined], ['']])(
        'shows proper error message for %j',
        (description) => {
          let result;

          try {
            schemas.metadataSchema.validateSync({
              ...validSchema,
              description,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe('Description is a required field.');
        }
      );

      test('shows proper error message for too much text', () => {
        let result;

        try {
          schemas.metadataSchema.validateSync({
            ...validSchema,
            description: createText(1001),
          });
        } catch (error) {
          result = error;
        }

        expect(result.errors[0]).toBe(
          'Description must be at most 1000 characters.'
        );
      });
    });
    describe('notes', () => {
      const validSchema = {
        status: 'existing',
        corner: 'NW',
        accuracy: 'survey',
        description: 'description',
        mrrc: false,
        section: 1,
      };

      test.each([[null], [undefined], ['']])(
        'shows proper error message for %j',
        (notes) => {
          let result;

          try {
            schemas.metadataSchema.validateSync({
              ...validSchema,
              notes,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe('Notes is a required field.');
        }
      );

      test('shows proper error message for too much text', () => {
        let result;

        try {
          schemas.metadataSchema.validateSync({
            ...validSchema,
            notes: createText(1001),
          });
        } catch (error) {
          result = error;
        }

        expect(result.errors[0]).toBe('Notes must be at most 1000 characters.');
      });
    });
  });
  describe('datum', () => {
    test.each([[null], [undefined], [''], ['garbage'], [0], [100]])(
      'shows proper error message for %j',
      (datum) => {
        let result;

        try {
          schemas.coordinatePickerSchema.validateSync({
            datum,
          });
        } catch (error) {
          result = error;
        }

        expect(result.errors[0]).toBe('Datum is a required field.');
      }
    );
  });
  describe('geographic coordinates', () => {
    describe('latitude', () => {});
    describe('longitude', () => {});
    describe('ellipsoid height', () => {});
  });
  describe('grid coordinates', () => {});
  describe('images', () => {});
  describe('existing', () => {});
});
