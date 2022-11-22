import * as yup from 'yup';
import * as options from './Options.mjs';

export const scaleAndPrecision = (number, { scale, precision }) => {
  if (!number) {
    return false;
  }

  let [left, right] = number.toString().split('.');

  left = left ?? 0;
  right = right ?? 0;

  if ((left?.length ?? 0) === scale && (right?.length ?? 0) <= precision) {
    return !isNaN(parseFloat(left)) && !isNaN(parseFloat(right));
  }

  return false;
};

const metadataMessages = {
  section: 'Section must be a whole number from 1 to 36.',
  corner: 'Corner is a required field.',
  status: 'Status is a required field.',
  accuracy: 'Accuracy is a required field.',
  description: 'Description is a required field.',
  notes: 'Notes is a required field.',
};
const datumMessage = 'Coordinate System is a required field.';
const dmsMessages = {
  minutes: 'Minutes must be a whole number from 0 to 59.',
  seconds: 'Seconds must be a number from 0 to 59.99999.',
};
const heightMessages = {
  feet: 'Ellipsoid Height (feet) must be a number from 2000 to 14000.',
  meters: 'Ellipsoid Height (meters) must be a number from 600 to 4300.',
};
const gridMessages = {
  zone: 'State Plane Zone is a required field.',
  unit: 'Horizontal units is a required field.',
  northingMeters:
    'Northing value must contain seven values to the left of the decimal, and up to three to the right.',
  eastingMeters:
    'Easting value must contain six values to the left of the decimal, and up to three to the right.',
  northingFeet:
    'Northing value must contain eight values to the left of the decimal, and up to three to the right.',
  eastingFeet:
    'Easting value must contain seven values to the left of the decimal, and up to three to the right.',
  elevationFeet: 'Elevation (feet) must be a number from 2000 to 14000.',
  elevationMeters: 'Elevation (meters) must be a number from 600 to 4300.',
  datum: 'Vertical datum is a required field.',
};
const imageMessage = 'Images must be jpeg or png.';
const pdfMessage = 'An existing tiesheet PDF is required.';

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
  .typeError(dmsMessages.minutes)
  .required(dmsMessages.minutes)
  .integer(dmsMessages.minutes)
  .min(0, dmsMessages.minutes)
  .lessThan(60, dmsMessages.minutes)
  .label('Minutes');
const seconds = yup
  .number()
  .typeError(dmsMessages.seconds)
  .required(dmsMessages.seconds)
  .min(0, dmsMessages.seconds)
  .lessThan(60, dmsMessages.seconds)
  .test('fiveDecimalPlaces', dmsMessages.seconds, (number) =>
    /^\d+(\.\d{0,5})?$/.test(number)
  )
  .label('Seconds');

const degrees = (min, max) =>
  yup
    .number()
    .typeError(`Degrees must be a whole number from ${min} to ${max}.`)
    .integer(`Degrees must be a whole number from ${min} to ${max}.`)
    .required(`Degrees must be a whole number from ${min} to ${max}.`)
    .min(min, `Degrees must be a whole number from ${min} to ${max}.`)
    .max(max, `Degrees must be a whole number from ${min} to ${max}.`)
    .label('Degrees');

export const longitudeSchema = yup.object().shape({
  easting: yup
    .object()
    .shape({
      degrees: degrees(109, 114),
      minutes,
      seconds,
    })
    .label(''),
});

export const latitudeSchema = yup.object().shape({
  northing: yup
    .object()
    .shape({
      degrees: degrees(36, 42),
      minutes,
      seconds,
    })
    .label(''),
});

export const geographicHeightSchema = yup.object().shape({
  elevation: yup
    .number()
    .when('unit', {
      is: 'ft',
      then: yup
        .number()
        .typeError(heightMessages.feet)
        .required(heightMessages.feet)
        .min(2000, heightMessages.feet)
        .max(14000, heightMessages.feet),
    })
    .when('unit', {
      is: 'm',
      then: yup
        .number()
        .typeError(heightMessages.meters)
        .required(heightMessages.meters)
        .min(600, heightMessages.meters)
        .max(4300, heightMessages.meters),
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
    .typeError(gridMessages.zone)
    .required(gridMessages.zone)
    .oneOf(
      options.statePlaneZones.map((x) => x.value),
      gridMessages.zone
    )
    .label('The zone'),
  unit: yup
    .string()
    .typeError(gridMessages.unit)
    .required(gridMessages.unit)
    .oneOf(
      options.units.map((x) => x.value),
      gridMessages.unit
    )
    .label('The unit'),
  northing: yup
    .number()
    .when('unit', {
      is: 'ft',
      then: yup
        .number()
        .typeError(gridMessages.northingFeet)
        .required(gridMessages.northingFeet)
        .test('feet', gridMessages.northingFeet, (number) =>
          scaleAndPrecision(number, { scale: 8, precision: 3 })
        ),
    })
    .when('unit', {
      is: 'm',
      then: yup
        .number()
        .typeError(gridMessages.northingMeters)
        .required(gridMessages.northingMeters)
        .test('meters', gridMessages.northingMeters, (number) =>
          scaleAndPrecision(number, { scale: 7, precision: 3 })
        ),
    })
    .when('unit', {
      is: '',
      then: yup
        .number()
        .typeError('Northing is a required field.')
        .required('Northing is a required field.'),
    }),
  easting: yup
    .number()
    .when('unit', {
      is: 'ft',
      then: yup
        .number()
        .typeError(gridMessages.eastingFeet)
        .required(gridMessages.eastingFeet)
        .test('feet', gridMessages.eastingFeet, (number) =>
          scaleAndPrecision(number, { scale: 7, precision: 3 })
        ),
    })
    .when('unit', {
      is: 'm',
      then: yup
        .number()
        .typeError(gridMessages.eastingMeters)
        .required(gridMessages.eastingMeters)
        .test('meters', gridMessages.eastingMeters, (number) =>
          scaleAndPrecision(number, { scale: 6, precision: 3 })
        ),
    })
    .when('unit', {
      is: '',
      then: yup
        .number()
        .typeError('Easting is a required field.')
        .required('Easting is a required field.'),
    }),
  elevation: yup
    .mixed()
    .notRequired()
    .when('unit', {
      is: 'ft',
      then: yup
        .number()
        .typeError(gridMessages.elevationFeet)
        .min(2000, gridMessages.elevationFeet)
        .max(14000, gridMessages.elevationFeet)
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
        .typeError(gridMessages.elevationMeters)
        .min(600, gridMessages.elevationMeters)
        .max(4300, gridMessages.elevationMeters)
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
    .oneOf([...options.verticalDatums, ''], gridMessages.datum)
    .label('The datum'),
});

export const existingSheetSchema = yup.object().shape({
  pdf: yup
    .string()
    .typeError(pdfMessage)
    .matches(/submitters\/.+\/existing\/.+\/existing-sheet\.pdf$/, {
      message: pdfMessage,
    })
    .required(pdfMessage),
});

export const imagesSchema = yup.object().shape({
  map: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/map\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  monument: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/monument\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'close-up': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/close-up\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-1': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-1\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-2': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-2\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-3': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-3\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-4': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-4\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-5': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-5\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-6': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-6\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-7': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-7\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-8': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-8\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-9': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-9\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  'extra-10': yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra-10\.(png|jpe?g)$/, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
});
