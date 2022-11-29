import {
  accuracy,
  status,
  grid,
  units,
  geographic,
  statePlaneZones,
} from '../pageElements/CornerSubmission/Options.mjs';

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
  if (!status) {
    return {
      label: 'Unknown',
      received: 'pending',
      reviewed: 'pending',
      published: 'pending',
    };
  }

  if (status.sgid.approved) {
    return {
      label: 'Data is live',
      received: 'yes',
      reviewed: 'approved',
      published: 'yes',
    };
  }

  if (status.county.approved && !status.sgid.approved) {
    return {
      label: 'Pending PLSS data updates',
      received: 'yes',
      reviewed: 'approved',
      published: 'waiting',
    };
  }

  if (status.county.rejected && !status.sgid.approved) {
    return {
      label: `The county rejected the submission. ${status.county.comments}`,
      received: 'yes',
      reviewed: 'rejected',
      published: 'pending',
    };
  }

  if (
    !(status.county.approved || status.county.rejected) &&
    status.ugrc.rejected
  ) {
    return {
      label: `UGRC rejected submission. ${status.ugrc.comments}`,
      received: 'yes',
      reviewed: 'rejected',
      published: 'pending',
    };
  }

  if (
    !(status.county.approved || status.county.rejected) &&
    status.ugrc.approved
  ) {
    return {
      label: 'Pending county review',
      received: 'yes',
      reviewed: 'waiting',
      published: 'pending',
    };
  }

  if (!(status.ugrc.approved || status.ugrc.rejected)) {
    return {
      label: 'Pending UGRC review',
      received: 'yes',
      reviewed: 'waiting',
      published: 'pending',
    };
  }
};
