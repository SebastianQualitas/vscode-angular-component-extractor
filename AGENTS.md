# AGENTS.md

## Purpose

This file provides concise, repo-specific guidance for OpenCode agents and future contributors. Every line is included to prevent common mistakes and speed up onboarding.

---

## Project Overview

- **VS Code Extension**: Extracts Angular components from template selections using Angular CLI.
- **Entry point**: `src/extension.ts` (bundled to `dist/extension.js` via webpack).
- **Angular CLI**: Required for component generation. If not globally installed, the extension falls back to `npx`.

---

## Key Commands

Run all commands from the repo root.

- **Install dependencies**:  
  `yarn`  
  (CI uses Yarn; do not use npm install directly.)

- **Build (production)**:  
  `npm run package`  
  (Runs webpack with production mode and hidden source maps.)

- **Development build (watch)**:  
  `npm run watch`

- **Lint**:  
  `npm run lint`

- **Unit tests**:  
  `npm run test:unit`

- **E2E tests**:  
  `npm run test:e2e`  
  (Compiles with TypeScript before running.)

- **All tests (unit + e2e)**:  
  `npm test`

- **Prepublish for VS Code Marketplace**:  
  `npm run vscode:prepublish`

---

## CI/CD and Verification

- **CI Workflow**:  
  `.github/workflows/dev.workflow.yml` runs on push and PR for both Windows and Ubuntu, Node.js 14.x.
  - Steps:  
    1. Checkout  
    2. Setup Node  
    3. (Ubuntu) Start Xvfb display server  
    4. `yarn` install  
    5. `npm test` and `npm run vscode:prepublish`

- **Required order for local verification**:  
  1. `yarn`  
  2. `npm run lint`  
  3. `npm test`  
  4. `npm run package` (for production build)

---

## Extension Configuration

- **Component prefix**:  
  Set via VS Code settings:  
  ```json
  {
    "angular-component-extractor.default-prefix": "app"
  }
  ```
- **Logging**:  
  Adjustable via settings (`angular-component-extractor.log-level`, default: `warn`).

---

## Architecture & Tooling Notes

- **Webpack**:  
  - Entry: `src/extension.ts`
  - Output: `dist/extension.js`
  - Target: Node.js (for VS Code extension context)
  - Excludes `vscode` module from bundle

- **TypeScript**:  
  - Source: `src/`
  - Compiled output: `dist/`

- **Testing**:  
  - Unit: Mocha + NYC (coverage)
  - E2E: Custom runner at `out/e2e/runTest.js`
  - Watch mode available for unit tests

- **Preinstall check**:  
  - Runs `node ./tools/npm/check-npm.js` before install (enforces environment constraints)

---

## Conventions & Gotchas

- **Always use Yarn for dependency management** (matches CI and lockfile).
- **Do not edit generated files in `dist/` directly**.
- **Angular CLI must be available** (globally or via npx) for extension to function.
- **No monorepo structure**; single extension package.
- **No custom pre-commit or task runner config detected**.

---

## References

- Main documentation: `README.md`
- Build/test scripts: `package.json`
- CI: `.github/workflows/dev.workflow.yml`
- Build config: `webpack.config.js`
- Changelog: `CHANGELOG.md`

---

If you update workflows, scripts, or conventions, update this file to keep future agents efficient and error-free.
