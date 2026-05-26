import assert from 'node:assert/strict';
import test from 'node:test';
import type { HttpResponse } from '../../src/domain/http-response';
import { resolveResponsePath } from '../../src/variables/response-path-resolver';
import { ResponseStore } from '../../src/variables/response-store';

const sampleResponse: HttpResponse = {
  statusCode: 200,
  statusLine: 'HTTP/1.1 200 OK',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ accessToken: 'tok_abc', user: { id: 42 } }),
  durationMs: 120,
  effectiveUrl: 'https://api.example.com/login',
  stderr: '',
  ok: true,
};

test('resolveResponsePath reads JSON body fields', () => {
  assert.equal(
    resolveResponsePath(sampleResponse, 'response.body.accessToken'),
    'tok_abc'
  );
  assert.equal(
    resolveResponsePath(sampleResponse, 'response.body.user.id'),
    '42'
  );
});

test('resolveResponsePath reads status and headers', () => {
  assert.equal(resolveResponsePath(sampleResponse, 'response.statusCode'), '200');
  assert.equal(
    resolveResponsePath(sampleResponse, 'response.headers.content-type'),
    'application/json'
  );
});

test('ResponseStore resolves named request expressions', () => {
  const store = new ResponseStore();
  store.set('loginRequest', sampleResponse);
  assert.equal(
    store.resolve('loginRequest.response.body.accessToken'),
    'tok_abc'
  );
});

