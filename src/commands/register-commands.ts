import * as vscode from 'vscode';
import { NOTEBOOK_TYPE } from '../constants';
import type { VariablesTreeProvider } from '../views/variables-tree-provider';
import { getNotebookSession } from '../notebook/notebook-session';

export function registerCommands(
  context: vscode.ExtensionContext,
  variablesTree: VariablesTreeProvider
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'curlnotebook.openAsNotebook',
      async (uri?: vscode.Uri) => {
        const target =
          uri ??
          vscode.window.activeTextEditor?.document.uri ??
          (
            await vscode.window.showOpenDialog({
              filters: { HTTP: ['http', 'curl'] },
              canSelectMany: false,
            })
          )?.[0];

        if (!target) {
          return;
        }

        await vscode.commands.executeCommand(
          'vscode.openWith',
          target,
          NOTEBOOK_TYPE
        );
      }
    ),

    vscode.commands.registerCommand('curlnotebook.refreshVariables', () => {
      variablesTree.refresh();
    }),

    vscode.commands.registerCommand('curlnotebook.clearVariables', async () => {
      const notebook = vscode.window.activeNotebookEditor?.notebook;
      if (!notebook) {
        void vscode.window.showWarningMessage('No active Curl Notebook.');
        return;
      }
      const session = getNotebookSession(notebook);
      session.variables.clearSession();
      session.responses.clear();
      variablesTree.refresh();
    }),

    vscode.commands.registerCommand('curlnotebook.addVariable', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Variable name (used as {{name}})',
        validateInput: (v) =>
          /^[A-Za-z_][\w.-]*$/.test(v) ? null : 'Invalid variable name',
      });
      if (!name) {
        return;
      }

      const value = await vscode.window.showInputBox({ prompt: 'Value' });
      if (value === undefined) {
        return;
      }

      const config = vscode.workspace.getConfiguration('curlNotebook');
      const vars = { ...(config.get<Record<string, string>>('variables') ?? {}) };
      vars[name] = value;
      await config.update(
        'variables',
        vars,
        vscode.ConfigurationTarget.Workspace
      );
      variablesTree.refresh();
      void vscode.window.showInformationMessage(`Variable {{${name}}} saved.`);
    })
  );
}
