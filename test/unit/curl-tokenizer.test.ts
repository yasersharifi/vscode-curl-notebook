import assert from 'node:assert/strict';
import test from 'node:test';
import { tokenizeCurlArgs } from '../../src/execution/curl-executor';

test('tokenizeCurlArgs respects quoted strings', () => {
  const tokens = tokenizeCurlArgs(`-X POST -H 'Content-Type: application/json' -d '{"a":1}'`);
  assert.deepEqual(tokens, [
    '-X',
    'POST',
    '-H',
    'Content-Type: application/json',
    '-d',
    '{"a":1}',
  ]);
});
