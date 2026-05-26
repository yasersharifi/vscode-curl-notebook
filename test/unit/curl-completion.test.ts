import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractCompletionPrefix,
  matchesPrefix,
} from '../../src/completion/curl-completion-utils';

test('extractCompletionPrefix reads curl flags', () => {
  assert.equal(extractCompletionPrefix('curl -sS -H'), '-H');
});

test('extractCompletionPrefix reads partial curl word', () => {
  assert.equal(extractCompletionPrefix('cu'), 'cu');
});

test('extractCompletionPrefix reads variable brace', () => {
  assert.equal(extractCompletionPrefix("Bearer {{auth"), 'auth');
});

test('matchesPrefix filters labels', () => {
  assert.equal(matchesPrefix('-H', '-'), true);
  assert.equal(matchesPrefix('curl GET', 'cur'), true);
  assert.equal(matchesPrefix('-d', '-X'), false);
});
