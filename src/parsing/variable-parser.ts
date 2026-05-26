/**
 * Parses REST-style variable declarations from cell or file preamble.
 *
 * Supported forms:
 *   @name = value
 *   @name=value
 *   @name={{$dotenv VAR}}  → resolved via dotenv when enabled
 */

export interface ParsedVariable {
  readonly name: string;
  readonly rawValue: string;
}

const VARIABLE_LINE =
  /^@([A-Za-z_][\w.-]*)\s*=\s*(.+?)\s*$/;

const DOTENV_REF = /^\{\{\$dotenv\s+([A-Za-z_][\w.-]*)\s*\}\}$/;

/** REST Client request label: `# @name loginRequest` */
const REQUEST_NAME_LINE = /^\s*#\s*@name\s+([A-Za-z_][\w.-]*)\s*$/m;

export function parseVariableLines(text: string): ParsedVariable[] {
  const variables: ParsedVariable[] = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('@')) {
      continue;
    }
    const match = VARIABLE_LINE.exec(trimmed);
    if (!match) {
      continue;
    }
    variables.push({ name: match[1], rawValue: match[2] });
  }

  return variables;
}

export function resolveDotenvReference(
  rawValue: string,
  env: Readonly<Record<string, string>>
): string {
  const match = DOTENV_REF.exec(rawValue.trim());
  if (!match) {
    return rawValue;
  }
  const key = match[1];
  return env[key] ?? '';
}

export function extractExecutableCurl(text: string): string | null {
  const lines = text.split('\n');
  const curlLines: string[] = [];
  let foundCurl = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (foundCurl) {
        curlLines.push(line);
      }
      continue;
    }
    if (trimmed.startsWith('@') && VARIABLE_LINE.test(trimmed)) {
      continue;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('# @')) {
      continue;
    }
    if (/^curl\b/i.test(trimmed)) {
      foundCurl = true;
      curlLines.push(line);
      continue;
    }
    if (foundCurl) {
      curlLines.push(line);
    }
  }

  const joined = curlLines.join('\n').trim();
  return joined.length > 0 && /\bcurl\b/i.test(joined) ? joined : null;
}

export function isVariableOnlyCell(text: string): boolean {
  return extractExecutableCurl(text) === null && parseVariableLines(text).length > 0;
}

/** Named request from `# @name foo` (REST Client). */
export function parseRequestName(text: string): string | undefined {
  return REQUEST_NAME_LINE.exec(text)?.[1];
}
