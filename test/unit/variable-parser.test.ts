import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractExecutableCurl,
  parseRequestName,
  parseVariableLines,
  resolveDotenvReference,
} from '../../src/parsing/variable-parser';

test('parseVariableLines reads @ assignments', () => {
  const vars = parseVariableLines('@token = abc\n@host=http://x');
  assert.deepEqual(vars, [
    { name: 'token', rawValue: 'abc' },
    { name: 'host', rawValue: 'http://x' },
  ]);
});

test('resolveDotenvReference maps dotenv syntax', () => {
  const value = resolveDotenvReference('{{$dotenv API_KEY}}', {
    API_KEY: 'secret',
  });
  assert.equal(value, 'secret');
});

test('extractExecutableCurl ignores variables and comments', () => {
  const cell = `// login
@token = abc
curl -X POST https://example.com \\
  -H 'Authorization: Bearer {{token}}'`;
  const cmd = extractExecutableCurl(cell);
  assert.ok(cmd);
  assert.match(cmd!, /curl -X POST/);
});

test('isVariableOnlyCell detected via extractExecutableCurl absence', () => {
  const cell = '@baseUrl = https://api.example.com';
  assert.equal(extractExecutableCurl(cell), null);
});

test('parseRequestName reads REST Client label', () => {
  const cell = '# @name loginRequest\ncurl https://example.com';
  assert.equal(parseRequestName(cell), 'loginRequest');
});
