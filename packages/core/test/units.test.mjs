// Runs against the build: npm run build first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatLength, fromMm, parseLength, toMm } from '../dist/index.js';

test('fromMm and toMm convert between millimetres and each unit', () => {
  assert.equal(fromMm(2700, 'mm'), 2700);
  assert.equal(fromMm(2700, 'cm'), 270);
  assert.equal(fromMm(2700, 'm'), 2.7);
  assert.equal(toMm(270, 'cm'), 2700);
  assert.equal(toMm(2.7, 'm'), 2700);
  assert.equal(toMm(1.2345, 'm'), 1235, 'rounds to whole millimetres');
  assert.equal(toMm(-0.0001, 'm'), 0, 'never -0');
});

test('formatLength shows the unit to the nearest millimetre, without trailing zeros', () => {
  assert.equal(formatLength(2700, 'mm'), '2700 mm');
  assert.equal(formatLength(2700, 'cm'), '270 cm');
  assert.equal(formatLength(2705, 'cm'), '270.5 cm');
  assert.equal(formatLength(2700, 'm'), '2.7 m');
  assert.equal(formatLength(4000, 'm'), '4 m');
  assert.equal(formatLength(1234, 'm'), '1.234 m');
  assert.equal(formatLength(-150, 'm'), '-0.15 m');
  assert.equal(formatLength(0.4, 'mm'), '0 mm');
  assert.equal(formatLength(-0.4, 'mm'), '0 mm', 'never -0');
  assert.equal(formatLength(2700, 'm', { suffix: false }), '2.7');
});

test('parseLength reads mm, cm or m and a bare number in the current unit', () => {
  for (const text of ['2700', '2700mm', '2700 mm', '270cm', '270 CM', '2.7m', ' 2.7 M ', '+2.7 m']) {
    assert.equal(parseLength(text, 'mm'), 2700, text);
  }
  assert.equal(parseLength('2.7', 'm'), 2700);
  assert.equal(parseLength('270', 'cm'), 2700);
  assert.equal(parseLength('.5', 'm'), 500);
  assert.equal(parseLength('3.', 'm'), 3000);
  assert.equal(parseLength('-1.5 m', 'mm'), -1500);
});

test('parseLength rejects anything that is not one length', () => {
  for (const text of ['', ' ', 'm', '2.7 km', '2,7 m', '1.2.3', '2 m 30 cm', 'abc', '--1', '1e3']) {
    assert.equal(parseLength(text, 'mm'), null, JSON.stringify(text));
  }
});
