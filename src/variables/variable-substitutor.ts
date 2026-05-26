import type { ResponseStore } from './response-store';
import type { VariableStore } from './variable-store';

const PLACEHOLDER = /\{\{([^}]+)\}\}/g;

const SIMPLE_NAME = /^[A-Za-z_][\w.-]*$/;

/**
 * Replaces `{{variable}}` and `{{request.response.body.field}}` placeholders.
 */
export class VariableSubstitutor {
  constructor(
    private readonly store: VariableStore,
    private readonly responses?: ResponseStore
  ) {}

  substitute(text: string): string {
    return text.replace(PLACEHOLDER, (_match, expression: string) => {
      const trimmed = expression.trim();

      if (SIMPLE_NAME.test(trimmed)) {
        const value = this.store.get(trimmed);
        return value === undefined ? `{{${trimmed}}}` : value;
      }

      if (this.responses && trimmed.includes('.')) {
        const resolved = this.responses.resolve(trimmed);
        if (resolved !== undefined) {
          return resolved;
        }
      }

      return `{{${trimmed}}}`;
    });
  }

  hasUnresolved(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(this.substitute(text));
  }
}
