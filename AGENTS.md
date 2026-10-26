# MarkdownIt Plugins Coding Standards

## Project Overview

- **Project Type**: TypeScript Monorepo
- **Node.js Version**: `>=22` (CI uses 22 / 24 / 26; `devEngines.runtime` requires `^22.23.4 || ^24.22.1 || ^26.12.1`)
- **Package Manager**: pnpm 12.15.0 (enforced by `devEngines.packageManager` + `packageManagerDependencies` in `pnpm-lock.yaml`)
- **Package Count**: 39 workspace packages — 38 MarkdownIt plugins + `@mdit/helper`
- **Target Environments**: Node.js and Browser. Some packages are Node-only (`include`, `snippet`, and the default entry of `plantuml`) or require a bundler (`katex-slim`, `mathjax`, `mathjax-slim`); CDN usage requires the UMD build.

## Project Structure

```
mdit-plugins/
├── docs/       # VuePress 2 documentation site (English at /, Chinese under /zh/)
├── packages/   # 39 workspace packages (38 plugins + helper)
├── scripts/    # Shared build / release / analysis scripts (with __tests__)
└── ...
```

## Build Tools

- **tsdown** - bundler (shared config in `scripts/tsdown.ts`)
- **oxlint** / **oxfmt** - Linting and formatting. The shared `oxc-config-hope` preset enables
  `typeAware` / `typeCheck` / `denyWarnings` by default, so even a bare `oxlint` fails on warnings.
- **vitest** - Testing framework (coverage via istanbul; default environment is **node**, DOM tests opt in
  per file with `// @vitest-environment happy-dom`)
- **TypeScript** - via `@mr-hope/tsconfig/web.json` (TS 7 native `tsc`), `isolatedDeclarations: true`

## Common Commands

