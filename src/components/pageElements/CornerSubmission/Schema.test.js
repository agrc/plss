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
  describe('helpers', () => {
    describe('scale and precision', () => {
      test.each([
        [12, { scale: 2, precision: 2 }, true],
        [12.12, { scale: 2, precision: 2 }, true],
        [12345678.123, { scale: 8, precision: 3 }, true],
        [12345678.12, { scale: 8, precision: 3 }, true],
        [12345678.1, { scale: 8, precision: 3 }, true],
        [12.12, { scale: 3, precision: 2 }, false],
        [12.1, { scale: 2, precision: 0 }, false],
        [null, { scale: 2, precision: 3 }, false],
        [undefined, { scale: 2, precision: 3 }, false],
        ['ab.abc', { scale: 2, precision: 3 }, false],
      ])(`number %s with %o is %s`, (value, properties, expected) => {
        expect(schemas.scaleAndPrecision(value, properties)).toEqual(expected);
      });
    });
  });
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

        expect(result.errors[0]).toBe('Coordinate System is a required field.');
      }
    );
  });
  describe('geographic coordinates', () => {
    describe('latitude', () => {
      describe('degrees', () => {
        const validSchema = {
          minutes: 1,
          seconds: 1,
        };

        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          [-10],
          [0],
          [300],
          [10.1],
        ])('shows proper error message for %j', (degrees) => {
          let result;

          try {
            schemas.latitudeSchema.validateSync({
              northing: { ...validSchema, degrees },
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Degrees must be a whole number from 37 to 42.'
          );
        });
      });
      describe('minutes', () => {
        const validSchema = {
          degrees: 38,
          seconds: 1,
        };

        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          [-10],
          [300],
          [10.1],
        ])('shows proper error message for %j', (minutes) => {
          let result;

          try {
            schemas.latitudeSchema.validateSync({
              northing: { ...validSchema, minutes },
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Minutes must be a whole number from 0 to 59.'
          );
        });
      });
      describe('seconds', () => {
        const validSchema = {
          degrees: 38,
          minutes: 1,
        };

        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          [-10],
          [300],
          [10.123456],
        ])('shows proper error message for %j', (seconds) => {
          let result;

          try {
            schemas.latitudeSchema.validateSync({
              northing: { ...validSchema, seconds },
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Seconds must be a number from 0 to 59.99999.'
          );
        });
      });
    });
    describe('longitude', () => {
      describe('degrees', () => {
        const validSchema = {
          minutes: 1,
          seconds: 1,
        };

        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          [-10],
          [0],
          [300],
          [109.1],
        ])('shows proper error message for %j', (degrees) => {
          let result;

          try {
            schemas.longitudeSchema.validateSync({
              easting: { ...validSchema, degrees },
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Degrees must be a whole number from 109 to 114.'
          );
        });
      });
      describe('minutes', () => {
        const validSchema = {
          degrees: 110,
          seconds: 1,
        };

        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          [-10],
          [300],
          [10.1],
        ])('shows proper error message for %j', (minutes) => {
          let result;

          try {
            schemas.longitudeSchema.validateSync({
              easting: { ...validSchema, minutes },
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Minutes must be a whole number from 0 to 59.'
          );
        });
      });
      describe('seconds', () => {
        const validSchema = {
          degrees: 110,
          minutes: 1,
        };

        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          [-10],
          [300],
          [10.123456],
        ])('shows proper error message for %j', (seconds) => {
          let result;

          try {
            schemas.longitudeSchema.validateSync({
              easting: { ...validSchema, seconds },
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Seconds must be a number from 0 to 59.99999.'
          );
        });
      });
    });
    describe('ellipsoid height', () => {
      describe('feet', () => {
        test.each([[null], [undefined], [''], ['garbage'], [0], [100000]])(
          'shows proper error message for %j',
          (elevation) => {
            let result;

            try {
              schemas.geographicHeightSchema.validateSync({
                unit: 'ft',
                elevation,
              });
            } catch (error) {
              result = error;
            }

            expect(result.errors[0]).toBe(
              'Ellipsoid Height (feet) must be a number from 2000 to 14000.'
            );
          }
        );
      });
      describe('meters', () => {
        test.each([[null], [undefined], [''], ['garbage'], [0], [100000]])(
          'shows proper error message for %j',
          (elevation) => {
            let result;

            try {
              schemas.geographicHeightSchema.validateSync({
                unit: 'm',
                elevation,
              });
            } catch (error) {
              result = error;
            }

            expect(result.errors[0]).toBe(
              'Ellipsoid Height (meters) must be a number from 600 to 4300.'
            );
          }
        );
      });
    });
  });
  describe('grid coordinates', () => {
    describe('zone', () => {
      const validSchema = {
        unit: 'ft',
        northing: 12345678,
        easting: 1234567,
        elevation: 2000,
      };
      test.each([[null], [undefined], [''], ['garbage'], [0], [100], [10.1]])(
        'shows proper error message for %j',
        (zone) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              zone,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'State Plane Zone is a required field.'
          );
        }
      );
    });
    describe('unit', () => {
      const validSchema = {
        zone: 'central',
        northing: 123456,
        easting: 1234567,
        elevation: 2000,
      };
      test.each([[null], [undefined], [''], ['garbage'], [0], [100], [10.1]])(
        'shows proper error message for %j',
        (unit) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              unit,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Horizontal units is a required field.'
          );
        }
      );
    });
    describe('northing', () => {
      describe('feet', () => {
        const validSchema = {
          zone: 'central',
          unit: 'ft',
          easting: 1234567,
          elevation: 2000,
        };
        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          ['abcdefg.abc'],
          [0],
          [100],
          [10.1],
          [-12345678.123],
          [123456789],
          [12345678.1234],
        ])('shows proper error message for %j', (northing) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              northing,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Northing value must contain eight values to the left of the decimal, and up to three to the right.'
          );
        });
      });
      describe('meters', () => {
        const validSchema = {
          zone: 'central',
          unit: 'm',
          easting: 123456,
          elevation: 2000,
        };
        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          ['abcdefg.abc'],
          [0],
          [100],
          [10.1],
          [-1234567.123],
          [12345678],
          [1234567.1234],
        ])('shows proper error message for %j', (northing) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              northing,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Northing value must contain seven values to the left of the decimal, and up to three to the right.'
          );
        });
      });
    });
    describe('easting', () => {
      describe('feet', () => {
        const validSchema = {
          zone: 'central',
          unit: 'ft',
          northing: 12345678,
          elevation: 2000,
        };
        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          ['abcdefg.abc'],
          [0],
          [100],
          [10.1],
          [-1234567.123],
          [123456],
          [12345678],
          [1234567.1234],
        ])('shows proper error message for %j', (easting) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              easting,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Easting value must contain seven values to the left of the decimal, and up to three to the right.'
          );
        });
      });
      describe('meters', () => {
        const validSchema = {
          zone: 'central',
          unit: 'm',
          northing: 1234567,
          elevation: 2000,
        };
        test.each([
          [null],
          [undefined],
          [''],
          ['garbage'],
          ['abcdefg.abc'],
          [0],
          [100],
          [10.1],
          [-123456.123],
          [12345],
          [1234567],
          [123456.1234],
        ])('shows proper error message for %j', (easting) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              easting,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Easting value must contain six values to the left of the decimal, and up to three to the right.'
          );
        });
      });
    });
    describe('elevation', () => {
      describe('feet', () => {
        const validSchema = {
          zone: 'central',
          unit: 'ft',
          northing: 12345678,
          easting: 1234567,
        };
        test.each([
          ['garbage'],
          ['abcdefg.abc'],
          [0],
          [100],
          [10.1],
          [-1234567.123],
          [123456],
          [12345678],
          [1234567.1234],
        ])('shows proper error message for %j', (elevation) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              elevation,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Elevation (feet) must be a number from 2000 to 14000.'
          );
        });
      });
      describe('meters', () => {
        const validSchema = {
          zone: 'central',
          unit: 'm',
          northing: 1234567,
          easting: 123456,
        };
        test.each([
          ['garbage'],
          ['abcdefg.abc'],
          [0],
          [100],
          [10.1],
          [-123456.123],
          [12345],
          [1234567],
          [123456.1234],
        ])('shows proper error message for %j', (elevation) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              elevation,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(
            'Elevation (meters) must be a number from 600 to 4300.'
          );
        });
      });
    });
    describe('datum', () => {
      const validSchema = {
        zone: 'central',
        unit: 'm',
        northing: 1234567,
        easting: 123456,
      };
      test.each([
        ['garbage'],
        ['abcdefg.abc'],
        [0],
        [100],
        [10.1],
        [-123456.123],
        [12345],
        [1234567],
        [123456.1234],
      ])('shows proper error message for %j', (verticalDatum) => {
        let result;

        try {
          schemas.gridCoordinatesSchema.validateSync({
            ...validSchema,
            verticalDatum,
          });
        } catch (error) {
          result = error;
        }

        expect(result.errors[0]).toBe('Vertical datum is a required field.');
      });
    });
  });
  describe('images', () => {
    test.each([
      ['garbage'],
      ['/submitters/abc/existing/cdf/map.png'],
      ['/submitters/abc/new/cdf/maps.pdf'],
      ['/submitters/new/cdf/map.pdf'],
      ['/submitters/new/map.pdf'],
      [0],
      [100],
      [10.1],
    ])('%j is not a valid image', (map) => {
      let result;

      try {
        schemas.imagesSchema.validateSync({
          map,
        });
      } catch (error) {
        result = error;
      }

      expect(result.errors[0]).toBe(
        'Images must be one of the following types: jpeg, jpg, png, tiff.'
      );
    });
  });
  describe('existing', () => {
    test.each([
      ['garbage'],
      ['/submitters/abc/existing/cdf/existing-sheet.png'],
      ['/submitters/abc/new/cdf/existing-sheet.pdf'],
      ['/submitters/existing/cdf/existing-sheet.pdf'],
      ['/submitters/existing/existing-sheet.pdf'],
      [0],
      [100],
      [10.1],
    ])('%s is not a valid pdf', (pdf) => {
      let result;

      try {
        schemas.existingSheetSchema.validateSync({
          pdf,
        });
      } catch (error) {
        result = error;
      }

      expect(result.errors[0]).toBe('An existing tiesheet PDF is required.');
    });
  });
});
