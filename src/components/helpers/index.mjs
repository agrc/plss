import {
  accuracy,
  status,
  grid,
  units,
  adjustments,
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
  adjustment: (value) => reverseLookup(adjustments, value),
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
