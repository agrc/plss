import {
  accuracy,
  status,
  grid,
  units,
  geographic,
  statePlaneZones,
} from '../pageElements/CornerSubmission/Options.mjs';

const formatDegrees = (dms) =>
  `${dms.degrees}° ${dms.minutes}' ${dms.seconds}"`;

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
    console.log('option is null', options, value);

    return '-';
  }

  return option.label;
};

export const keyMap = {
  status: (value) => reverseLookup(status, value),
  accuracy: (value) => reverseLookup(accuracy, value),
  description: (value) => value,
  notes: (value) => value,
  datum: (value) => formatDatum(value),
  northing: (value) => formatDegrees(value),
  easting: (value) => formatDegrees(value),
  unit: (value) => reverseLookup(units, value),
  height: (value) => value,
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

export const resolveProjectData = ({ type, coordinates }) => {
  if (type === 'grid') {
    const { zone, unit } = coordinates;

    return {
      geometryType: 'esriGeometryPoint',
      inSR: getGridInputSpatialReference(zone, unit),
      outSR: 4326,
      f: 'json',
      geometries: [
        {
          x: coordinates.northing,
          y: coordinates.easting,
        },
      ],
    };
  }

  if (type === 'geographic') {
    // get county to know what state plane zone to use
    const zone = 'north';
    const unit = 'm';
    // convert dms to decimal degrees
    return {
      geometryType: 'esriGeometryPoint',
      inSR: 4326,
      outSR: getGridInputSpatialReference(zone, unit),
      f: 'json',
      geometries: [
        {
          x: coordinates.northing,
          y: coordinates.easting,
        },
      ],
    };
  }
};
