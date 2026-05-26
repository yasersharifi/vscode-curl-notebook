import * as vscode from 'vscode';
import { getNotebookSession } from '../notebook/notebook-session';

type VariableTreeItem = vscode.TreeItem & {
  variableName?: string;
};

/**
 * Tree view showing merged variables for the active curl notebook.
 */
export class VariablesTreeProvider
  implements vscode.TreeDataProvider<VariableTreeItem>
{
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  refresh(): void {
    this._onDidChange.fire();
  }

  getTreeItem(element: VariableTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: VariableTreeItem): VariableTreeItem[] {
    if (element) {
      return [];
    }

    const notebook = this.getActiveNotebook();
    if (!notebook) {
      return [
        {
          label: 'Open a .http or .curl notebook',
          collapsibleState: vscode.TreeItemCollapsibleState.None,
        },
      ];
    }

    const session = getNotebookSession(notebook);
    const vars = session.variables.getAll();
    const items: VariableTreeItem[] = [
      {
        label: 'Session',
        contextValue: 'session-root',
        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      },
    ];

    if (vars.size === 0) {
      items.push({
        label: 'No variables defined',
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      });
      return items;
    }

    for (const [name, value] of vars) {
      const masked =
        /token|password|secret|key/i.test(name) && value.length > 8
          ? `${value.slice(0, 4)}…${value.slice(-4)}`
          : value;
      items.push({
        label: name,
        description: masked,
        variableName: name,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        tooltip: `${name} = ${value}`,
      });
    }

    return items;
  }

  private getActiveNotebook(): vscode.NotebookDocument | undefined {
    const editor = vscode.window.activeNotebookEditor;
    return editor?.notebook;
  }
}
