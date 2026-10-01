const { test } = require('node:test');
const assert = require('node:assert/strict');
const { vnd, parseEntityId } = require('../dist/index.js');
test('money preserves exact large integer values and rejects unsafe inputs', () => {
  assert.equal(vnd('900719925474099312345').amount, '900719925474099312345');
  for (const value of [null, '', 1000, '-1', '1.5', '01', '1e3']) assert.throws(() => vnd(value));
});
test('public identifiers reject private or empty values', () => {
  assert.equal(parseEntityId('550E8400-E29B-41D4-A716-446655440000'), '550e8400-e29b-41d4-a716-446655440000');
  for (const value of [null, '', 'buyer@example.com', '0360000000', '../admin']) assert.throws(() => parseEntityId(value));
});
