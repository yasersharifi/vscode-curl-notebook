import * as vscode from 'vscode';
import { NOTEBOOK_TYPE } from './constants';
import { CurlNotebookController } from './notebook/curl-notebook-controller';
import { CurlNotebookSerializer } from './notebook/curl-notebook-serializer';
import { registerCommands } from './commands/register-commands';
import { registerCurlCompletions } from './completion/curl-completion-provider';
import { VariablesTreeProvider } from './views/variables-tree-provider';

export function activate(context: vscode.ExtensionContext): void {
  const serializer = new CurlNotebookSerializer();
  context.subscriptions.push(
    vscode.workspace.registerNotebookSerializer(NOTEBOOK_TYPE, serializer, {
      transientOutputs: true,
    })
  );

  const variablesTree = new VariablesTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'curlnotebook-variables',
      variablesTree
    )
  );

  const controller = new CurlNotebookController(() => variablesTree.refresh());
  context.subscriptions.push(controller);

  registerCommands(context, variablesTree);
  context.subscriptions.push(registerCurlCompletions());
}

export function deactivate(): void {
  // Controllers and serializers disposed via context.subscriptions
}
