export const parseTownshipInformation = (pointId) => {
  // UT260060S0020E0_240400
  const meridian = parseInt(pointId.slice(2, 4));
  // remove leading 0
  const township = extractNumberAndDirection(pointId.slice(5, 9)).label;
  const range = extractNumberAndDirection(pointId.slice(10, 14)).label;
  const gcdb = pointId.slice(16);
  const section = extractSection(gcdb, sections);
  const quarter = extractQuarter(gcdb);
  const quarterQuarter = extractQuarterQuarter(gcdb);

  return {
    meridian: {
      number: meridian,
      name: meridian === 30 ? 'Uinta' : 'Salt Lake',
    },
    township,
    range,
    section,
    quarter,
    quarterQuarter,
    duplicate: pointId[14] !== '0',
  };
};

const extractNumberAndDirection = (part) => {
  const number = part.slice(0, 2);
  const fractionIdentifier = part[2];
  const direction = part[3];
  let fraction;

  // 1 for 1/4 township, 2 for 1/2 township, 3 for 3/4 township)
  switch (fractionIdentifier) {
    case '1': {
      fraction = ' 1/4';
      break;
    }
    case '2': {
      fraction = ' 1/2';
      break;
    }
    case '3': {
      fraction = ' 3/4';
      break;
    }

    default: {
      fraction = '';
    }
  }

  return {
    number,
    fraction,
    direction,
    label: `${number}${fraction}${direction}`,
  };
};

const extractSection = (gcdb, sections) => {
  const x = parseInt(gcdb[0]) - 1;
  const y = parseInt(gcdb[3]) - 1;

  return sections[y][x];
};

const sections = [
  [31, 32, 33, 34, 35, 36],
  [30, 29, 28, 27, 26, 25],
  [19, 20, 21, 22, 23, 24],
  [18, 17, 16, 15, 14, 13],
  [7, 8, 9, 10, 11, 12],
  [6, 5, 4, 3, 2, 1],
];

const extractQuarter = (gcdb) => {
  const norths = ['N', 'S'];
  const easts = ['E', 'W'];

  const getDirection = (value, axis) => {
    return value >= 40 ? axis[0] : axis[1];
  };

  const easting = parseInt(gcdb.slice(1, 3));
  const northing = parseInt(gcdb.slice(4));

  return `${getDirection(northing, norths)}${getDirection(easting, easts)}`;
};

const extractQuarterQuarter = (gcdb) => {
  const [quarterNorthing, quarterEasting] = extractQuarter(gcdb);

  const easting = parseInt(gcdb.slice(1, 3));
  const northing = parseInt(gcdb.slice(4));

  let northingLimit = quarterNorthing === 'N' ? 60 : 20;
  let eastingLimit = quarterEasting === 'E' ? 60 : 20;

  return `${northing >= northingLimit ? 'N' : 'S'}${easting >= eastingLimit ? 'E' : 'W'}`;
};
