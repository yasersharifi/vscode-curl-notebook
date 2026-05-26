# Contributing to Curl Notebook

## Setup

```bash
cd vscode-curl-notebook
npm install
npm run compile
```

Press **F5** in VS Code to launch the Extension Development Host.

## Checks before a PR

```bash
npm run compile
npm run test:unit
npm run lint
```

## Code style

- TypeScript strict mode; no `any`.
- Prefer small modules under `src/` with one clear responsibility.
- Document non-obvious behavior in JSDoc on public APIs.
- Add unit tests in `test/unit/` for parsing and variable logic.

## Adding features

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for extension points (delimiters, executor swap, etc.).
