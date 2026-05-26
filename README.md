# vscode-curl-notebook

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)

Run **curl** commands in a **VS Code notebook** — cell by cell, with variables, dotenv, and formatted HTTP output.

Inspired by [SQL Notebook](https://marketplace.visualstudio.com/items?itemName=cmoog.sqlnotebook): keep a plain `.http` file on disk, open it as a notebook, execute blocks interactively.

**Repository:** [github.com/yasersharifi/vscode-curl-notebook](https://github.com/yasersharifi/vscode-curl-notebook)

---

## Features

- **Notebook UI** for `.http` and `.curl` files (*Open With → Curl Notebook*)
- **Execute cells** with the notebook toolbar (▶ Run)
- **REST Client cells** — split on `###`
- **SQL Notebook cells** — split on two consecutive empty lines ([configurable](#configuration))
- **`{{variables}}`** — `@name = value`, workspace settings, `.env` via `{{$dotenv VAR}}`
- **Named requests** — `# @name login` then `{{login.response.body.token}}`
- **Variables panel** in the activity bar
- **Markdown output** — status, timing, headers, JSON/HTML body
- **IntelliSense** — curl flags, snippets, HTTP methods, headers, and `{{variables}}` as you type

## Screenshots

Open any `.http` file as a Curl Notebook and run requests in place:

```
@baseUrl = https://httpbin.org

###

# @name health
curl -sS '{{baseUrl}}/get'
```

## Installation

### From source (development)

```bash
git clone https://github.com/yasersharifi/vscode-curl-notebook.git
cd vscode-curl-notebook
npm install
npm run compile
code --install-extension vscode-curl-notebook-*.vsix   # after: npm run package
```

Or press **F5** in VS Code to launch the Extension Development Host.

### From VSIX

```bash
npm run compile
npm run package
npm run verify:package
code --install-extension vscode-curl-notebook-0.2.3.vsix --force
```

Remove old VSIX files first if `verify:package` warns about the wrong version:

```bash
rm -f notebook-curl-*.vsix vscode-curl-notebook-0.2.0.vsix vscode-curl-notebook-0.2.1.vsix
```

Then reload VS Code (**Developer: Reload Window**).

> **Note:** Marketplace icon = `media/icon.png`. Activity bar = `activitybar-light.svg` / `activitybar-dark.svg` (24×24, single-color fills only).

### Marketplace

_Coming soon._

## Usage

1. Open a `.http` or `.curl` file.
2. **Right-click → Open With… → Curl Notebook**  
   Or run **Curl Notebook: Open as Curl Notebook** from the command palette.
3. Click **Run** on a cell (or run all).
4. Inspect markdown output under each cell.

### Cell separators

| Style | Delimiter |
|-------|-----------|
| REST Client | Line containing only `###` |
| SQL Notebook | Two consecutive empty lines |
| Auto (default) | `###` if present, else double empty lines |

### Variables

```http
@baseUrl = https://api.example.com
@token = {{$dotenv API_TOKEN}}

###

# @name signIn
curl -sS -X POST '{{baseUrl}}/auth/sign-in' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}'

@accessToken = {{signIn.response.body.accessToken}}

###

curl -sS '{{baseUrl}}/me' \
  -H 'Authorization: Bearer {{accessToken}}'
```

| Syntax | Description |
|--------|-------------|
| `@name = value` | Session variable |
| `{{name}}` | Substituted before curl runs |
| `{{$dotenv VAR}}` | From workspace `.env` when enabled |
| `# @name req` | Names a request for response chaining |
| `{{req.response.body.field}}` | JSON path on a prior response |
| `// comment` | Ignored in curl extraction |

### Markdown cells

```http
/*markdown
# API notes
Document your endpoints here.
*/
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `curlNotebook.cellDelimiter` | `auto` | `triple-hash`, `double-newline`, or `auto` |
| `curlNotebook.curlPath` | `curl` | Path to curl binary |
| `curlNotebook.defaultTimeoutMs` | `60000` | Request timeout (ms) |
| `curlNotebook.maxBodyChars` | `50000` | Truncate large bodies in output |
| `curlNotebook.followRedirects` | `true` | Pass `-L` to curl |
| `curlNotebook.insecureTls` | `false` | Pass `-k` to curl |
| `curlNotebook.loadDotenv` | `true` | Load workspace `.env` |
| `curlNotebook.dotenvFile` | `.env` | Dotenv file path |
| `curlNotebook.variables` | `{}` | Workspace-wide variables |
| `curlNotebook.enableSuggestions` | `true` | Autocomplete in curl cells |

## Requirements

- **VS Code 1.85+**
- **`curl`** on your `PATH` (Windows 10+, macOS, Linux)
- **Trusted workspace** (the extension runs curl with your file contents)

## Development

```bash
npm install
npm run compile
npm run test:unit
npm run lint
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

[MIT](LICENSE) © [Yaser Sharifi](https://github.com/yasersharifi)
