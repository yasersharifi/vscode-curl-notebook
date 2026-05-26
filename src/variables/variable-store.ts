import * as vscode from 'vscode';
import { CONFIG_SECTION } from '../constants';
import {
  parseVariableLines,
  resolveDotenvReference,
} from '../parsing/variable-parser';

/**
 * Layered variable map: workspace (persistent) + session (per notebook run).
 */
export class VariableStore {
  private readonly workspace = new Map<string, string>();
  private readonly session = new Map<string, string>();
  private dotenv: Readonly<Record<string, string>> = {};

  setDotenv(env: Readonly<Record<string, string>>): void {
    this.dotenv = env;
  }

  setWorkspace(name: string, value: string): void {
    this.workspace.set(name, value);
  }

  deleteWorkspace(name: string): void {
    this.workspace.delete(name);
  }

  clearSession(): void {
    this.session.clear();
  }

  clearAll(): void {
    this.workspace.clear();
    this.session.clear();
  }

  ingestCellSource(
    source: string,
    resolvePlaceholders?: (value: string) => string
  ): void {
    for (const { name, rawValue } of parseVariableLines(source)) {
      let value = resolveDotenvReference(rawValue, this.dotenv);
      if (resolvePlaceholders) {
        value = resolvePlaceholders(value);
      }
      this.session.set(name, value);
    }
  }

  loadFromConfiguration(): void {
    const vars =
      vscode.workspace.getConfiguration(CONFIG_SECTION).get<Record<string, string>>('variables') ??
      {};
    for (const [name, value] of Object.entries(vars)) {
      this.workspace.set(name, value);
    }
  }

  async persistWorkspaceToConfiguration(): Promise<void> {
    const record: Record<string, string> = {};
    for (const [k, v] of this.workspace) {
      record[k] = v;
    }
    await vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .update('variables', record, vscode.ConfigurationTarget.Workspace);
  }

  get(name: string): string | undefined {
    return (
      this.session.get(name) ??
      this.workspace.get(name) ??
      this.dotenv[name]
    );
  }

  getAll(): ReadonlyMap<string, string> {
    const merged = new Map<string, string>();
    for (const [k, v] of Object.entries(this.dotenv)) {
      merged.set(k, v);
    }
    for (const [k, v] of this.workspace) {
      merged.set(k, v);
    }
    for (const [k, v] of this.session) {
      merged.set(k, v);
    }
    return merged;
  }
}
