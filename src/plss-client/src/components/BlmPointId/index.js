const extractTownshipInformation = (pointId) => {
  const meridian = parseInt(pointId.slice(2, 4));
  const township = extractNumberAndDirection(pointId.slice(5, 9)).label;
  const range = extractNumberAndDirection(pointId.slice(10, 14)).label;

  return {
    meridian: {
      number: meridian,
      name: meridian === 30 ? 'Uintah Special' : 'Salt Lake',
      abbr: meridian === 30 ? 'US' : 'SL',
    },
    township,
    range,
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

export default extractTownshipInformation;
