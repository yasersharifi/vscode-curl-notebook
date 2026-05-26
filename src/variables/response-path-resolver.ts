import type { HttpResponse } from '../domain/http-response';

/**
 * Walks REST Client-style paths on a captured response.
 *
 * Examples: `response.body.accessToken`, `response.headers.authorization`, `response.statusCode`
 */
export function resolveResponsePath(
  response: HttpResponse,
  path: string
): string | undefined {
  if (!path.startsWith('response.')) {
    return undefined;
  }

  const segments = path.slice('response.'.length).split('.').filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  const [root, ...rest] = segments;

  switch (root) {
    case 'statusCode':
      return String(response.statusCode);
    case 'statusLine':
      return response.statusLine || undefined;
    case 'headers': {
      const key = rest.join('.').toLowerCase();
      if (!key) {
        return undefined;
      }
      return response.headers[key];
    }
    case 'body':
      return resolveBodyPath(response.body, rest);
    default:
      return undefined;
  }
}

function resolveBodyPath(body: string, segments: string[]): string | undefined {
  if (segments.length === 0) {
    return body;
  }

  let current: unknown;
  try {
    current = JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }

  for (const key of segments) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (current === undefined || current === null) {
    return undefined;
  }

  if (typeof current === 'object') {
    return JSON.stringify(current);
  }

  return String(current);
}
