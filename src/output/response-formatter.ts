import type { HttpResponse } from '../domain/http-response';

/**
 * Formats HTTP responses as markdown for notebook output cells.
 */
export class ResponseFormatter {
  constructor(private readonly maxBodyChars: number) {}

  formatSuccess(response: HttpResponse): string {
    const sections = [
      `### ${response.statusLine || `HTTP ${response.statusCode}`}`,
      '',
      `| | |`,
      `|---|---|`,
      `| **Status** | ${response.statusCode} |`,
      `| **Time** | ${response.durationMs} ms |`,
      `| **URL** | ${response.effectiveUrl || '—'} |`,
      '',
      '#### Headers',
      '',
      formatHeaders(response.headers),
      '',
      '#### Body',
      '',
      formatBody(response.body, this.maxBodyChars),
    ];

    if (response.stderr) {
      sections.push('', '#### stderr', '', '```', response.stderr, '```');
    }

    return sections.join('\n');
  }

  formatError(message: string): string {
    return `### Error\n\n\`\`\`\n${message}\n\`\`\``;
  }

  formatInfo(message: string): string {
    return `### ${message}`;
  }
}

function formatHeaders(headers: Readonly<Record<string, string>>): string {
  const keys = Object.keys(headers);
  if (keys.length === 0) {
    return '_No headers_';
  }
  return keys.map((k) => `- **${k}**: ${headers[k]}`).join('\n');
}

function formatBody(body: string, maxChars: number): string {
  if (!body) {
    return '_Empty body_';
  }

  const trimmed =
    body.length > maxChars
      ? `${body.slice(0, maxChars)}\n\n… _truncated (${body.length} chars total)_`
      : body;

  const lang = guessLanguage(trimmed);
  return `\`\`\`${lang}\n${trimmed}\n\`\`\``;
}

function guessLanguage(body: string): string {
  const t = body.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    return 'json';
  }
  if (t.startsWith('<')) {
    return 'html';
  }
  return '';
}
