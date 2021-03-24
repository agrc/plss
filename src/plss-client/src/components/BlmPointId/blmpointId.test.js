import parseTownshipInformation from './index';

const id = 'UT260060S0020E0_240400';

test('when the principle meridian is 26 expect Salt Lake', () => {
  expect(parseTownshipInformation(id).meridian).toStrictEqual({
    name: 'Salt Lake',
    abbr: 'SL',
    number: 26,
  });
});

test('when the principle meridian is 30 expect Uintah', () => {
  expect(parseTownshipInformation('UT300060S0020E0_240400').meridian).toStrictEqual({
    name: 'Uintah Special',
    abbr: 'US',
    number: 30,
  });
});

test('when the township 4th character is a 0 expect a whole township', () => {
  expect(parseTownshipInformation(id).township).toBe('06S');
});

test('when the township 4th character is a 1 expect a quarter township', () => {
  expect(parseTownshipInformation('UT260061S0020E0_240400').township).toBe('06 1/4S');
});

test('when the township 4th character is a 2 expect a half township', () => {
  expect(parseTownshipInformation('UT260062S0020E0_240400').township).toBe('06 1/2S');
});

test('when the township 4th character is a 3 expect a three quarter township', () => {
  expect(parseTownshipInformation('UT260063S0020E0_240400').township).toBe('06 3/4S');
});

test('when the range 4th character is a 0 expect a whole range', () => {
  expect(parseTownshipInformation(id).range).toBe('02E');
});

test('when the range 4th character is a 1 expect a quarter range', () => {
  expect(parseTownshipInformation('UT260060S0021E0_240400').range).toBe('02 1/4E');
});

test('when the range 4th character is a 2 expect a half range', () => {
  expect(parseTownshipInformation('UT260060S0022E0_240400').range).toBe('02 1/2E');
});

test('when the range 4th character is a 3 expect a three quarter range', () => {
  expect(parseTownshipInformation('UT260060S0023E0_240400').range).toBe('02 3/4E');
});
