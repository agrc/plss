import { parseTownshipInformation } from './index';

const id = 'UT260060S0020E0_240400';

test('when the principle meridian is 26 expect Salt Lake', () => {
  expect(parseTownshipInformation(id).meridian).toStrictEqual({
    name: 'Salt Lake',
    number: 26,
  });
});

test('when the principle meridian is 30 expect Uinta', () => {
  expect(parseTownshipInformation('UT300060S0020E0_240400').meridian).toStrictEqual({
    name: 'Uinta',
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

test('when the last character is a or b the township is a duplicate', () => {
  expect(parseTownshipInformation(id).duplicate).toBe(false);

  expect(parseTownshipInformation('UT260060S0023EA_240400').duplicate).toBe(true);
  expect(parseTownshipInformation('UT260060S0023EB_240400').duplicate).toBe(true);
});

test('extract section from gcdb', () => {
  expect(parseTownshipInformation(id).section).toBe(17);
});

test('extract quarter from gcdb', () => {
  expect(parseTownshipInformation(id).quarter).toBe('SE');
});

test('extract quarter quarter from gcdb', () => {
  expect(parseTownshipInformation(id).quarterQuarter).toBe('SW');
});

test('UT260020S0040E0_600600', () => {
  const info = parseTownshipInformation('UT260020S0040E0_600600');
  expect(info.meridian.name).toBe('Salt Lake');
  expect(info.township).toBe('02S');
  expect(info.range).toBe('04E');
  expect(info.section).toBe(1);
  expect(info.quarter).toBe('SW');
  expect(info.quarterQuarter).toBe('SW');
});

// UT260020S0040E0_600600
// 2S4E
// section 1
// SW
//
