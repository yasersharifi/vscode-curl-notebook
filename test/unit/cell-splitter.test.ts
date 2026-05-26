import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CellSplitter,
  splitByTripleHash,
  splitByDoubleNewline,
} from '../../src/parsing/cell-splitter';

test('splitByTripleHash splits REST Client cells', () => {
  const raw = `@base = http://localhost

###

curl http://localhost/health

###

curl http://localhost/api`;
  const blocks = splitByTripleHash(raw);
  assert.equal(blocks.length, 3);
  assert.match(blocks[1], /curl/);
});

test('splitByDoubleNewline preserves intentional blank lines in SQL style', () => {
  const raw = 'line1\n\nline2';
  const blocks = splitByDoubleNewline(raw);
  assert.equal(blocks.length, 1);
  assert.ok(blocks[0].includes('line1'));
});

test('splitByDoubleNewline splits on two consecutive empty lines', () => {
  const raw = 'cell-a\n\n\ncell-b';
  const blocks = splitByDoubleNewline(raw);
  assert.equal(blocks.length, 2);
  assert.match(blocks[0], /cell-a/);
  assert.match(blocks[1], /cell-b/);
});

test('CellSplitter auto mode prefers ### when present', () => {
  const splitter = new CellSplitter('auto');
  const cells = splitter.split('a\n\n###\n\nb');
  assert.equal(cells.length, 2);
});

test('markdown wrapper cells deserialize as markdown', () => {
  const splitter = new CellSplitter('triple-hash');
  const cells = splitter.split('/*markdown\n# Title\n*/');
  assert.equal(cells[0].kind, 'markdown');
  assert.equal(cells[0].source, '# Title');
});

test('@variable cells deserialize as code not markdown', () => {
  const splitter = new CellSplitter('triple-hash');
  const cells = splitter.split('@baseUrl = https://api.example.com\n@token = abc');
  assert.equal(cells.length, 1);
  assert.equal(cells[0].kind, 'code');
});
