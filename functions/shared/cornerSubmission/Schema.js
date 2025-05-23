import * as yup from 'yup';
import * as options from './Options.js';

export const scaleAndPrecision = (number, { precision }) => {
  if (!number) {
    return false;
  }

  let [, right] = number.toString().split('.');

  right = right ?? 0;

  if ((right?.length ?? 0) <= precision) {
    return !isNaN(parseFloat(right));
  }

  return false;
};

const metadataMessages = {
  section: 'Section must be a whole number from 1 to 36.',
  corner: 'Corner is a required field.',
  status: 'Status is a required field.',
  collected: 'Collection date is a required field.',
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

export const addPointSchema = yup.object().shape({
  name: yup.string().required('Name is a required field.'),
  notes: yup.string().max(500, 'Notes must be at most 500 characters.'),
  color: yup.string().matches(/^#[0-9a-f]{6}$/i, 'Color is a required field.'),
  location: yup.object().typeError('A point is required.').shape({
    x: yup.number().required(),
    y: yup.number().required(),
  }),
});

export const cornerData = yup.object().shape({
  blmPointId: yup.string().required(),
  county: yup
    .string()
    .required()
    .lowercase()
    .oneOf([
      'beaver',
      'box elder',
      'cache',
      'carbon',
      'daggett',
      'davis',
      'duchesne',
      'emery',
      'garfield',
      'grand',
      'iron',
      'juab',
      'kane',
      'millard',
      'morgan',
      'piute',
      'rich',
      'salt lake',
      'san juan',
      'sanpete',
      'sevier',
      'summit',
      'tooele',
      'uintah',
      'utah',
      'wasatch',
      'washington',
      'wayne',
      'weber',
    ]),
  type: yup.string().required().oneOf(['new', 'existing']),
});

export const metadataSchema = yup.object().shape({
  status: yup
    .string()
    .typeError(metadataMessages.status)
    .required(metadataMessages.status)
    .oneOf(
      options.status.map((x) => x.value),
      metadataMessages.status,
    ),
  collected: yup
    .date()
    .typeError(metadataMessages.collected)
    .required(metadataMessages.collected)
    .min(new Date(1980, 0, 1), 'Collection date is too old.')
    .max(new Date(), "Collection date must be on or before today's date."),
  accuracy: yup
    .string()
    .typeError(metadataMessages.accuracy)
    .required(metadataMessages.accuracy)
    .oneOf(
      options.accuracy.map((x) => x.value),
      metadataMessages.accuracy,
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
        options.grid.map((x) => x.value),
      ),
      datumMessage,
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
    /^\d+(\.\d{0,5})?$/.test(number),
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
      then: () =>
        yup
          .number()
          .min(2000, heightMessages.feet)
          .max(14000, heightMessages.feet)
          .required(heightMessages.feet)
          .typeError(heightMessages.feet),
    })
    .when('unit', {
      is: 'm',
      then: () =>
        yup
          .number()
          .min(600, heightMessages.meters)
          .max(4300, heightMessages.meters)
          .required(heightMessages.meters)
          .typeError(heightMessages.meters),
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
      gridMessages.zone,
    )
    .label('The zone'),
  unit: yup
    .string()
    .typeError(gridMessages.unit)
    .required(gridMessages.unit)
    .oneOf(
      options.units.map((x) => x.value),
      gridMessages.unit,
    )
    .label('The unit'),
  northing: yup
    .number()
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'ft' && zone === 'north',
      then: () =>
        yup
          .number()
          .min(3358936)
          .max(3895966)
          .typeError(gridMessages.northingFeet)
          .required(gridMessages.northingFeet)
          .test('feet', gridMessages.northingFeet, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .label('Northing value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'ft' && zone === 'central',
      then: () =>
        yup
          .number()
          .min(6622436)
          .max(7563519)
          .test('feet', gridMessages.northingFeet, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .required(gridMessages.northingFeet)
          .typeError(gridMessages.northingFeet)
          .label('Northing value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'ft' && zone === 'south',
      then: () =>
        yup
          .number()
          .min(9964678)
          .max(10546599)
          .test('feet', gridMessages.northingFeet, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.northingFeet)
          .required(gridMessages.northingFeet)
          .label('Northing value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'm' && zone === 'north',
      then: () =>
        yup
          .number()
          .min(1023805)
          .max(1187493)
          .test('meters', gridMessages.northingMeters, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.northingMeters)
          .required(gridMessages.northingMeters)
          .label('Northing value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'm' && zone === 'central',
      then: () =>
        yup
          .number()
          .min(2018522)
          .max(2305365)
          .test('meters', gridMessages.northingMeters, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.northingMeters)
          .required(gridMessages.northingMeters)
          .label('Northing value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'm' && zone === 'south',
      then: () =>
        yup
          .number()
          .min(3037239)
          .max(3214610)
          .test('meters', gridMessages.northingMeters, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.northingMeters)
          .required(gridMessages.northingMeters)
          .label('Northing value'),
    })
    .when('unit', {
      is: '',
      then: () =>
        yup
          .number()
          .typeError('Northing is a required field.')
          .required('Northing is a required field.'),
    }),
  easting: yup
    .number()
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'ft' && zone === 'north',
      then: () =>
        yup
          .number()
          .min(938853)
          .max(2320842)
          .test('feet', gridMessages.eastingFeet, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.eastingFeet)
          .required(gridMessages.eastingFeet)
          .label('Easting value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'ft' && zone === 'central',
      then: () =>
        yup
          .number()
          .min(911357)
          .max(2338732)
          .test('feet', gridMessages.eastingFeet, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.eastingFeet)
          .required(gridMessages.eastingFeet)
          .label('Easting value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'ft' && zone === 'south',
      then: () =>
        yup
          .number()
          .min(895779)
          .max(2357266)
          .test('feet', gridMessages.eastingFeet, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.eastingFeet)
          .required(gridMessages.eastingFeet)
          .label('Easting value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'm' && zone === 'north',
      then: () =>
        yup
          .number()
          .min(286163)
          .max(707394)
          .test('meters', gridMessages.eastingMeters, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.eastingMeters)
          .required(gridMessages.eastingMeters)
          .label('Easting value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'm' && zone === 'central',
      then: () =>
        yup
          .number()
          .min(277782)
          .max(712847)
          .test('meters', gridMessages.eastingMeters, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.eastingMeters)
          .required(gridMessages.eastingMeters)
          .label('Easting value'),
    })
    .when(['unit', 'zone'], {
      is: (unit, zone) => unit === 'm' && zone === 'south',
      then: () =>
        yup
          .number()
          .min(273034)
          .max(718496)
          .test('meters', gridMessages.eastingMeters, (number) =>
            scaleAndPrecision(number, { precision: 3 }),
          )
          .typeError(gridMessages.eastingMeters)
          .required(gridMessages.eastingMeters)
          .label('Easting value'),
    })
    .when('unit', {
      is: '',
      then: () =>
        yup
          .number()
          .typeError('Easting is a required field.')
          .required('Easting is a required field.'),
    }),
  elevation: yup
    .mixed()
    .notRequired()
    .when('unit', {
      is: 'ft',
      then: () =>
        yup
          .number()
          .min(2000, gridMessages.elevationFeet)
          .max(14000, gridMessages.elevationFeet)
          .nullable()
          .transform((value, originalValue) =>
            typeof originalValue === 'string' && originalValue.trim() === ''
              ? null
              : value,
          )
          .typeError(gridMessages.elevationFeet)
          .notRequired(),
    })
    .when('unit', {
      is: 'm',
      then: () =>
        yup
          .number()
          .min(600, gridMessages.elevationMeters)
          .max(4300, gridMessages.elevationMeters)
          .nullable()
          .typeError(gridMessages.elevationMeters)
          .transform((value, originalValue) =>
            typeof originalValue === 'string' && originalValue.trim() === ''
              ? null
              : value,
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
    .matches(/submitters\/.+\/existing\/.+\/existing-sheet\.pdf$/i, {
      message: pdfMessage,
    })
    .required(pdfMessage),
  mrrc: yup.boolean().required(),
});

export const imagesSchema = yup.object().shape({
  map: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/map\.(png|jpe?g)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  monument: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/monument\.(png|jpe?g)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  closeUp: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/closeUp\.(png|jpe?g)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra1: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra1\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra2: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra2\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra3: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra3\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra4: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra4\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra5: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra5\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra6: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra6\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra7: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra7\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra8: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra8\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra9: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra9\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
  extra10: yup
    .string()
    .typeError(imageMessage)
    .matches(/submitters\/.+\/new\/.+\/extra10\.(png|jpe?g|pdf)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    }),
});

export const profileSchema = yup.object().shape({
  displayName: yup
    .string()
    .required('Name is a required field.')
    .typeError('Name is a required field.')
    .max(250)
    .label('Name'),
  email: yup
    .string()
    .required('Email is a required field.')
    .email('Email is a required field.')
    .typeError('Email is a required field.')
    .max(250)
    .label('Email'),
  license: yup
    .string()
    .notRequired()
    .max(250)
    .nullable()
    .optional()
    .label('License'),
  seal: yup
    .string()
    .notRequired()
    .matches(/submitters\/.+\/profile\/seal\.(png|jpe?g)$/i, {
      excludeEmptyString: true,
      message: imageMessage,
    })
    .nullable()
    .optional(),
});
