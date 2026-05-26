import * as vscode from 'vscode';
import { CONFIG_SECTION } from '../constants';
import { loadDotenvFile, resolveDotenvPath } from '../variables/dotenv-loader';
import { ResponseStore } from '../variables/response-store';
import { VariableStore } from '../variables/variable-store';

/**
 * Per-notebook execution context (session variables + dotenv).
 * One instance per open notebook document.
 */
export class NotebookSession {
  readonly variables = new VariableStore();
  readonly responses = new ResponseStore();

  constructor(private readonly notebookUri?: vscode.Uri) {
    this.variables.loadFromConfiguration();
    this.loadDotenvIfEnabled();
  }

  private loadDotenvIfEnabled(): void {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    if (!config.get<boolean>('loadDotenv', true)) {
      return;
    }

    const folder = this.resolveWorkspaceFolder();
    if (!folder) {
      return;
    }

    const dotenvFile = config.get<string>('dotenvFile', '.env');
    const envPath = resolveDotenvPath(folder.uri.fsPath, dotenvFile);
    this.variables.setDotenv(loadDotenvFile(envPath));
  }

  private resolveWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    if (this.notebookUri) {
      const folder = vscode.workspace.getWorkspaceFolder(this.notebookUri);
      if (folder) {
        return folder;
      }
    }
    return vscode.workspace.workspaceFolders?.[0];
  }
}

const sessions = new WeakMap<vscode.NotebookDocument, NotebookSession>();

export function getNotebookSession(
  notebook: vscode.NotebookDocument
): NotebookSession {
  let session = sessions.get(notebook);
  if (!session) {
    session = new NotebookSession(notebook.uri);
    sessions.set(notebook, session);
  }
  return session;
}

export function clearNotebookSession(notebook: vscode.NotebookDocument): void {
  sessions.delete(notebook);
}
