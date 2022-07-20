import {
  accuracy,
  status,
  grid,
  adjustment,
  geographic,
} from '../pageElements/CornerSubmission/Options';
const formatDegrees = (dms) =>
  `${dms.degrees}° ${dms.minutes}' ${dms.seconds}"`;

export const formatDatum = (value) => {
  const [datum] = value.split('-');
  let options = grid;
  if (datum === 'geographic') {
    options = geographic;
  }

  return reverseLookup(options, value);
};
const reverseLookup = (options, value) =>
  options.find((item) => item.value === value).label;

export const keyMap = {
  status: (value) => reverseLookup(status, value),
  accuracy: (value) => reverseLookup(accuracy, value),
  description: (value) => value,
  notes: (value) => value,
  datum: (value) => formatDatum(value),
  northing: (value) => formatDegrees(value),
  easting: (value) => formatDegrees(value),
  unit: (value) => value,
  adjustment: (value) => reverseLookup(adjustment, value),
  height: (value) => value,
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

  return `${value} ${suffix}`;
};
