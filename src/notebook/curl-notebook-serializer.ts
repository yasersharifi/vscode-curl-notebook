import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';
import { CONFIG_SECTION, CURL_LANGUAGE_ID, MARKDOWN_LANGUAGE_ID } from '../constants';
import type { CellBlock } from '../domain/cell-block';
import { CellDelimiterMode, CellSplitter } from '../parsing/cell-splitter';

const CELL_JOIN_DELIMITER = '\n\n###\n\n';

/**
 * Reads and writes plain .http / .curl text as VS Code notebook cells.
 */
export class CurlNotebookSerializer implements vscode.NotebookSerializer {
  async deserializeNotebook(
    content: Uint8Array,
    _token: vscode.CancellationToken
  ): Promise<vscode.NotebookData> {
    const raw = new TextDecoder().decode(content);
    const splitter = new CellSplitter(this.getDelimiterMode());
    const blocks = splitter.split(raw);
    const cells = blocks.map((block) => this.toNotebookCell(block));
    return new vscode.NotebookData(cells);
  }

  async serializeNotebook(
    data: vscode.NotebookData,
    _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    const parts = data.cells.map((cell) => {
      if (cell.kind === vscode.NotebookCellKind.Markup) {
        return `/*markdown\n${cell.value}\n*/`;
      }
      return cell.value;
    });
    return new TextEncoder().encode(parts.join(CELL_JOIN_DELIMITER));
  }

  private toNotebookCell(block: CellBlock): vscode.NotebookCellData {
    if (block.kind === 'markdown') {
      return new vscode.NotebookCellData(
        vscode.NotebookCellKind.Markup,
        block.source,
        MARKDOWN_LANGUAGE_ID
      );
    }
    return new vscode.NotebookCellData(
      vscode.NotebookCellKind.Code,
      block.source,
      CURL_LANGUAGE_ID
    );
  }

  private getDelimiterMode(): CellDelimiterMode {
    const value = vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<string>('cellDelimiter', 'auto');
    if (value === 'triple-hash' || value === 'double-newline') {
      return value;
    }
    return 'auto';
  }
}
