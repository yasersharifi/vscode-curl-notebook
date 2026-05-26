# Changelog

## 0.2.4 — 2026-05-26

### Fixed

- Activity bar: use **PNG** icons (24×24); activate extension on **`onStartupFinished`** so the sidebar icon loads at launch
- Icon build script always regenerates activity bar PNGs (no early exit on marketplace icon only)

## 0.2.3 — 2026-05-26

### Fixed

- Activity bar icons: correct 24×24 monochrome SVGs with separate light/dark theme files (previous file was a copy of the 128px marketing icon)

## 0.2.2 — 2026-05-26

### Fixed

- Activity bar icon: use monochrome `activitybar-icon.svg` (VS Code ignores gradients/text in sidebar icons)

## 0.2.1 — 2026-05-26

### Added

- **IntelliSense** in curl notebook cells: flags (`-H`, `-d`, …), snippets, HTTP methods, headers, session `{{variables}}`
- Dedicated `curl-cell` language for notebook code cells
- Setting `curlNotebook.enableSuggestions` (default: `true`)

## 0.2.0 — 2026-05-26

### Changed

- Renamed package to `vscode-curl-notebook`; repository at [yasersharifi/vscode-curl-notebook](https://github.com/yasersharifi/vscode-curl-notebook)

### Added

- REST Client **named responses**: `# @name` + `{{name.response.body.field}}`
- `ResponseStore` and JSON path resolver for response chaining
- Architecture documentation under `docs/ARCHITECTURE.md`

### Fixed

- **SQL Notebook** cell splitting: only two consecutive empty lines split cells (single blank lines stay inside a cell)

## 0.1.0 — 2026-05-26

### Added

- Curl Notebook serializer for `.http` and `.curl` files
- Notebook controller executing curl cells with markdown output
- Variable substitution (`@name`, `{{name}}`, `{{$dotenv}}`)
- Variables activity bar tree view
- Workspace configuration and sample file
- Unit tests for parsing and tokenization
