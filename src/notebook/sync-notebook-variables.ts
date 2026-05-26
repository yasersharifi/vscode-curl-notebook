import * as vscode from 'vscode';
import { NOTEBOOK_TYPE } from '../constants';
import { getNotebookSession } from './notebook-session';
import { VariableSubstitutor } from '../variables/variable-substitutor';

/**
 * Loads @variables from all code cells top-to-bottom (without running curl).
 */
export function syncNotebookVariables(
  notebook: vscode.NotebookDocument
): void {
  if (notebook.notebookType !== NOTEBOOK_TYPE) {
    return;
  }

  const session = getNotebookSession(notebook);
  const substitutor = new VariableSubstitutor(
    session.variables,
    session.responses
  );

  for (const cell of notebook.getCells()) {
    if (cell.kind !== vscode.NotebookCellKind.Code) {
      continue;
    }
    const source = cell.document.getText();
    session.variables.ingestCellSource(source, (value) =>
      substitutor.substitute(value)
    );
  }
}

export function registerNotebookVariableSync(
  onVariablesChanged: () => void
): vscode.Disposable {
  const sync = (notebook?: vscode.NotebookDocument) => {
    if (!notebook || notebook.notebookType !== NOTEBOOK_TYPE) {
      return;
    }
    syncNotebookVariables(notebook);
    onVariablesChanged();
  };

  return vscode.Disposable.from(
    vscode.workspace.onDidOpenNotebookDocument((doc) => sync(doc)),
    vscode.window.onDidChangeActiveNotebookEditor((editor) => sync(editor?.notebook)),
    vscode.workspace.onDidChangeNotebookDocument((event) => {
      if (event.document.notebookType === NOTEBOOK_TYPE) {
        sync(event.document);
      }
    })
  );
}
