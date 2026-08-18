import {
  accuracy,
  geographic,
  grid,
  statePlaneZones,
  status,
  units,
} from './cornerSubmission/Options.js';

type DegreesMinutesSeconds = {
  degrees: number | string;
  minutes: number | string;
  seconds: number | string;
};

type SelectOption = {
  readonly label: string;
  readonly value: string;
};

type StatePlaneZone = 'north' | 'central' | 'south';
type CoordinateUnit = 'ft' | 'm';

type GridCoordinates = {
  zone: StatePlaneZone;
  unit: CoordinateUnit;
  easting: number;
  northing: number;
};

type GeographicCoordinates = {
  zone: StatePlaneZone;
  x: number;
  y: number;
};

export type ProjectRequest =
  | { type: 'grid'; coordinates: GridCoordinates }
  | { type: 'geographic'; coordinates: GeographicCoordinates }
  | { type?: string; coordinates?: undefined };

export type ProjectFormData = {
  f: 'json';
  inSr: number;
  outSr: number;
  geometries: string;
};

type Review = {
  approved: boolean | null;
  comments?: string | null;
  reviewedAt?: unknown | null;
};

export type SubmissionReviewStatus = {
  published?: boolean;
  ugrc: Review;
  county: Review;
  sgid: Review;
};

type ProgressState = 'approved' | 'pending' | 'rejected' | 'waiting' | 'yes';

export type SubmissionStatus = {
  label: string;
  received: ProgressState;
  reviewed: ProgressState;
  sheetPublished: ProgressState;
  dataPublished: ProgressState;
};

export const formatDegrees = (dms: DegreesMinutesSeconds): string =>
  `${dms.degrees}°${dms.minutes}′${dms.seconds}″`;

export const formatDatum = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const [datum] = value.split('-');
  const options = datum === 'geographic' ? geographic : grid;

  return reverseLookup(options, value);
};

const reverseLookup = (
  options: readonly SelectOption[],
  value: string,
): string => {
  const option = options.find((item) => item.value === value);

  if (!option) {
    return '-';
  }

  return option.label;
};

export const keyMap = {
  accuracy: (value: string) => reverseLookup(accuracy, value),
  datum: (value: string) => formatDatum(value),
  description: (value: unknown) => value,
  easting: (value: DegreesMinutesSeconds) => formatDegrees(value),
  height: (value: unknown) => value,
  northing: (value: DegreesMinutesSeconds) => formatDegrees(value),
  notes: (value: unknown) => value,
  status: (value: string) => reverseLookup(status, value),
  unit: (value: string) => reverseLookup(units, value),
  zone: (value: string) => reverseLookup(statePlaneZones, value),
};

export const getDefault = (
  value: unknown,
  nullReplacement = '-',
  suffix = '',
): string => {
  const normalizedValue = value?.toString().toLowerCase().trim();

  if (!normalizedValue) {
    return nullReplacement;
  }

  const nulls = ['null', '<null>', ''];

  if (nulls.includes(normalizedValue)) {
    return nullReplacement;
  }

  return `${normalizedValue} ${suffix}`.trim();
};

export const parseBool = (value: unknown, defaultValue: boolean): boolean => {
  if (!['true', 'false', true, false].includes(value as string | boolean)) {
    return defaultValue;
  }

  return JSON.parse(String(value)) || defaultValue;
};

const spatialReferences: Record<
  StatePlaneZone,
  Record<CoordinateUnit, number>
> = {
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

const getGridInputSpatialReference = (
  zone: StatePlaneZone,
  unit: CoordinateUnit,
): number => spatialReferences[zone][unit];

export const countiesInZone: Record<StatePlaneZone, readonly string[]> = {
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

export const createProjectFormData = (
  request: ProjectRequest,
): ProjectFormData | null => {
  if (request.type === 'grid' && request.coordinates) {
    const { zone, unit, easting, northing } = request.coordinates;

    return {
      f: 'json',
      inSr: getGridInputSpatialReference(zone, unit),
      outSr: nad832011,
      geometries: JSON.stringify({
        geometryType: 'esriGeometryPoint',
        geometries: [
          {
            x: easting,
            y: northing,
          },
        ],
      }),
    };
  }

  if (request.type === 'geographic' && request.coordinates) {
    const { zone, x, y } = request.coordinates;

    return {
      f: 'json',
      inSr: nad832011,
      outSr: getGridInputSpatialReference(zone, 'm'),
      geometries: JSON.stringify({
        geometryType: 'esriGeometryPoint',
        geometries: [
          {
            x,
            y,
          },
        ],
      }),
    };
  }

  return null;
};

export const roundAccurately = (
  number: number,
  decimalPlaces: number,
): number =>
  Number(
    `${Math.round(Number(`${number}e${decimalPlaces}`))}e-${decimalPlaces}`,
  );

export const getStatus = (
  submissionStatus?: SubmissionReviewStatus | null,
): SubmissionStatus => {
  const defaultStatus: SubmissionStatus = {
    label: 'Unknown',
    received: 'pending',
    reviewed: 'pending',
    sheetPublished: 'pending',
    dataPublished: 'pending',
  };

  if (!submissionStatus) {
    return defaultStatus;
  }

  const { ugrc, county, sgid, published } = submissionStatus;

  if (sgid.approved === true) {
    return {
      label: 'Sheet and geometry corrections are live',
      received: 'yes',
      reviewed: 'approved',
      sheetPublished: published ? 'yes' : 'waiting',
      dataPublished: 'yes',
    };
  }

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

const pluralize = (count: number, singular: string, plural: string): string => {
  const grammaticalNumber = pluralRules.select(count);
  switch (grammaticalNumber) {
    case 'one':
      return `${count} ${singular}`;
    case 'other':
      return `${count} ${plural}`;
    default:
      throw new Error(`Unknown: ${grammaticalNumber}`);
  }
};

export const timeSince = (date: Date | number): string => {
  const timestamp = date instanceof Date ? date.getTime() : date;
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

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
