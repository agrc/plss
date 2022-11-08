import * as yup from 'yup';
import * as options from './Options.mjs';

const metadataMessages = {
  section: 'Section must be a whole number from 1 to 36.',
  corner: 'Corner is a required field.',
  status: 'Status is a required field.',
  accuracy: 'Accuracy is a required field.',
  description: 'Description is a required field.',
  notes: 'Notes is a required field.',
};
const datumMessage = 'Datum is a required field.';
export const metadataSchema = yup.object().shape({
  status: yup
    .string()
    .typeError(metadataMessages.status)
    .required(metadataMessages.status)
    .oneOf(
      options.status.map((x) => x.value),
      metadataMessages.status
    ),
  accuracy: yup
    .string()
    .typeError(metadataMessages.accuracy)
    .required(metadataMessages.accuracy)
    .oneOf(
      options.accuracy.map((x) => x.value),
      metadataMessages.accuracy
    ),
  description: yup
    .string()
    .typeError(metadataMessages.description)
    .max(1000, 'Description must be at most 1000 characters.')
    .required(metadataMessages.description)
    .label('Description'),
  notes: yup
    .string()
    .typeError(metadataMessages.notes)
    .max(1000, 'Notes must be at most 1000 characters.')
    .required(metadataMessages.notes),
  mrrc: yup.boolean().required(),
  section: yup
    .number()
    .typeError(metadataMessages.section)
    .min(1, metadataMessages.section)
    .max(36, metadataMessages.section)
    .required(metadataMessages.section),
  corner: yup
    .string()
    .typeError(metadataMessages.corner)
    .required(metadataMessages.corner)
    .oneOf(options.corner, metadataMessages.corner),
});

export const coordinatePickerSchema = yup.object().shape({
  datum: yup
    .string()
    .typeError(datumMessage)
    .required(datumMessage)
    .oneOf(
      [].concat(
        options.geographic.map((x) => x.value),
        options.grid.map((x) => x.value)
      ),
      datumMessage
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
  easting: yup
    .object()
    .shape({
      degrees: degrees(109, 114),
      minutes: minutes,
      seconds: seconds,
    })
    .label(''),
});

export const latitudeSchema = yup.object().shape({
  northing: yup
    .object()
    .shape({
      degrees: degrees(37, 42),
      minutes: minutes,
      seconds: seconds,
    })
    .label(''),
});

export const geographicHeightSchema = yup.object().shape({
  datum: yup.string().optional(),
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
    .required()
    .label('Ellipsoid Height'),
  unit: yup
    .string()
    .required()
    .oneOf(options.units.map((x) => x.value))
    .label('This'),
});

export const gridCoordinatesSchema = yup.object().shape({
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
    .optional()
    .oneOf([...options.verticalDatums, ''])
    .label('The datum'),
});

export const existingSheetSchema = yup.object().shape({
  pdf: yup.string().required().label('The sheet'),
});
