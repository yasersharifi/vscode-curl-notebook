/** Pure helpers for filtering completion items (testable without vscode). */

export function extractCompletionPrefix(linePrefix: string): string {
  const flag = linePrefix.match(/(?:^|\s)(-[\w-]*)$/);
  if (flag) {
    return flag[1];
  }

  const curlWord = linePrefix.match(/(?:^|\s)(curl[\w-]*)$/i);
  if (curlWord) {
    return curlWord[1];
  }

  const brace = linePrefix.match(/\{\{([A-Za-z0-9_.$-]*)$/);
  if (brace) {
    return brace[1];
  }

  const at = linePrefix.match(/@([A-Za-z_][\w.-]*)$/);
  if (at) {
    return `@${at[1]}`;
  }

  const word = linePrefix.match(/(?:^|\s)([\w#.-]*)$/);
  return word?.[1] ?? '';
}

export function matchesPrefix(label: string, prefix: string): boolean {
  if (!prefix) {
    return true;
  }
  const normalizedLabel = label.replace(/^\{\{|\}\}$/g, '');
  return (
    label.toLowerCase().startsWith(prefix.toLowerCase()) ||
    normalizedLabel.toLowerCase().startsWith(prefix.toLowerCase())
  );
}