| Command                          | Description                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm run build`                 | Build all packages                                                                 |
| `pnpm run clean`                 | Clean build outputs of all packages                                                |
| `pnpm run test`                  | Run unit tests (no coverage; scripts before any coverage check for mathjax)        |
| `pnpm run test:coverage`         | Run the full suite **in the repo root** with istanbul coverage + 100% thresholds   |
| `pnpm run test:bench`            | Run vitest benchmarks — **currently broken**, see Known Gaps                       |
| `pnpm run lint`                  | Run oxlint + oxfmt with auto-fix                                                   |
| `pnpm run lint:check`            | Run oxlint + oxfmt without auto-fix (same as CI)                                   |
| `pnpm run lint:md`               | Lint markdown files                                                                |
| `pnpm run type-check`            | Type check all packages (`tsc --noEmit`, TS 7 native)                              |
| `pnpm run bundle:analyze`        | Upload bundle analysis to Codecov                                                  |
| `pnpm run docs:dev`              | Start docs dev server                                                              |
| `pnpm run docs:build`            | Build documentation                                                                |
| `pnpm run packages:bootstrap`    | Scaffold a new plugin package (skeleton only, see Scripts Reference)               |
| `pnpm run packages:check-update` | Check dependency updates with `npm-check-updates` (`pnpm dlx`, not the pinned CLI) |
| `pnpm run packages:update`       | Update all dependencies with `pnpm up -r` (does **not** read `.ncurc.js`)          |

> Release is **not** a local script: run the `publish.yml` workflow manually (see Release Workflow).

## CI/CD Workflows

All workflows install with pnpm 12's `pnpm ci` (clean + frozen lockfile), not `pnpm install`.

| Workflow          | Triggers                                    | Description                                                                            |
| ----------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `unit-test.yml`   | push (all branches) + PR                    | Full suite + coverage on Node.js 22 / 24 / 26; Codecov upload only on Node 24          |
| `linter-test.yml` | push (all branches) + PR                    | Type check, bundle analysis, `lint:check`, `lint:md`                                   |
| `codeql.yml`      | push / PR to `main`, weekly (Wed 07:30 UTC) | CodeQL security analysis for JavaScript                                                |
| `docs.yml`        | push (all branches) + PR                    | Build docs; deploy to `mdit-plugins/mdit-plugins.github.io` only from `main`           |
| `publish.yml`     | **manual `workflow_dispatch` only**         | Release; actor allowlist, inputs `dryrun` / `prerelease` / `graduate` / `publish_only` |

There is currently no `concurrency` / `timeout-minutes` hardening in these workflows.

## Package Structure

Each plugin follows this structure:

```
packages/<plugin-name>/
├── src/
│   ├── index.ts        # Main entry point (public exports only)
│   ├── plugin.ts       # Plugin implementation
│   ├── options.ts      # Options definition (if the plugin has options)
│   └── *.ts            # rules / utils / defaultRender / types
├── __tests__/
│   ├── *.spec.ts       # Test files
│   ├── *.bench.ts      # Benchmarks (optional, currently unmaintained)
│   └── __fixtures__/   # Test fixtures (excluded from type-check)
├── dist/               # Build output (gitignored)
├── package.json
├── tsdown.config.ts    # Build config
├── CHANGELOG.md
├── LICENSE             # Note: plain `LICENSE`, not `LICENSE.md`
└── README.md
```

Some packages have extra entries depending on platform: `node.ts` / `browser.ts` (e.g. `include`,
`snippet`, `plantuml`), `async/index.ts` (mathjax), `worker.ts` (mathjax sync entry), or sibling
files such as `bare.ts` / `light.ts` / `full.ts` (emoji).

## Plugin Registration Patterns

### Plugin Signatures

Two plugin signatures are used:

- **`PluginSimple`** — for plugins without options:

  ```ts
  export const pluginName: PluginSimple = (md) => { ... };
  ```

  Examples: `dl`, `footnote`, `abbr`, `align`, `ins`, `mark`, `ruby`, `sub`, `sup`, `img-lazyload`

- **`PluginWithOptions`** — for plugins with options:

  ```ts
  export const pluginName: PluginWithOptions<PluginOptions> = (md, options) => { ... };
  ```

  Examples: `attrs`, `container`, `figure`, `alert`, `emoji`, `embed`, `mathjax`, `tab`

**Naming**: The exported `const` name must match the plugin name. Node/Browser split packages may
additionally export a `resolve*` helper (e.g. `resolveInclude`) and are wired via conditional
`exports` instead of a browser guard.

### index.ts Export Patterns

| Pattern                                                                   | Use case                                                 |
| ------------------------------------------------------------------------- | -------------------------------------------------------- |
| `export type * from "./options.js";` + `export * from "./plugin.js";`     | Plugin with options, single variant                      |
| `export * from "./plugin.js";`                                            | Plugin without options                                   |
| `export * from "./plugin.js";` + `export type * from "./types.js";`       | Plugin without options, but exposes custom types         |
| Multiple named exports from separate files                                | Plugin with multiple variants (see below)                |
| `export * from "./plugin.js";` + extra type exports (separate type files) | Options plus extra public types (e.g. `mathjax` methods) |

### Multi-Variant Plugins

Some packages export multiple named plugin variants from a single package:

- `plugin-emoji` → `bareEmoji`, `lightEmoji`, `fullEmoji` (in `bare.ts`, `light.ts`, `full.ts`)
- `plugin-img-size` → `imgSize`, `legacyImgSize`, `obsidianImgSize`
- `plugin-anchor` → `anchor`, `legacyAnchor`
- `plugin-include` → `include`, `resolveInclude`
- `plugin-katex` / `plugin-katex-slim` → `katex` (main entry) + `./mhchem` subpath entry
- `plugin-mathjax` / `plugin-mathjax-slim` → `mathjax` (sync install) + `getMathjax` (methods);
  `./async` subpath keeps the instance API (`createMathjaxInstance` + `mathjax`)
- `plugin-tab` → `tab` + `./tab` (browser helper) + `./register-tab` (UMD helper) + `./style`

## Code Rules

- Must be written in TypeScript
- Use `src/index.ts` as the entry file to export the plugin
- Use `src/plugin.ts` for plugin implementation
- Use `src/options.ts` for options definition (if the plugin has options)
- For plugins without options: omit `options.ts`; use `src/types.ts` if custom type definitions are needed
- Forked files must include an attribution comment at the top

Logic that is not directly related to the plugin implementation should be extracted to other files in `src` directory, e.g.:

- Rules: `src/rules.ts`
- Utils: `src/utils.ts`
- Default render: `src/defaultRender.ts`

### File Attribution

Forked files must include a JSDoc comment at the top:

```ts
/** Forked and modified from https://github.com/markdown-it/markdown-it-xxx/blob/master/index.mjs */
```

### Lint Suppression

Use inline oxlint suppressions sparingly:

```ts
// oxlint-disable-next-line <rule-name>
```

Commonly suppressed rules: `typescript/no-non-null-assertion`, `no-labels`, `max-lines-per-function`, `typescript/strict-boolean-expressions`.

## Package.json Standards

`scripts/bootstrap.ts` generates a skeleton package, but it **lags behind the current convention**:
it still emits `main` / `types` and does not generate `sideEffects`, `unpkg`, `jsdelivr`,
`engines`, runtime `dependencies`, `tsdown.config.ts` or `LICENSE`. Every new package must be
completed manually (see Known Gaps). Current required shape:

- `"name": "@mdit/plugin-<name>"`, `"version"`, `"description"`, `"keywords"` (include
  `markdown-it`), `"homepage": "https://mdit-plugins.github.io/<page>.html"`, `"bugs"`,
  `"license": "MIT"`, `"author"`, `"repository"` (with `"directory": "packages/<dir>"`)
- `"type": "module"` — all packages are ESM
- `"sideEffects": false` — tree-shakable. **Documented exceptions** use an array instead: CSS
  packages (`plugin-alert` → `./alert.css`, `plugin-spoiler` → `./spoiler.css`, `plugin-tab` →
  `./tab.css` + `./dist/register-tab.umd.js`) and `plugin-katex` / `plugin-katex-slim` →
  `./dist/mhchem.js`
- `"files": ["dist"]` — only build output is published; CSS packages additionally ship their `.css`
  file (`plugin-alert`, `plugin-spoiler`, `plugin-tab`)
- **No top-level `main` / `types`** — resolution goes through `exports` only:
  `"."`: `{ "types": "./dist/index.d.ts", "default": "./dist/index.js" }`, plus `"./package.json"`;
  multi-entry packages add subpaths and platform conditions (see below)
- `"unpkg"` / `"jsdelivr"`: `"./dist/cdn.umd.js"` — **only for packages with a UMD build**. 32/39
  packages ship UMD; without UMD are `helper` (internal), `include` / `snippet` (Node-only),
  `plantuml` (platform-split), `katex-slim` / `mathjax` / `mathjax-slim` (multi-entry or
  bundler-only strategy). `anchor` currently has no UMD and is the one package missing a CDN entry
  without a platform reason — add it or document the exception.
- `"dependencies"`: workspace-internal packages (`"@mdit/helper": "workspace:^"`), plus external
  runtime deps via `catalog:` (`katex`, `@mathjax/*`, `upath`) or a pinned range (`synckit`).
  **`@types/markdown-it` is no longer needed**: markdown-it 15 ships its own types.
- `"peerDependencies"`: `{ "markdown-it": "catalog:" }` (published as `^15.x`) with
  `"peerDependenciesMeta": { "markdown-it": { "optional": true } }`. Packages that lazily load heavy
  optional deps declare them as optional peers too (e.g. `mathjax-slim` → `@mathjax/src`,
  `@mathjax/mathjax-newcm-font`).
- `"publishConfig": { "access": "public" }`
- `"scripts.build": "tsdown"`, `"scripts.clean": "rimraf ./dist"`
- `"engines": { "node": ">=22" }`

`devDependencies` and `scripts` are stripped by lerna before publishing (`removePackageFields`).
Lerna also resolves `workspace:` / `catalog:` protocols before publishing, so published manifests
contain normal semver ranges.

## Build Configuration

All plugins use the shared `tsdownConfig` helper from `scripts/tsdown.ts`:

```ts
import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"), // ESM build
  tsdownConfig("index", {
    // UMD/CDN build
    globalName: "mdItPluginXxx",
    globals: { "markdown-it": "markdownit" },
  }),
];

export default config;
```

- The first entry produces the ESM lib output (`platform: "neutral"`, `target: "node22"`, dts on)
- The second entry produces the UMD/CDN bundle with `globalName` as the global variable name
  (`mdItPluginXxx`, note the capital `I` — e.g. `mdItPluginAttrs`), `platform: "browser"`,
  `target: "baseline-widely-available"` and no dts
- Add UMD only when the package is browser-usable through a `<script>` tag. Node-only packages
  (`include`, `snippet`), platform-split packages (`plantuml`) and bundler-only packages
  (`katex-slim`, `mathjax`, `mathjax-slim`) intentionally only ship ESM
- Per-package variants pass extra options: `platform: "node" | "browser"` (multi-entry builds),
  `alias` (e.g. `@deflate` → `src/deflate/node.ts` / `browser.ts` in `plantuml`),
  `alwaysBundle` (UMD-only external deps such as `pako`), `treeshake.moduleSideEffects`
  (`katex` mhchem), `copy` (vendored assets)
- `publint` runs automatically in production builds (`NODE_ENV=production`)

## @mdit/helper

The `packages/helper/` package provides shared utilities used across all plugins:

- `dedent` — template literal dedent
- `escape` — `escapeHtml` and `escapeRegExp`
- `markdown` — markdown scanning helpers (`scanFence`, `NEWLINE_RE`, ...)
- `reg` — common regex patterns
- shared markdown-it types (`types.ts`)

Import from `@mdit/helper` when these utilities are needed. It is an internal package with no UMD
build, and helpers must stay browser-safe (no `node:` imports).

## Commit Conventions

- **Format**: `type(scope): message` or `type!: message` (for breaking changes)
- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `workflow`, `build`, `ci`, `chore`, `types`, `release`
- **Allowed scopes**: any directory under `packages/` (e.g., `plugin-attrs`) + `deps`
- **Validation**: `scripts/verifyCommit.ts` (run by the husky `commit-msg` hook via `unrun`) uses
  `@mr-hope/verify-commit-message`. The `commitlint` field in `package.json` is currently **not**
  wired to a commitlint CLI and should not be relied on.

### Pre-commit Hooks

Husky + nano-staged:

- `**/*` → `oxfmt --no-error-on-unmatched-pattern`
- `*.{js,ts}` → `oxlint --fix`
- `*.md` → `markdownlint-cli2 --fix`

`oxc-config-hope` already enables `typeAware` / `typeCheck` / `denyWarnings` /
`reportUnusedDisableDirectives` through `oxlint.config.ts`, so the CLI flags are not repeated in
`nano-staged`. Warnings fail both the hook and CI.

## Test Rules

- Test files must be in `__tests__` directory
- Use `vitest` for testing
- Import from source with `.js` extension: `import { pluginName } from "../src/index.js";`
- Typical test setup: `const md = MarkdownIt({ linkify: true }).use(pluginName);`
- Tests should be grouped by testing cases with `describe`
- Tests should target 100% branch coverage
- A test file should not have too many lines. If it exceeds 300-500 lines, consider splitting it into multiple files if possible:
  - `__tests__/basic.spec.ts` for basic syntax tests
  - `__tests__/nesting.spec.ts` for nesting related tests
  - `__tests__/options.spec.ts` for options related tests

### Vitest Configuration

- **Coverage provider**: `istanbul`, `include: ["packages/*/src/**/*.ts"]`, four 100% thresholds
  (statements / branches / functions / lines)
- **Environment**: default **node**; a file opts into DOM with `// @vitest-environment happy-dom`
  (currently only `plugin-tab` browser specs)
