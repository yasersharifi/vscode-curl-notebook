import * as vscode from 'vscode';

export interface CurlCompletionEntry {
  readonly label: string;
  readonly detail?: string;
  readonly documentation?: string;
  readonly insertText: string | vscode.SnippetString;
  readonly kind?: vscode.CompletionItemKind;
}

export const CURL_FLAGS: readonly CurlCompletionEntry[] = [
  { label: '-X', detail: 'HTTP method', insertText: "-X '${1:GET}' ", documentation: 'Request method (GET, POST, PUT, …)' },
  { label: '-H', detail: 'Header', insertText: "-H '${1:Header}: ${2:value}' ", documentation: 'Extra HTTP header' },
  { label: '-d', detail: 'Body data', insertText: "-d '${1:}' ", documentation: 'Request body (POST/PUT/PATCH)' },
  { label: '-G', detail: 'GET with data', insertText: '-G ', documentation: 'Send -d data as query string on GET' },
  { label: '-u', detail: 'User:password', insertText: "-u '${1:user:password}' ", documentation: 'Basic authentication' },
  { label: '-F', detail: 'multipart form', insertText: "-F '${1:name}=${2:value}' ", documentation: 'multipart/form-data' },
  { label: '-b', detail: 'Cookie', insertText: "-b '${1:name=value}' ", documentation: 'Send cookies' },
  { label: '-c', detail: 'Cookie jar', insertText: "-c '${1:cookies.txt}' ", documentation: 'Save cookies to file' },
  { label: '-A', detail: 'User-Agent', insertText: "-A '${1:curl/8.0}' ", documentation: 'User-Agent header' },
  { label: '-e', detail: 'Referer', insertText: "-e '${1:https://example.com}' ", documentation: 'Referer header' },
  { label: '-L', detail: 'Follow redirects', insertText: '-L ', documentation: 'Follow HTTP 3xx redirects' },
  { label: '-k', detail: 'Insecure TLS', insertText: '-k ', documentation: 'Allow insecure SSL connections' },
  { label: '-s', detail: 'Silent', insertText: '-s ', documentation: 'Silent mode (no progress)' },
  { label: '-S', detail: 'Show errors', insertText: '-S ', documentation: 'Show errors when used with -s' },
  { label: '-sS', detail: 'Silent + errors', insertText: '-sS ', documentation: 'Silent but show errors' },
  { label: '-v', detail: 'Verbose', insertText: '-v ', documentation: 'Verbose output' },
  { label: '-i', detail: 'Include headers', insertText: '-i ', documentation: 'Include response headers in output' },
  { label: '-I', detail: 'HEAD request', insertText: '-I ', documentation: 'Fetch headers only (HEAD)' },
  { label: '-o', detail: 'Output file', insertText: "-o '${1:output.bin}' ", documentation: 'Write body to file' },
  { label: '-O', detail: 'Remote filename', insertText: '-O ', documentation: 'Save using remote file name' },
  { label: '-T', detail: 'Upload file', insertText: "-T '${1:file.bin}' ", documentation: 'Upload file (PUT)' },
  { label: '-m', detail: 'Max time', insertText: "-m ${1:30} ", documentation: 'Maximum time for the transfer (seconds)' },
  { label: '--connect-timeout', detail: 'Connect timeout', insertText: '--connect-timeout ${1:10} ', documentation: 'Connection timeout in seconds' },
  { label: '-x', detail: 'Proxy', insertText: "-x '${1:http://proxy:8080}' ", documentation: 'Use proxy server' },
  { label: '--json', detail: 'JSON body', insertText: "--json '${1:{}}' ", documentation: 'Send JSON (sets Content-Type)' },
];

export const HTTP_METHODS: readonly CurlCompletionEntry[] = [
  { label: 'GET', insertText: 'GET' },
  { label: 'POST', insertText: 'POST' },
  { label: 'PUT', insertText: 'PUT' },
  { label: 'PATCH', insertText: 'PATCH' },
  { label: 'DELETE', insertText: 'DELETE' },
  { label: 'HEAD', insertText: 'HEAD' },
  { label: 'OPTIONS', insertText: 'OPTIONS' },
];

export const COMMON_HEADERS: readonly CurlCompletionEntry[] = [
  { label: 'accept', detail: 'Accept', insertText: "accept: application/json" },
  { label: 'Content-Type', detail: 'Content-Type', insertText: "Content-Type: application/json" },
  { label: 'Authorization', detail: 'Authorization', insertText: "Authorization: Bearer {{token}}" },
  { label: 'User-Agent', detail: 'User-Agent', insertText: 'User-Agent: curl-notebook' },
  { label: 'X-Api-Key', detail: 'API key', insertText: 'X-Api-Key: {{apiKey}}' },
];

export const CURL_SNIPPETS: readonly CurlCompletionEntry[] = [
  {
    label: 'curl',
    detail: 'Start curl command',
    kind: vscode.CompletionItemKind.Snippet,
    insertText: new vscode.SnippetString(
      "curl -sS '${1:https://api.example.com}'"
    ),
  },
  {
    label: 'curl GET',
    detail: 'GET request snippet',
    kind: vscode.CompletionItemKind.Snippet,
    insertText: new vscode.SnippetString(
      "curl -sS -X GET '${1:https://api.example.com}' \\\n  -H 'accept: application/json'"
    ),
  },
  {
    label: 'curl POST JSON',
    detail: 'POST JSON snippet',
    kind: vscode.CompletionItemKind.Snippet,
    insertText: new vscode.SnippetString(
      "curl -sS -X POST '${1:https://api.example.com}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${2:{}}'"
    ),
  },
  {
    label: '@variable',
    detail: 'Define variable',
    kind: vscode.CompletionItemKind.Snippet,
    insertText: new vscode.SnippetString('@${1:name} = ${2:value}'),
  },
  {
    label: '# @name',
    detail: 'Named request (REST Client)',
    kind: vscode.CompletionItemKind.Snippet,
    insertText: new vscode.SnippetString('# @name ${1:requestName}'),
  },
];
