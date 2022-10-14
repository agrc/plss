import * as yup from 'yup';
import * as options from './Options.mjs';

export const metadataSchema = yup.object().shape({
  metadata: yup.object().shape({
    status: yup
      .string()
      .required()
      .oneOf(
        options.status.map((x) => x.value),
        'A valid selection must be made'
      ),
    accuracy: yup
      .string()
      .required()
      .oneOf(
        options.accuracy.map((x) => x.value),
        'A valid selection must be made'
      ),
    description: yup.string().max(1000).required(),
    notes: yup.string().max(1000).required(),
    mrrc: yup.boolean().required(),
    section: yup.number().min(1).max(36).required(),
    corner: yup
      .string()
      .required()
      .oneOf(options.corner, 'A valid selection must be made'),
  }),
});

export const coordinatePickerSchema = yup.object().shape({
  datum: yup
    .string()
    .required()
    .oneOf(
      [].concat(
        options.geographic.map((x) => x.value),
        options.grid.map((x) => x.value)
      ),
      'A valid selection must be made'
    ),
});

const minutes = yup
  .number()
  .required()
  .integer()
  .min(0)
  .lessThan(60)
  .label('Minutes');
const seconds = yup
  .number()
  .required()
  .min(0)
  .lessThan(60)
  .test(
    'fiveDecimalPlaces',
    'the field must have 5 digits after the decimal or less',
    (number) => /^\d+(\.\d{0,5})?$/.test(number)
  )
  .label('Seconds');

const degrees = (min, max) =>
  yup.number().integer().required().min(min).max(max).label('Degrees');

export const longitudeSchema = yup.object().shape({
  geographic: yup.object().shape({
    easting: yup
      .object()
      .shape({
        degrees: degrees(109, 114),
        minutes: minutes,
        seconds: seconds,
      })
      .label(''),
  }),
});

export const latitudeSchema = yup.object().shape({
  geographic: yup.object().shape({
    northing: yup
      .object()
      .shape({
        degrees: degrees(37, 42),
        minutes: minutes,
        seconds: seconds,
      })
      .label(''),
  }),
});

export const geographicHeightSchema = yup.object().shape({
  datum: yup.string().optional(),
  geographic: yup.object().shape({
    elevation: yup
      .number()
      .when('unit', {
        is: 'ft',
        then: yup.number().required().min(2000).max(14000),
      })
      .when('unit', {
        is: 'm',
        then: yup.number().required().min(600).max(4300),
      })
      .when('unit', {
        is: 'ft.survey',
        then: yup.number().required().min(2000).max(14000),
      })
      .required()
      .label('Ellipsoid Height'),
    unit: yup
      .string()
      .required()
      .oneOf(options.units.map((x) => x.value))
      .label('This'),
  }),
});

export const gridCoordinatesSchema = yup.object().shape({
  grid: yup.object().shape({
    zone: yup
      .string()
      .required()
      .oneOf(options.statePlaneZones.map((x) => x.value))
      .label('The zone'),
    unit: yup
      .string()
      .required()
      .oneOf(options.units.map((x) => x.value))
      .label('The unit'),
    northing: yup.number().min(0).required().label('northing'),
    easting: yup.number().min(0).required().label('easting'),
    elevation: yup
      .mixed()
      .notRequired()
      .when('unit', {
        is: 'ft',
        then: yup
          .number()
          .typeError('Only number are acceptable')
          .min(2000, 'Please enter a valid value for Utah (2,000-14,000 ft)')
          .max(14000, 'Please enter a valid value for Utah (2,000-14,000 ft)')
          .nullable()
          .transform((value, originalValue) =>
            typeof originalValue === 'string' && originalValue.trim() === ''
              ? null
              : value
          )
          .notRequired(),
      })
      .when('unit', {
        is: 'ft.survey',
        then: yup
          .number()
          .typeError('Only number are acceptable')

          .min(2000, 'Please enter a valid value for Utah (2,000-14,000 ft)')
          .max(14000, 'Please enter a valid value for Utah (2,000-14,000 ft)')
          .nullable()
          .transform((value, originalValue) =>
            typeof originalValue === 'string' && originalValue.trim() === ''
              ? null
              : value
          )
          .notRequired(),
      })
      .when('unit', {
        is: 'm',
        then: yup
          .number()
          .min(600, 'Please enter a valid value for Utah (600-4,300 m)')
          .max(4300, 'Please enter a valid value for Utah (600-4,300 m)')
          .nullable()
          .transform((value, originalValue) =>
            typeof originalValue === 'string' && originalValue.trim() === ''
              ? null
              : value
          )
          .notRequired(),
      })
      .label('elevation'),
    verticalDatum: yup
      .string()
      .oneOf(options.verticalDatums)
      .label('The datum'),
  }),
});