- **Benchmarks**: `**/*.bench.ts` is configured, but see Known Gaps — benches are currently broken
- **CI mode**: Set `TEST_REPORT=true` to emit JUnit (`coverage/test-report.junit.xml`) + cobertura
- The root config defines no `test.exclude` beyond vitest defaults, so do not place `*.spec.ts`
  under `temp/`, `docs/` or build output directories
- `@deflate` is aliased to the plantuml node deflate implementation for tests; the `.js` extension in
  the alias relies on Vite's TS resolution fallback

## Release Workflow

Publishing uses lerna-lite with independent versioning, configured in `lerna.json` and executed by
the **manual** `publish.yml` GitHub Actions workflow (there is no local release script):

- `"version": "independent"` — each package has its own version
- `"allowBranch": "main"` — the workflow can only version from `main` (guard input `publish_only`
  skips `lerna version`)
- `"conventionalCommits": true` — auto-generate changelogs from commits
- `"createRelease": "github"` — auto-create GitHub releases
- `"removePackageFields": ["devDependencies", "scripts"]` — stripped before publish

Workflow steps (`publish.yml`, gated by an actor allowlist and the `dryrun` / `prerelease` /
`graduate` / `publish_only` inputs):

1. `pnpm ci` — frozen install
2. `pnpm run build` — build all packages
3. `pnpm run type-check` — type check
4. `pnpm run lint:check` + `pnpm run lint:md` — lint and format
5. `pnpm run test:coverage` — full suite with the 100% thresholds
6. `lerna version` (skipped when `publish_only`) — bump versions + changelogs + GitHub releases
7. `lerna publish from-package --force-publish --yes` — publish to npm via **OIDC Trusted
   Publishing** (`id-token: write`, no long-lived `NPM_TOKEN`); public repo builds carry sigstore
   provenance automatically. `--force-publish` is effectively a no-op for `from-package`
