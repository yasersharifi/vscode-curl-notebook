import { spawn } from 'child_process';
import * as path from 'path';
import { CURL_META_SENTINEL } from '../constants';
import type { HttpResponse } from '../domain/http-response';
import type {
  CurlExecutionOptions,
  ICurlExecutor,
} from './curl-executor.interface';

/**
 * Runs curl via subprocess and normalizes stdout into {@link HttpResponse}.
 */
export class CurlExecutor implements ICurlExecutor {
  async execute(
    command: string,
    options: CurlExecutionOptions
  ): Promise<HttpResponse> {
    const args = this.buildArgs(command, options);
    const started = Date.now();

    return new Promise((resolve, reject) => {
      const child = spawn(options.curlPath, args, {
        shell: false,
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`curl timed out after ${options.timeoutMs}ms`));
      }, options.timeoutMs);

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString('utf8');
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString('utf8');
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        reject(new Error(`Failed to run curl: ${err.message}`));
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        try {
          resolve(this.parseOutput(stdout, stderr, Date.now() - started, code ?? 1));
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  }

  /**
   * Converts a multiline curl script into argv for spawn.
   * Strips the leading `curl` token and line continuations.
   */
  private buildArgs(command: string, options: CurlExecutionOptions): string[] {
    const normalized = command
      .replace(/\\\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const withoutCurl = normalized.replace(/^curl\s+/i, '');
    const tokens = tokenizeCurlArgs(withoutCurl);

    const args = [
      '-sS',
      '-D',
      '-',
      '-w',
      `\n${CURL_META_SENTINEL}%{http_code}|%{time_total}|%{url_effective}\n`,
    ];

    if (options.followRedirects) {
      args.push('-L');
    }
    if (options.insecureTls) {
      args.push('-k');
    }

    return args.concat(tokens);
  }

  private parseOutput(
    stdout: string,
    stderr: string,
    durationMs: number,
    exitCode: number
  ): HttpResponse {
    const metaIndex = stdout.lastIndexOf(CURL_META_SENTINEL);
    if (metaIndex === -1) {
      throw new Error(
        stderr.trim() ||
          stdout.trim() ||
          `curl exited with code ${exitCode} and no parseable output`
      );
    }

    const rawResponse = stdout.slice(0, metaIndex);
    const metaLine = stdout
      .slice(metaIndex + CURL_META_SENTINEL.length)
      .trim()
      .split('\n')[0];
    const [statusStr, timeStr, effectiveUrl = ''] = metaLine.split('|');
    const statusCode = Number.parseInt(statusStr, 10) || 0;
    const curlTime = Number.parseFloat(timeStr) || 0;

    const { statusLine, headers, body } = splitRawHttpResponse(rawResponse);

    return {
      statusCode,
      statusLine,
      headers,
      body,
      durationMs: Math.round(curlTime * 1000) || durationMs,
      effectiveUrl,
      stderr: stderr.trim(),
      ok: exitCode === 0 && statusCode >= 200 && statusCode < 400,
    };
  }
}

/** Rough tokenizer respecting single and double quotes. */
export function tokenizeCurlArgs(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (quote) {
      if (ch === quote) {
        quote = null;
        continue;
      }
      if (ch === '\\' && quote === '"' && i + 1 < input.length) {
        current += input[++i];
        continue;
      }
      current += ch;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

function splitRawHttpResponse(raw: string): {
  statusLine: string;
  headers: Record<string, string>;
  body: string;
} {
  // curl -D - may include multiple redirect blocks; use the last response.
  const parts = raw.split(/\r?\n\r?\n/);
  if (parts.length < 2) {
    return { statusLine: '', headers: {}, body: raw.trim() };
  }

  const headerBlock = parts[parts.length - 2];
  const body = parts[parts.length - 1];
  const headerLines = headerBlock.split(/\r?\n/).filter(Boolean);
  const statusLine = headerLines[0] ?? '';
  const headers: Record<string, string> = {};

  for (const line of headerLines.slice(1)) {
    const colon = line.indexOf(':');
    if (colon === -1) {
      continue;
    }
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[key] = headers[key] ? `${headers[key]}, ${value}` : value;
  }

  return { statusLine, headers, body };
}

export function getDefaultCurlPath(): string {
  return process.platform === 'win32'
    ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'curl.exe')
    : 'curl';
}
