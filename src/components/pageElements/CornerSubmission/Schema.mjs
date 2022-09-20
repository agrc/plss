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
    mrrc: yup.bool().required(),
    section: yup.number().min(1).max(81).required(),
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

export const nad83GeographicHeightSchema = yup.object().shape({
  datum: yup.string().optional(),
  geographic: yup.object().shape({
    height: yup
      .number()
      .required()
      .min(2000)
      .max(14000)
      .label('Ellipsoid Height'),
    adjustment: yup
      .number()
      .when('datum', {
        is: 'geographic-nad83',
        then: yup.number().required().oneOf([1996, 2007, 2011]),
      })
      .label('NGS Adjustment'),
    unit: yup
      .string()
      .required()
      .oneOf(options.height.map((x) => x.value))
      .label('Vertical Units'),
  }),
});

// utm xmin 231722.43 xmax 677972.9
// utm ymin 4084701.37 ymax 4660865.32
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
      .oneOf(options.height.map((x) => x.value))
      .label('The unit'),
    adjustment: yup // not required for nad27
      .string()
      .required()
      .oneOf(options.adjustment.map((x) => x.value))
      .label('The adjustment'),
    northing: yup.number().required().label('northing'),
    easting: yup.number().required().label('easting'),
    elevation: yup.number().required().label('elevation'),
  }),
});
