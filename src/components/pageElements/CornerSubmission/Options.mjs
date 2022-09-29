export const status = [
  { label: 'Existing', value: 'existing' },
  { label: 'Obliterated', value: 'obliterated' },
  { label: 'Lost', value: 'lost' },
  {
    label: 'Original (Previously unmonumented Section Subdivision)',
    value: 'original',
  },
];
export const accuracy = [
  { label: 'Survey Grade (+/-) 0.03m', value: 'survey' },
  { label: 'Mapping Grade (+/-) 3m', value: 'mapping' },
  { label: 'Recreational Grade (+/-) 30m', value: 'rec' },
];
export const geographic = [
  { label: 'NAD83 Geographic', value: 'geographic-nad83' },
  {
    label: 'NATRF2022 (coming in 2025)',
    value: 'geographic-natrf',
    disabled: true,
  },
];
export const grid = [
  { label: 'NAD83 State Plane', value: 'grid-nad83' },
  { label: 'NATRF2022 (coming in 2025)', value: 'grid-natrf', disabled: true },
];
export const adjustments = [
  { label: 'NGS 1996', value: '1996' },
  { label: 'NGS 2007', value: '2007' },
  { label: 'NGS 2011', value: '2011' },
];
export const units = [
  { label: 'Meters', value: 'm' },
  { label: 'International Feet', value: 'ft' },
];
export const verticalDatums = ['NAVD88', 'NGVD29'];
export const statePlaneZones = [
  { label: 'North', value: 'north' },
  { label: 'Central', value: 'central' },
  { label: 'South', value: 'south' },
];
export const corner = [
  'NW',
  'N 1/4',
  'NE',
  'E 1/4',
  'SE',
  'S 1/4',
  'SW',
  'W 1/4',
  'Center',
  '1/16',
  'Other',
];
