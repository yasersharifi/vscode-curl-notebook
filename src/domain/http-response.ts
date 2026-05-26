/**
 * Normalized HTTP response from a curl execution.
 */
export interface HttpResponse {
  readonly statusCode: number;
  readonly statusLine: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
  readonly durationMs: number;
  readonly effectiveUrl: string;
  readonly stderr: string;
  readonly ok: boolean;
}

export function isHttpResponse(value: unknown): value is HttpResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const r = value as HttpResponse;
  return typeof r.statusCode === 'number' && typeof r.body === 'string';
}