8. `scripts/sync.ts` — best-effort sync to npmmirror.com (does not fail the job)

Backup/retry: re-run the workflow with `publish_only: true` to publish versions that already exist
in git but are missing from the registry.

## Scripts Reference

| Script                    | Purpose                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `scripts/bootstrap.ts`    | Scaffold `package.json` + `README.md` for a new plugin (incomplete template, see Known Gaps) |
| `scripts/sync.ts`         | Best-effort sync of all packages to npmmirror.com; checks connection only, not HTTP status   |
| `scripts/analyze.ts`      | Upload bundle analysis to Codecov (needs OIDC; may fail on fork PRs)                         |
| `scripts/tsdown.ts`       | Shared tsdown build config helper for all plugins                                            |
| `scripts/verifyCommit.ts` | Commit message validation entry (`@mr-hope/verify-commit-message`)                           |
| `scripts/__tests__/`      | Vitest tests for `bootstrap` / `analyze` / packaging rules (`packaging.spec.ts`)             |

## TypeScript Configuration

- Extends `@mr-hope/tsconfig/web.json` (web/browser-targeted shared config)
- `isolatedDeclarations: true` — required so tsdown can emit declarations safely
- TypeScript 7 (native `tsc`); `tsc --noEmit` covers packages, scripts and the docs config
- `include`: `**/*.ts` and `**/.vuepress/**/*.ts`
- Excludes: `**/snippets/example.ts`, `**/__fixtures__/**`, `**/dist/**`

