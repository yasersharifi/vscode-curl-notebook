/**
 * A logical cell parsed from the on-disk notebook source.
 */
export interface CellBlock {
  readonly source: string;
  readonly kind: 'code' | 'markdown';
}
