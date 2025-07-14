import {
  accuracy,
  status,
  grid,
  units,
  geographic,
  statePlaneZones,
} from './cornerSubmission/Options.js';

export const formatDegrees = (dms) =>
  `${dms.degrees}°${dms.minutes}′${dms.seconds}″`;

export const formatDatum = (value) => {
  if ((value?.length ?? 0) < 1) {
    return '';
  }

  const [datum] = value.split('-');
  let options = grid;

  if (datum === 'geographic') {
    options = geographic;
  }

  return reverseLookup(options, value);
};

const reverseLookup = (options, value) => {
  const option = options.find((item) => item.value === value);

  if (!option) {
    return '-';
  }

  return option.label;
};

export const keyMap = {
  accuracy: (value) => reverseLookup(accuracy, value),
  datum: (value) => formatDatum(value),
  description: (value) => value,
  easting: (value) => formatDegrees(value),
  height: (value) => value,
  northing: (value) => formatDegrees(value),
  notes: (value) => value,
  status: (value) => reverseLookup(status, value),
  unit: (value) => reverseLookup(units, value),
  zone: (value) => reverseLookup(statePlaneZones, value),
};

export const getDefault = (value, nullReplacement = '-', suffix = '') => {
  value = value?.toString().toLowerCase().trim();

  if (!value) {
    return nullReplacement;
  }

  const nulls = ['null', '<null>', ''];

  if (nulls.includes(value)) {
    return nullReplacement;
  }

  return `${value} ${suffix}`.trim();
};

export const parseBool = (value, defaultValue) =>
  (['true', 'false', true, false].includes(value) && JSON.parse(value)) ||
  defaultValue;

const getGridInputSpatialReference = (zone, unit) => {
  const statePlaneZones = {
    north: {
      ft: 103166,
      m: 6620,
    },
    central: {
      ft: 103167,
      m: 6619,
    },
    south: {
      ft: 103168,
      m: 6621,
    },
  };

  if (!(zone in statePlaneZones)) {
    throw new Error(`Zone ${zone} not one of north, central, or south.`);
  }

  return statePlaneZones[zone][unit];
};

export const countiesInZone = {
  north: [
    'box elder',
    'cache',
    'daggett',
    'davis',
    'morgan',
    'rich',
    'summit',
    'weber',
  ],
  central: [
    'carbon',
    'duchesne',
    'emery',
    'grand',
    'juab',
    'millard',
    'salt lake',
    'sanpete',
    'sevier',
    'tooele',
    'uintah',
    'utah',
    'wasatch',
  ],
  south: [
    'beaver',
    'garfield',
    'iron',
    'kane',
    'piute',
    'san juan',
    'washington',
    'wayne',
  ],
};

const nad832011 = 6318;
export const createProjectFormData = ({ type, coordinates }) => {
  const formData = {
    f: 'json',
  };

  if (type === 'grid') {
    let { zone, unit } = coordinates;

    formData.inSr = getGridInputSpatialReference(zone, unit);
    formData.outSr = nad832011;
    formData.geometries = JSON.stringify({
      geometryType: 'esriGeometryPoint',
      geometries: [
        {
          x: coordinates.easting,
          y: coordinates.northing,
        },
      ],
    });

    return formData;
  }

  if (type === 'geographic') {
    const { zone, x, y } = coordinates;

    formData.inSr = nad832011;
    formData.outSr = getGridInputSpatialReference(zone, 'm');
    formData.geometries = JSON.stringify({
      geometryType: 'esriGeometryPoint',
      geometries: [
        {
          x,
          y,
        },
      ],
    });

    return formData;
  }

  return null;
};

export const roundAccurately = (number, decimalPlaces) =>
  Number(Math.round(number + 'e' + decimalPlaces) + 'e-' + decimalPlaces);

export const getStatus = (status) => {
  // Default status for unknown/null cases
  const defaultStatus = {
    label: 'Unknown',
    received: 'pending',
    reviewed: 'pending',
    sheetPublished: 'pending',
    dataPublished: 'pending',
  };

  if (!status) {
    return defaultStatus;
  }

  const { ugrc, county, sgid, published } = status;

  // Final state: Sheet and geometry corrections are live
  if (sgid.approved === true) {
    return {
      label: 'Sheet and geometry corrections are live',
      received: 'yes',
      reviewed: 'approved',
      sheetPublished: published ? 'yes' : 'waiting',
      dataPublished: 'yes',
    };
  }

  // County approved cases
  if (county.approved === true && sgid.approved === null) {
    return {
      label: published
        ? 'Pending PLSS geometry corrections'
        : 'Pending monument record sheet publishing',
      received: 'yes',
      reviewed: 'approved',
      sheetPublished: published ? 'yes' : 'waiting',
      dataPublished: published ? 'waiting' : 'pending',
    };
  }

  // Rejection cases
  if (
    county.approved === false &&
    county.reviewedAt !== null &&
    !sgid.reviewedAt
  ) {
    return {
      label: `The county rejected the submission. ${county.comments}`,
      received: 'yes',
      reviewed: 'rejected',
      sheetPublished: 'rejected',
      dataPublished: 'rejected',
    };
  }

  if (ugrc.approved === false && county.reviewedAt === null) {
    return {
      label: `UGRC rejected submission. ${ugrc.comments}`,
      received: 'yes',
      reviewed: 'rejected',
      sheetPublished: 'rejected',
      dataPublished: 'rejected',
    };
  }

  // Waiting states
  if (ugrc.approved === true && county.reviewedAt === null) {
    return {
      label: 'Pending county review',
      received: 'yes',
      reviewed: 'waiting',
      sheetPublished: 'pending',
      dataPublished: 'pending',
    };
  }

  if (ugrc.reviewedAt === null) {
    return {
      label: 'Pending UGRC review',
      received: 'yes',
      reviewed: 'waiting',
      sheetPublished: 'pending',
      dataPublished: 'pending',
    };
  }

  return defaultStatus;
};

const pluralRules = new Intl.PluralRules('en-US');

function pluralize(count, singular, plural) {
  const grammaticalNumber = pluralRules.select(count);
  switch (grammaticalNumber) {
    case 'one':
      return count + ' ' + singular;
    case 'other':
      return count + ' ' + plural;
    default:
      throw new Error('Unknown: ' + grammaticalNumber);
  }
}

export const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return `${pluralize(Math.floor(interval), 'yr', 'yrs')} ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)} mo ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${pluralize(Math.floor(interval), 'day', 'days')} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${pluralize(Math.floor(interval), 'hr', 'hrs')} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${pluralize(Math.floor(interval), 'min', 'mins')} ago`;
  }

  return `${Math.floor(seconds)} s ago`;
};
