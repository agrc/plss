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
        [12, { precision: 2 }, true],
        [12.12, { precision: 2 }, true],
        [12345678.123, { precision: 3 }, true],
        [12345678.12, { precision: 3 }, true],
        [12345678.1, { precision: 3 }, true],
        [12.1, { precision: 0 }, false],
        [null, { precision: 3 }, false],
        [undefined, { precision: 3 }, false],
        ['ab.abc', { precision: 3 }, false],
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
        collected: '2021-01-01',
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
        collected: '2021-01-01',
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
        collected: '2021-01-01',
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
    describe('collected', () => {
      const validSchema = {
        accuracy: 'survey',
        corner: 'NW',
        status: 'existing',
        description: 'description',
        notes: 'notes',
        mrrc: false,
        section: 1,
      };

      test.each([
        [null, 'Collection date is a required field.'],
        [undefined, 'Collection date is a required field.'],
        ['', 'Collection date is a required field.'],
        ['garbage', 'Collection date is a required field.'],
        [100, 'Collection date is too old.'],
      ])('shows proper error message for %j', (collected, expectedError) => {
        let result;

        try {
          schemas.metadataSchema.validateSync({
            ...validSchema,
            collected,
          });
        } catch (error) {
          result = error;
        }

        expect(result.errors[0]).toBe(expectedError);
      });
    });
    describe('accuracy', () => {
      const validSchema = {
        collected: '2021-01-01',
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
        collected: '2021-01-01',
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
        collected: '2021-01-01',
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
            'Degrees must be a whole number from 36 to 42.'
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
      const errors = {
        northingMeters: {
          generic:
            'Northing value must contain seven values to the left of the decimal, and up to three to the right.',
          min: 'Northing value must be greater than or equal to 2018522',
          max: 'Northing value must be less than or equal to 2305365',
        },
        northingFeet: {
          generic:
            'Northing value must contain eight values to the left of the decimal, and up to three to the right.',
          min: 'Northing value must be greater than or equal to 6622436',
          max: 'Northing value must be less than or equal to 7563519',
        },
      };

      describe('feet', () => {
        const validSchema = {
          zone: 'central',
          unit: 'ft',
          easting: 911358,
          elevation: 2000,
        };
        test.each([
          [null, errors.northingFeet.generic],
          [undefined, errors.northingFeet.generic],
          ['', errors.northingFeet.generic],
          ['garbage', errors.northingFeet.generic],
          ['abcdefg.abc', errors.northingFeet.generic],
          [0, errors.northingFeet.min],
          [100, errors.northingFeet.min],
          [10.1, errors.northingFeet.min],
          [-12345678.123, errors.northingFeet.min],
          [7563510.0001, errors.northingFeet.generic],
          [123456789, errors.northingFeet.max],
          [12345678.1234, errors.northingFeet.max],
        ])('shows proper error message for %j', (northing, expectedError) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              northing,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(expectedError);
        });
      });
      describe('meters', () => {
        const validSchema = {
          zone: 'central',
          unit: 'm',
          easting: 277790,
          elevation: 2000,
        };
        test.each([
          [null, errors.northingMeters.generic],
          [undefined, errors.northingMeters.generic],
          ['', errors.northingMeters.generic],
          ['garbage', errors.northingMeters.generic],
          ['abcdefg.abc', errors.northingMeters.generic],
          [0, errors.northingMeters.min],
          [100, errors.northingMeters.min],
          [10.1, errors.northingMeters.min],
          [-1234567.123, errors.northingMeters.min],
          [1234567.1234, errors.northingMeters.min],
          [12345678, errors.northingMeters.max],
          [2018522.1234, errors.northingMeters.generic],
        ])('shows proper error message for %j', (northing, expectedError) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              northing,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(expectedError);
        });
      });
    });
    describe('easting', () => {
      const errors = {
        eastingFeet: {
          generic:
            'Easting value must contain seven values to the left of the decimal, and up to three to the right.',
          min: 'Easting value must be greater than or equal to 911357',
          max: 'Easting value must be less than or equal to 2338732',
        },
        eastingMeters: {
          generic:
            'Easting value must contain six values to the left of the decimal, and up to three to the right.',
          min: 'Easting value must be greater than or equal to 277782',
          max: 'Easting value must be less than or equal to 712847',
        },
      };
      describe('feet', () => {
        const validSchema = {
          zone: 'central',
          unit: 'ft',
          northing: 6622440,
          elevation: 2000,
        };
        test.each([
          [null, errors.eastingFeet.generic],
          [undefined, errors.eastingFeet.generic],
          ['', errors.eastingFeet.generic],
          ['garbage', errors.eastingFeet.generic],
          ['abcdefg.abc', errors.eastingFeet.generic],
          [0, errors.eastingFeet.min],
          [100, errors.eastingFeet.min],
          [10.1, errors.eastingFeet.min],
          [-1234567.123, errors.eastingFeet.min],
          [911357.12345, errors.eastingFeet.generic],
          [12345678, errors.eastingFeet.max],
          [1234567.1234, errors.eastingFeet.generic],
        ])('shows proper error message for %j', (easting, expectedError) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              easting,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(expectedError);
        });
      });
      describe('meters', () => {
        const validSchema = {
          zone: 'central',
          unit: 'm',
          northing: 2018530,
          elevation: 2000,
        };
        test.each([
          [null, errors.eastingMeters.generic],
          [undefined, errors.eastingMeters.generic],
          ['', errors.eastingMeters.generic],
          ['garbage', errors.eastingMeters.generic],
          ['abcdefg.abc', errors.eastingMeters.generic],
          [0, errors.eastingMeters.min],
          [100, errors.eastingMeters.min],
          [10.1, errors.eastingMeters.min],
          [-123456.123, errors.eastingMeters.min],
          [12345, errors.eastingMeters.min],
          [1234567, errors.eastingMeters.max],
          [277790.1234, errors.eastingMeters.generic],
        ])('shows proper error message for %j', (easting, expectedError) => {
          let result;

          try {
            schemas.gridCoordinatesSchema.validateSync({
              ...validSchema,
              easting,
            });
          } catch (error) {
            result = error;
          }

          expect(result.errors[0]).toBe(expectedError);
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
    describe('new', () => {
      test.each([
        ['garbage'],
        ['/submitters/abc/existing/cdf/map.png'],
        ['/submitters/abc/new/cdf/maps.pdf'],
        ['/submitters/abc/new/cdf/maps.tiff'],
        ['/submitters/abc/new/cdf/maps.gif'],
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

        expect(result.errors[0]).toBe('Images must be jpeg or png.');
      });
      test.each([
        '/submitters/abc/new/cdf/map.png',
        '/submitters/abc/new/cdf/map.jpeg',
      ])('accepts a valid image', (map) => {
        const result = schemas.imagesSchema.validateSync({
          map,
        });

        expect(result).toEqual({
          map,
        });
      });
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
  describe('profile', () => {
    const options = {
      stripUnknown: true,
      abortEarly: false,
    };
    describe('displayName', () => {
      const validProfile = {
        email: 'test@email.com',
        license: '123456',
        seal: 'submitters/abc/profile/seal.png',
      };
      test.each([[null], [undefined], ['']])(
        '%j is not a valid display name',
        (displayName) => {
          let result;

          try {
            schemas.profileSchema.validateSync(
              {
                ...validProfile,
                displayName,
              },
              options
            );
          } catch (error) {
            result = error;
          }

          expect(result?.errors[0]).toBe('Name is a required field.');
        }
      );

      test.each([['name'], [1], [createText(250)]])(
        '%j is a valid display name',
        (displayName) => {
          let result;

          try {
            schemas.profileSchema.validateSync(
              {
                ...validProfile,
                displayName,
              },
              options
            );
          } catch (error) {
            result = error;
          }

          expect(result).toBe(undefined);
        }
      );
    });
    describe('email', () => {
      const validProfile = {
        displayName: 'first last',
        license: '123456',
        seal: 'submitters/abc/profile/seal.png',
      };
      test.each([[null], [undefined], [''], ['name'], [new Date()]])(
        '%j is not a valid email',
        (email) => {
          let result;

          try {
            schemas.profileSchema.validateSync(
              {
                ...validProfile,
                email,
              },
              options
            );
          } catch (error) {
            result = error;
          }

          expect(result?.errors[0]).toBe('Email is a required field.');
        }
      );

      test.each([['test@test.com']])('%j is a valid display name', (email) => {
        let result;

        try {
          schemas.profileSchema.validateSync(
            {
              ...validProfile,
              email,
            },
            options
          );
        } catch (error) {
          result = error;
        }

        expect(result).toBe(undefined);
      });
    });
    describe('license', () => {
      const validProfile = {
        displayName: 'first last',
        email: 'test@email.com',
        seal: 'submitters/abc/profile/seal.png',
      };
      test.each([[createText(251)]])('%j is not a valid license', (license) => {
        let result;

        try {
          schemas.profileSchema.validateSync(
            {
              ...validProfile,
              license,
            },
            options
          );
        } catch (error) {
          result = error;
        }

        expect(result?.errors[0]).toBe(
          'License must be at most 250 characters'
        );
      });

      test.each([[null], [undefined], [''], ['name'], [1], [createText(250)]])(
        '%j is a valid license',
        (license) => {
          let result;

          try {
            schemas.profileSchema.validateSync(
              {
                ...validProfile,
                license,
              },
              options
            );
          } catch (error) {
            result = error;
          }

          expect(result).toBe(undefined);
        }
      );
    });
    describe('seal', () => {
      const validProfile = {
        displayName: 'first last',
        email: 'test@email.com',
        license: '123456',
      };
      test.each([['garbage'], ['submitters/abc/seal.png'], [0], [10]])(
        '%j is not a valid seal',
        (seal) => {
          let result;

          try {
            schemas.profileSchema.validateSync(
              {
                ...validProfile,
                seal,
              },
              options
            );
          } catch (error) {
            result = error;
          }

          expect(result?.errors[0]).toBe('Images must be jpeg or png.');
        }
      );

      test.each([
        [null],
        [undefined],
        [''],
        ['submitters/abc/profile/seal.png'],
      ])('%j is a valid seal', (seal) => {
        let result;

        try {
          schemas.profileSchema.validateSync(
            {
              ...validProfile,
              seal,
            },
            options
          );
        } catch (error) {
          result = error;
        }

        expect(result).toBe(undefined);
      });
    });
  });
});
