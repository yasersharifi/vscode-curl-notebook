import * as vscode from 'vscode';
import { CONFIG_SECTION, CURL_LANGUAGE_ID, NOTEBOOK_TYPE } from '../constants';
import { getNotebookSession } from '../notebook/notebook-session';
import { parseVariableLines } from '../parsing/variable-parser';
import {
  COMMON_HEADERS,
  CURL_FLAGS,
  CURL_SNIPPETS,
  type CurlCompletionEntry,
  HTTP_METHODS,
} from './curl-catalog';
import { extractCompletionPrefix, matchesPrefix } from './curl-completion-utils';

const NOTEBOOK_SELECTOR: vscode.DocumentFilter = {
  language: CURL_LANGUAGE_ID,
  notebookType: NOTEBOOK_TYPE,
};

/** Characters that explicitly re-trigger the provider. */
const TRIGGER_CHARACTERS = [
  '-',
  '@',
  '{',
  'c',
  'C',
  ' ',
  "'",
  '"',
];

export function registerCurlCompletions(): vscode.Disposable {
  const provider = new CurlCompletionProvider();
  return vscode.languages.registerCompletionItemProvider(
    NOTEBOOK_SELECTOR,
    provider,
    ...TRIGGER_CHARACTERS
  );
}

export class CurlCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    if (!isSuggestionsEnabled()) {
      return [];
    }

    const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
    const prefix = extractCompletionPrefix(linePrefix);
    const entries = this.collectEntries(document, linePrefix);

    return entries
      .filter((entry) => matchesPrefix(entry.label, prefix))
      .map((entry) => toCompletionItem(entry, position, prefix));
  }

  private collectEntries(
    document: vscode.TextDocument,
    linePrefix: string
  ): CurlCompletionEntry[] {
    const variableRef = linePrefix.match(/\{\{([A-Za-z0-9_.$-]*)$/);
    if (variableRef) {
      return this.variableRefEntries(document, variableRef[1]);
    }

    if (/@([A-Za-z_]*)$/.test(linePrefix)) {
      return [
        {
          label: '@name = value',
          detail: 'Variable assignment',
          kind: vscode.CompletionItemKind.Snippet,
          insertText: new vscode.SnippetString('@${1:name} = ${2:value}'),
        },
      ];
    }

    if (/-X\s+['"]?[\w-]*$/i.test(linePrefix)) {
      return [...HTTP_METHODS];
    }

    if (/-H\s+['"]?[\w-]*$/i.test(linePrefix)) {
      return COMMON_HEADERS.map((h) => ({
        ...h,
        insertText: `-H '${h.insertText}' `,
      }));
    }

    const items: CurlCompletionEntry[] = [
      ...CURL_SNIPPETS,
      ...CURL_FLAGS,
      ...this.sessionVariableEntries(document),
    ];

    if (!/\bcurl\b/i.test(document.getText())) {
      items.unshift({
        label: 'curl',
        detail: 'curl command',
        insertText: 'curl ',
        kind: vscode.CompletionItemKind.Function,
      });
    }

    return items;
  }

  private sessionVariableEntries(
    document: vscode.TextDocument
  ): CurlCompletionEntry[] {
    const names = new Set<string>();

    for (const { name } of parseVariableLines(document.getText())) {
      names.add(name);
    }

    const notebook = vscode.workspace.getNotebookDocument(document);
    if (notebook) {
      const session = getNotebookSession(notebook);
      for (const name of session.variables.getAll().keys()) {
        names.add(name);
      }
      for (const name of session.responses.getAll().keys()) {
        names.add(name);
      }
    }

    return [...names].map((name) => ({
      label: `{{${name}}}`,
      detail: 'Variable',
      insertText: `{{${name}}}`,
      kind: vscode.CompletionItemKind.Variable,
    }));
  }

  private variableRefEntries(
    document: vscode.TextDocument,
    partial: string
  ): CurlCompletionEntry[] {
    const notebook = vscode.workspace.getNotebookDocument(document);
    const names = new Set<string>();

    for (const { name } of parseVariableLines(document.getText())) {
      names.add(name);
    }

    if (notebook) {
      const session = getNotebookSession(notebook);
      for (const name of session.variables.getAll().keys()) {
        names.add(name);
      }
      for (const name of session.responses.getAll().keys()) {
        names.add(`${name}.response.body`);
      }
    }

    const dotenvEntry: CurlCompletionEntry = {
      label: '$dotenv VAR',
      detail: 'From .env file',
      insertText: new vscode.SnippetString('$dotenv ${1:VAR}'),
      kind: vscode.CompletionItemKind.Variable,
    };

    const variableItems = [...names]
      .filter((name) => matchesPrefix(name, partial.replace(/\.$/, '')))
      .map((name) => ({
        label: name,
        detail: 'Variable',
        insertText: name,
        kind: vscode.CompletionItemKind.Variable,
      }));

    return [dotenvEntry, ...variableItems];
  }
}

function toCompletionItem(
  entry: CurlCompletionEntry,
  position: vscode.Position,
  prefix: string
): vscode.CompletionItem {
  const item = new vscode.CompletionItem(
    entry.label,
    entry.kind ?? vscode.CompletionItemKind.Keyword
  );
  item.detail = entry.detail;
  item.documentation = entry.documentation;
  item.insertText = entry.insertText;
  item.sortText = `0_${entry.label}`;

  if (prefix.length > 0) {
    item.range = new vscode.Range(
      position.line,
      position.character - prefix.length,
      position.line,
      position.character
    );
  }

  return item;
}

function isSuggestionsEnabled(): boolean {
  return vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .get<boolean>('enableSuggestions', true);
}