## Performance Lint Overrides

For `packages/*/src/**`, certain oxlint rules are disabled due to performance considerations:

- `prefer-destructuring`, `prefer-object-spread`, `prefer-spread` — create intermediate objects
- `typescript/prefer-for-of` — slower than indexed loops in some cases
- `unicorn/prefer-code-point` — `charCodeAt` is used intentionally for performance

### How to Run Tests

**Preferred (same as CI):** from the repo root run

```bash
pnpm run test:coverage
```

This loads the root `vitest.config.ts`, so the istanbul provider, the `packages/*/src/**/*.ts`
include scope and the four 100% thresholds are enforced. This is the command that proves the 100%
coverage requirement.

**Single package (debugging only):**

```bash
cd packages/<name>
pnpm exec vitest run --coverage --coverage.provider=istanbul
```

Caveats: the root config is not picked up, so this run has **no thresholds and no `coverage.include`**
(only imported files are reported — a new untested file can hide). `plugin-plantuml` fails because its
`@deflate` alias only exists in the root config / tsdown config. `plugin-mathjax` / `plugin-mathjax-slim`
need `pnpm run build` first because their tests read `dist/worker.js` — see Known Gaps.

## Bug Fix Workflow

When fixing a bug, every fix MUST follow this strict 8-step workflow:

1. **Add a test**: Add a minimal, reasonable unit test that exposes the bug.
2. **Verify it fails**: Run the unit test and confirm it fails (bug reproduced).
3. **Fix the source**: Modify the source code to fix the bug.
4. **Verify the fix**: Run the unit test and confirm it passes.
5. **Coverage**: Confirm the modified code still has 100% coverage by running `pnpm run test:coverage`
   in the repo root (same command as CI; the four 100% thresholds fail the run if coverage drops). The
   package-level command is only a debugging aid — it has no thresholds, see "How to Run Tests". If the
   changed package is `plugin-mathjax` / `plugin-mathjax-slim`, run `pnpm run build` before the tests.
