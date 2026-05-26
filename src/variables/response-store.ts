import type { HttpResponse } from '../domain/http-response';
import { resolveResponsePath } from './response-path-resolver';

/**
 * Repository of named HTTP responses (REST Client `# @name` requests).
 */
export class ResponseStore {
  private readonly named = new Map<string, HttpResponse>();

  set(name: string, response: HttpResponse): void {
    this.named.set(name, response);
  }

  get(name: string): HttpResponse | undefined {
    return this.named.get(name);
  }

  /** Resolves `requestName.response.body.field` paths. */
  resolve(expression: string): string | undefined {
    const dot = expression.indexOf('.');
    if (dot === -1) {
      return undefined;
    }
    const requestName = expression.slice(0, dot);
    const path = expression.slice(dot + 1);
    const response = this.named.get(requestName);
    if (!response) {
      return undefined;
    }
    return resolveResponsePath(response, path);
  }

  clear(): void {
    this.named.clear();
  }

  getAll(): ReadonlyMap<string, HttpResponse> {
    return this.named;
  }
}
