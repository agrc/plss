import * as yup from 'yup';

export const metadataSchema = yup.object().shape({
  status: yup
    .string()
    .required()
    .oneOf(['exiting', 'obliterated', 'lost', 'original'], 'A valid selection must be made'),
  accuracy: yup.string().required().oneOf(['survey', 'mapping', 'rec'], 'A valid selection must be made'),
  description: yup.string().max(500).required(),
  notes: yup.string().max(500).required(),
});

export const coordinatePickerSchema = yup.object().shape({
  datum: yup
    .string()
    .required()
    .oneOf(
      [
        'geographic-wgs84',
        'geographic-nad27',
        'geographic-nad83',
        'grid-nad83.state-plane',
        'grid-nad83.utm12n',
        'grid-nad83.utm11n',
      ],
      'A valid selection must be made'
    ),
});

const minutes = yup.number().required().integer().min(0).lessThan(60).label('Minutes');
const seconds = yup
  .number()
  .required()
  .min(0)
  .lessThan(60)
  .test('fiveDecimalPlaces', 'the field must have 5 digits after the decimal or less', (number) =>
    /^\d+(\.\d{0,5})?$/.test(number)
  )
  .label('Seconds');

const degrees = (min, max) => yup.number().integer().required().min(min).max(max).label('Degrees');

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

export const nad83GeographicHeightSchema = yup.object().shape({
  height: yup.number().required().min(2000).max(14000).label('Ellipsoid Height'),
  adjustment: yup.number().required().oneOf([1996, 2007, 2011]).label('NGS Adjustment'),
  unit: yup.string().required().oneOf(['m', 'ft', 'ft.survey']).label('Vertical Units'),
});
