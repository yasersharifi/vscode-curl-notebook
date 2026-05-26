import * as vscode from 'vscode';
import {
  CONFIG_SECTION,
  CURL_LANGUAGE_ID,
  NOTEBOOK_TYPE,
  OUTPUT_MIME_MARKDOWN,
  OUTPUT_MIME_TEXT,
} from '../constants';
import { CurlExecutor } from '../execution/curl-executor';
import type { CurlExecutionOptions } from '../execution/curl-executor.interface';
import { ResponseFormatter } from '../output/response-formatter';
import {
  extractExecutableCurl,
  isVariableOnlyCell,
  parseRequestName,
} from '../parsing/variable-parser';
import { getNotebookSession } from './notebook-session';
import { VariableSubstitutor } from '../variables/variable-substitutor';

/**
 * Notebook controller — executes curl cells and writes markdown outputs.
 */
export class CurlNotebookController implements vscode.Disposable {
  readonly id = 'curl-notebook-executor';
  readonly label = 'Curl Notebook';

  private readonly _controller: vscode.NotebookController;
  private readonly _executor = new CurlExecutor();
  private _executionOrder = 0;

  constructor(
    private readonly _onVariablesChanged?: () => void
  ) {
    this._controller = vscode.notebooks.createNotebookController(
      this.id,
      NOTEBOOK_TYPE,
      this.label
    );
    this._controller.supportedLanguages = [CURL_LANGUAGE_ID];
    this._controller.supportsExecutionOrder = true;
    this._controller.executeHandler = this.executeCells.bind(this);
  }

  dispose(): void {
    this._controller.dispose();
  }

  private async executeCells(
    cells: vscode.NotebookCell[],
    notebook: vscode.NotebookDocument
  ): Promise<void> {
    for (const cell of cells) {
      await this.executeCell(cell, notebook);
    }
  }

  async executeCell(
    cell: vscode.NotebookCell,
    notebook: vscode.NotebookDocument
  ): Promise<void> {
    const execution = this._controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now());

    const session = getNotebookSession(notebook);
    const source = cell.document.getText();
    const formatter = new ResponseFormatter(this.getMaxBodyChars());
    const substitutor = new VariableSubstitutor(
      session.variables,
      session.responses
    );

    session.variables.ingestCellSource(source, (value) =>
      substitutor.substitute(value)
    );
    this._onVariablesChanged?.();

    if (isVariableOnlyCell(source)) {
      this.writeOutput(execution, formatter.formatInfo('Variables updated.'), true);
      return;
    }

    const curlCommand = extractExecutableCurl(source);
    if (!curlCommand) {
      this.writeOutput(
        execution,
        formatter.formatError('No curl command found in this cell.'),
        false
      );
      return;
    }

    const resolved = substitutor.substitute(curlCommand);
    if (substitutor.hasUnresolved(resolved)) {
      this.writeOutput(
        execution,
        formatter.formatError(
          'Unresolved variables remain. Define them with @name = value, run named requests (# @name), or use the Variables panel.'
        ),
        false
      );
      return;
    }

    try {
      const response = await this._executor.execute(
        resolved,
        this.getExecutionOptions()
      );

      const requestName = parseRequestName(source);
      if (requestName) {
        session.responses.set(requestName, response);
      }

      session.variables.ingestCellSource(source, (value) =>
        substitutor.substitute(value)
      );
      this._onVariablesChanged?.();
      this.writeOutput(execution, formatter.formatSuccess(response), response.ok);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.writeOutput(execution, formatter.formatError(message), false);
    }
  }

  private writeOutput(
    execution: vscode.NotebookCellExecution,
    markdown: string,
    success: boolean
  ): void {
    execution.replaceOutput([
      new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.text(markdown, OUTPUT_MIME_MARKDOWN),
      ]),
      new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.text(markdown, OUTPUT_MIME_TEXT),
      ]),
    ]);
    execution.end(success, Date.now());
  }

  private getExecutionOptions(): CurlExecutionOptions {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
      curlPath: config.get<string>('curlPath', 'curl'),
      timeoutMs: config.get<number>('defaultTimeoutMs', 60_000),
      followRedirects: config.get<boolean>('followRedirects', true),
      insecureTls: config.get<boolean>('insecureTls', false),
    };
  }

  private getMaxBodyChars(): number {
    return vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<number>('maxBodyChars', 50_000);
  }
}
