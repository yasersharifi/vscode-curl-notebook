# Changelog

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