6. **Subagent review**: Send the concrete bug details to a subagent to review your changes. The subagent may ONLY review — it must NOT modify any files. Provide only the bug details, NOT your implementation approach, so the subagent independently evaluates whether your fix is correct.
7. **Iterate**: Read the subagent's feedback. If it raises new issues, return to step 1 (add a test exposing the new issue → …) and repeat until the subagent reports no issues and considers the fix fully OK.
8. **Commit & push**: Create a branch with an appropriate name (e.g. `fix/plugin-<name>-<desc>`), commit with a message conforming to `scripts/verifyCommit.ts` (format `type(scope): subject`, subject ≤ 50 chars), and push to origin.

### Commit Iron Rules

- **Linter must pass**: `pnpm run lint:check` (oxlint + oxfmt) reports no errors and no warnings
  (the shared config sets `denyWarnings`).
- **Coverage must be 100%**: `pnpm run test:coverage` in the repo root reports 100%
  statements/branches/functions/lines. Package-level coverage runs are debugging helpers, not the gate.
- **Never commit if not passing**: If any of the above fails, do not commit — fix until it passes.
- **Never push directly to `main`**: Work must never be pushed directly to the `main` branch, unless the user explicitly asks to do so. Always work on and push feature branches.

## Performance

- Perform quick checks and return early if possible to avoid unnecessary computations, especially in performance-critical paths. Check the cost for silent mode checking (`if (silent) return true;`).

- Usage of RegExp should be avoided, especially in performance-critical paths. Prefer using a pos pointer to access characters in string with logic instead. Unless it is clear that using RegExp is more efficient and does not cause performance issues.

- Operating strings with `slice`, `substring` and similar methods that create new strings shall be avoided if possible.

- Prefer using `charCodeAt` for character access and comparison instead of `charAt`.

  To improve readability, use the format `str.charCodeAt(index) === number /* char */` for character comparisons.

  E.g.: `str.charCodeAt(index) === 36 /* $ */`

- Constants must be defined at the top of the file to avoid local creation overhead.

- If a static variable is used multiple times, it should be extracted to a constant unless it's hard to deal with types or it breaks readability badly.

## JSDoc Rules

### Scope

- **Required for**: All plugin options

### Format Requirements

- **Bilingual**: English + Chinese for all exported content
- **@example**: Only for exported functions
- **@default**: Always include if exists for all properties (including `@default false`)
- **@param**: Required for all parameters, should be bilingual, separate with `/` for English and Chinese
- **@returns**: Required for all return values except `void` and `Promise<void>`, should be bilingual, separate with `/` for English and Chinese

```ts
/**
 * English description
 *
 * 中文描述
 *
 * @example
 *   // Example code in TypeScript
 *
 * @default defaultValue
 * @param paramName - English description / 中文描述
 */
```

## Documentation Rules

### Plugin Documentation

- Consistent with code behaviors
- Chinese/English content must be consistent in structure and content
- Make content concise and clear, remove unnecessary words, avoid redundancy, prefer shorter if possible
- Use "你" instead of "您" in Chinese

### Options Documentation Format

Plugin pages render options with the docs theme's `::: fields` container (markdown field plugin).
Do **not** use the old `### optionName` list format. One entry per option:

````md
::: fields
@`optionName` type=`boolean` default=`false`

English description. Longer details continue in paragraphs and may contain fenced code.

@`requiredOption` type=string required

English description.

@`complexOption` type=`(tokens: Token[]) => string`

English description.

```ts
type ComplexOption = /* ... */;
```
:::
````

Entry syntax: ``@`optionName` type=<type> [required] [default=<value>]``

- `type`: a plain value (`string`, `number`) or a backticked TS expression (`` type=`"a" | "b"` ``).
  Complex types may be shown in a fenced block after the description instead
- `required`: bare keyword, only for required options; never mark optional options as required
- `default`: include for non-obvious defaults; explicit `false` / `''` defaults are allowed but must
  match the source JSDoc `@default` and the other language
