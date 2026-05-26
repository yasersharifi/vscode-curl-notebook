import type { CellBlock } from '../domain/cell-block';
import { extractExecutableCurl, parseVariableLines } from './variable-parser';

export type CellDelimiterMode = 'triple-hash' | 'double-newline' | 'auto';

/**
 * Strategy for splitting a notebook source file into cell blocks.
 */
export interface ICellSplitter {
  split(raw: string): CellBlock[];
}

const MARKDOWN_WRAPPER_START = '/*markdown';
const MARKDOWN_WRAPPER_END = '*/';

/**
 * Splits source text into cells using REST-style ### or SQL-notebook-style blank lines.
 */
export class CellSplitter implements ICellSplitter {
  constructor(private readonly mode: CellDelimiterMode = 'auto') {}

  split(raw: string): CellBlock[] {
    const mode = this.resolveMode(raw);
    const chunks =
      mode === 'triple-hash' ? splitByTripleHash(raw) : splitByDoubleNewline(raw);

    return chunks
      .map((chunk) => chunk.trimEnd())
      .filter((chunk) => chunk.trim().length > 0)
      .map((chunk) => toCellBlock(chunk));
  }

  private resolveMode(raw: string): 'triple-hash' | 'double-newline' {
    if (this.mode === 'triple-hash') {
      return 'triple-hash';
    }
    if (this.mode === 'double-newline') {
      return 'double-newline';
    }
    return /\n\s*###\s*(?:\n|$)/.test(raw) ? 'triple-hash' : 'double-newline';
  }
}

function toCellBlock(chunk: string): CellBlock {
  const trimmed = chunk.trim();
  if (
    trimmed.startsWith(MARKDOWN_WRAPPER_START) &&
    trimmed.endsWith(MARKDOWN_WRAPPER_END)
  ) {
    const lines = trimmed.split('\n');
    const inner =
      lines.length > 2 ? lines.slice(1, lines.length - 1).join('\n') : '';
    return { source: inner, kind: 'markdown' };
  }

  if (isMarkdownOnlyCell(trimmed)) {
    return { source: trimmed, kind: 'markdown' };
  }

  return { source: chunk, kind: 'code' };
}

function isMarkdownOnlyCell(text: string): boolean {
  // @name = value cells must stay code cells so they can be run / synced
  if (parseVariableLines(text).length > 0) {
    return false;
  }
  if (extractExecutableCurl(text) !== null) {
    return false;
  }

  const lines = text.split('\n').map((l) => l.trim());
  const nonEmpty = lines.filter((l) => l.length > 0);
  if (nonEmpty.length === 0) {
    return false;
  }
  return nonEmpty.every(
    (line) =>
      line.startsWith('//') ||
      line.startsWith('#') ||
      /^\/\*markdown/.test(line)
  );
}

/** Split on lines that contain only ### (REST Client convention). */
export function splitByTripleHash(raw: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of raw.split('\n')) {
    if (/^\s*###\s*$/.test(line)) {
      if (current.length > 0) {
        blocks.push(current.join('\n'));
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) {
    blocks.push(current.join('\n'));
  }

  return blocks;
}

/**
 * Split on two consecutive empty lines (SQL Notebook convention).
 * A single blank line inside a cell does not start a new cell.
 */
export function splitByDoubleNewline(raw: string): string[] {
  const delimiter = /\n(?:[ \t]*\n){2,}/;
  return raw.split(delimiter).filter((block) => block.trim().length > 0);
}