- Details are the paragraphs after the entry line; nest code fences inside the container when needed
- Close the container with a line containing exactly `:::`

The Chinese page mirrors the English structure one-to-one (same entries, same order, same code
fences), translates the descriptions, and uses "你" instead of "您". Validate changes with
`pnpm run docs:build` (fields, math and includes are all rendered during the build).

### Type Definitions

There is no separate mandatory "Type Definitions" heading. Document public types in one of these
ways, keeping both languages consistent:

- inline in the same `::: fields` container as the options/methods they belong to (preferred), or
- in a shared snippet such as `docs/src/render-rule.snippet.md`, included with
  `<!-- @include: ../render-rule.snippet.md -->` (see `docs/src/field.md` and `docs/src/tab.md`).

Shared types that also exist in JSDoc should be described once and linked, not copied verbatim in
both pages.

## Known Gaps & Repository Notes

These are known and tracked. Do not assume they work, and do not copy them as patterns:

- **Benchmarks are broken**: 8 of 9 `*.bench.ts` files import a removed `../src-old/*` path;
  `pnpm run test:bench` fails and CI never runs benchmarks. Fix or delete them before trusting bench
  numbers.
- **Package-level coverage is weaker than CI**: no thresholds and no `coverage.include`, and the
  `plugin-plantuml` package-level run fails because its `@deflate` alias only exists in the root
  vitest / tsdown configs. Use root `pnpm run test:coverage` as the gate.
- **mathjax tests need a build**: `plugin-mathjax` / `plugin-mathjax-slim` `sync.spec.ts` load
  `dist/worker.js` and assert it is newer than the worker sources. Run `pnpm run build` before tests
  and rebuild after editing `src/worker.ts`, `src/session.ts` or `src/protocol.ts`.
- **Release is manual**: there is no `pnpm run release`; trigger the `publish.yml` workflow
  (`workflow_dispatch`). Use `publish_only: true` to retry registry publishing without re-versioning.
- **Untrusted Markdown is not safe by default**: `plugin-mathjax` / `plugin-mathjax-slim` do not
  register the MathJax `SafeHandler` while `html` / `texhtml` TeX packages are enabled, and the
  documented icon renderers (`fontawesomeRender` / `iconifyRender` / `defaultRender`) do not validate
  attribute names. `plugin-advanced-links` custom renderers and `plugin-footnote`'s `env.docId` also
  expect the caller to escape. Do not render untrusted input with these plugins until these paths are
  hardened, or sanitize the output.
- **Actions are pinned by tag, not SHA**, and workflows have no `concurrency` / `timeout-minutes`
  hardening; the docs deploy uses a PAT via `secrets.ACCESS_TOKEN`. Treat workflow changes as
  security-sensitive.
- **`@deflate` has two sources of truth**: root `vitest.config.ts` (`.js`, relying on Vite's TS
  fallback) and `plugin-plantuml/tsdown.config.ts` (`.ts`, node/browser variants). Keep them in sync;
  only plantuml should import `@deflate`.
- **Docs math integration is patched**: `patches/@vuepress__plugin-markdown-math@2.0.0-rc.137.patch`
  adapts the VuePress plugin to the mathjax v2 API. It is version-pinned; when VuePress dependencies
  move, the patch key must be updated/re-created. `docs/package.json` does not declare the plugin
  directly.
- **Bootstrap is incomplete**: `scripts/bootstrap.ts` does not generate `sideEffects` / `unpkg` /
  `jsdelivr` / `engines` / runtime deps / `tsdown.config.ts` / `LICENSE`, and its README template lacks
  the `## [Docs]` section. Complete new packages manually.
- **Four packages miss LICENSE files**: `plugin-demo`, `plugin-field`, `plugin-inline-rule`,
  `plugin-plantuml`. The rest use `LICENSE` (not `LICENSE.md`).
- **`minimumReleaseAge` is not enabled** (only the `*Exclude` lists exist), so pnpm has no
  new-version cooldown; renovate and ncu still apply their own cooldowns.
- **Keep this file in sync** when changing scripts, workflow triggers, test config or release steps.
  A stale `AGENTS.md` is a documentation bug: update it in the same PR instead of leaving drift.
