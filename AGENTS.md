# MarkdownIt Plugins Coding Standards

> Conventions for contributors and AI agents. This document describes rules, not implementation
> details: commands, CI jobs, package templates and tool settings have a single source of truth in
> the files named below. Prefer those files when in doubt, and update this document when they change
> (see [Keeping This File Accurate](#keeping-this-file-accurate)).

## Project Overview

- **Project type**: TypeScript monorepo using pnpm workspaces.
- **Packages**: 38 plugin packages (`@mdit/plugin-*`) plus the shared `@mdit/helper`.
- **Node.js**: `>= 22` (`engines.node`). `devEngines.runtime` pins the tested floors
  (`^22.23.4 || ^24.22.1 || ^26.13.0`); CI runs all three majors.
- **Package manager**: pnpm 12, with the exact version pinned in `devEngines.packageManager`.
  `pnpm-lock.yaml` must stay committed.
- **Targets**: browser and Node.js. `@mdit/plugin-include`, `@mdit/plugin-snippet`, and the
  synchronous entry of `@mdit/plugin-katex-slim` / `@mdit/plugin-mathjax-slim` are Node-only.
- **Documentation**: VuePress 2 site in `docs/` — English pages at `docs/src/*.md`, Chinese pages at
  `docs/src/zh/*.md`.

## Repository Layout

```
mdit-plugins/
├── .github/workflows/   # CI: unit tests, linters, docs, CodeQL, publish
├── docs/                # VuePress 2 documentation site (en + zh)
├── packages/            # 38 plugin packages + @mdit/helper
├── scripts/             # build config, README sync, release sync, commit checks (+ tests)
├── AGENTS.md
├── package.json         # root scripts and tooling
└── ...                  # oxlint/oxfmt/vitest/tsconfig/markdownlint configs
```

Generated and local-only folders must not be committed: `packages/*/dist`, `packages/*/coverage`,
`coverage/`, `docs/src/.vuepress/dist`, `docs/src/.vuepress/.cache`, `docs/src/.vuepress/.temp` and
`temp/`.

## Toolchain

- **Bundler**: tsdown, with a shared helper in `scripts/tsdown.ts`.
- **Lint/format**: oxlint and oxfmt (configs in `oxlint.config.ts` and `oxfmt.config.ts`, based on
  `oxc-config-hope`); Markdown is linted by markdownlint-cli2 (`.markdownlint-cli2.mjs`).
- **Tests**: vitest (`vitest.config.ts`), istanbul coverage with four 100% thresholds. Benchmarks use
  `*.bench.ts` files plus the harness in `scripts/bench.ts` / `scripts/prepareBench.ts`, which builds
  the current tree and an `origin/main` baseline worktree before running.
- **TypeScript**: extends `@mr-hope/tsconfig/web.json`; `isolatedDeclarations` is enabled.

## Common Commands

Run from the repository root. The scripts below are defined in the root `package.json`, which is the
source of truth.

| Command                          | Description                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| `pnpm run build`                 | Build all packages (production mode)                           |
| `pnpm run clean`                 | Remove build outputs of all packages                           |
| `pnpm run test`                  | Run unit tests                                                 |
| `pnpm run test:coverage`         | Run unit tests with coverage; fails below the 100% thresholds  |
| `pnpm run test:bench`            | Prepare the benchmark baseline and run vitest benchmarks       |
| `pnpm run bench:prepare`         | Build the current tree and the `origin/main` baseline worktree |
| `pnpm run bench:clean`           | Remove the benchmark baseline worktree                         |
| `pnpm run lint`                  | Run oxlint + oxfmt with auto-fix                               |
| `pnpm run lint:check`            | Run oxlint + oxfmt without writing changes                     |
| `pnpm run lint:md`               | Lint all Markdown files                                        |
| `pnpm run type-check`            | Type check the whole repository                                |
| `pnpm run bundle:analyze`        | Generate and upload per-package bundle analysis to Codecov     |
| `pnpm run docs:dev`              | Start the docs dev server                                      |
| `pnpm run docs:build`            | Build the documentation site                                   |
| `pnpm run packages:bootstrap`    | Generate files for new plugin packages (see Package Structure) |
| `pnpm run packages:check-readme` | Verify package READMEs match the generated output              |
| `pnpm run packages:sync-readme`  | Regenerate package READMEs                                     |
| `pnpm run packages:check-update` | Check dependency updates                                       |
| `pnpm run packages:update`       | Update workspace dependencies                                  |

There is no root `release` script. Releases run through the publish workflow — see
[Release Workflow](#release-workflow).

## CI/CD Workflows

All workflows live in `.github/workflows/` and use `pnpm/setup` with `require-lockfile: true`. The
unit tests run on Node.js 22, 24 and 26; the other workflows each set up a single Node.js runtime in
their `runtime:` input.

| Workflow          | Triggers                                | What it runs                                                                                                                           |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `unit-test.yml`   | push, pull request                      | Build, then `test:coverage` with `TEST_REPORT=true` on the Node.js 22/24/26 matrix; uploads JUnit and coverage from the Node.js 24 job |
| `linter-test.yml` | push, pull request                      | `packages:check-readme`, build, `type-check`, `bundle:analyze`, `lint:check`, `lint:md`                                                |
| `codeql.yml`      | push/PR to `main`, weekly (Wednesday)   | CodeQL analysis for JavaScript                                                                                                         |
| `docs.yml`        | push, pull request                      | Build, then `docs:build`; deploys the docs from `main` to the documentation repository                                                 |
| `publish.yml`     | manual `workflow_dispatch`, `main` only | Release checks, `lerna version`, `lerna publish`, npm mirror sync (see Release Workflow)                                               |

## Package Structure

A typical plugin package:

```
packages/<plugin-name>/
├── src/
│   ├── index.ts        # Public entry point (re-exports only)
│   ├── plugin.ts       # Plugin implementation
│   ├── options.ts      # Option types with JSDoc (when the plugin takes options)
│   └── *.ts            # Rules, utils, renderers, types, nested modules...
├── __tests__/
│   ├── *.spec.ts       # vitest tests (may be split into subdirectories)
│   ├── *.bench.ts      # Optional benchmarks
│   └── __snapshots__/  # Optional snapshots; __fixtures__/ for fixtures
├── tsdown.config.ts    # Build config (see Build Configuration)
├── package.json
├── README.md           # Generated by `pnpm run packages:sync-readme`
├── CHANGELOG.md
├── LICENSE             # Root license, copied by `packages:bootstrap`
└── dist/               # Build output (ignored)
```

Variations from the template:

- `@mdit/helper` is ESM-only and has no `plugin.ts` / `options.ts` / UMD build.
- Plugins without options omit `options.ts`; multi-variant packages may omit `plugin.ts` (e.g.
  `plugin-emoji` uses `bare.ts`/`light.ts`/`full.ts`) or implement in `plugins.ts` (e.g.
  `plugin-alert`).
- Packages that ship CSS (`plugin-alert`, `plugin-spoiler`, `plugin-tab`) list the CSS file in
  `files`, expose it through a `./style` export, and declare it in `sideEffects`.
- Node-only packages (`plugin-include`, `plugin-snippet`) build a single ESM entry.
- Packages with extra entries add files and package subpath exports where public: `plugin-katex`
  exposes `./mhchem`, `plugin-mathjax` exposes `./async` and builds an internal `worker` entry, and
  `plugin-tab` exposes `./tab` and `./register-tab`.

`pnpm run packages:bootstrap` generates `package.json`, `LICENSE`, `tsdown.config.ts` and
`README.md` for a new `packages/<name>/src/index.ts` that has no `package.json` yet. Existing
manifests are maintained by hand.

## Plugin Registration Patterns

### Plugin Signatures

Use the plugin types re-exported by `@mdit/helper`:

```ts
import type { PluginSimple, PluginWithOptions } from "@mdit/helper";
```

- **`PluginSimple`** — for plugins without options:

  ```ts
  export const pluginName: PluginSimple = (md) => { ... };
  ```

  Examples: `abbr`, `align`, `dl`, `footnote`, `img-lazyload`, `img-size`, `ins`, `mark`, `ruby`,
  `sub`, `sup`.

- **`PluginWithOptions<PluginOptions>`** — for plugins with options:

  ```ts
  export const pluginName: PluginWithOptions<PluginOptions> = (md, options) => { ... };
  ```

  Examples: `advanced-links`, `alert`, `anchor`, `attrs`, `container`, `demo`, `embed`, `field`,
  `figure`, `icon`, `img-mark`, `include`, `inline-rule`, `katex`, `layout`, `mathjax`, `plantuml`,
  `snippet`, `spoiler`, `stylize`, `tab`, `tasklist`, `tex`, `uml`.

**Naming**: Export the camelCase short package name (`advancedLinks`, `imgSize`, `inlineRule`,
`tasklist`). Multi-variant packages export one const per variant (e.g. `bareEmoji`, `legacyImgSize`).
Notable exceptions: both katex packages export `katex`, and the mathjax packages export
`installSyncMathjax` with a `mathjax` alias.

Plugins must tolerate being installed twice: guard rule registration (e.g. with `hasRule` from
`@mdit/helper`) instead of pushing duplicate rules.

### `index.ts` Export Patterns

| Pattern                                                               | Use case                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------- |
| `export type * from "./options.js";` + `export * from "./plugin.js";` | Plugin with options, single plugin                             |
| `export * from "./plugin.js";`                                        | Plugin without options                                         |
| `export type * from "./options.js";` + variant files                  | Multi-variant plugin (e.g. `plugin-emoji`, `plugin-img-size`)  |
| `export * from "./plugin.js";` + `export type * from "./types.js";`   | Plugin that also exposes public types (e.g. `plugin-footnote`) |
| Selected named exports (`export { layout } from "./plugin.js";`)      | Only part of the implementation module is public               |
| Extra public helpers                                                  | Parsers, renderers, permalink presets, `getMathjax`, etc.      |

Every package also exports `"./package.json"` in `package.json` → `exports`. Never use a default
export. Some packages re-export utilities from `@mdit/helper` (e.g. `defaultSensitiveFiles` in
`plugin-include` / `plugin-snippet`).

### Multi-Variant Packages

- `plugin-emoji` → `bareEmoji`, `lightEmoji`, `fullEmoji` (in `bare.ts`, `light.ts`, `full.ts`)
- `plugin-img-size` → `imgSize`, `legacyImgSize`, `obsidianImgSize` (in `plugin.ts`, `legacy.ts`,
  `obsidian.ts`)

Other public helpers are not plugin variants: `plugin-anchor` exports the `anchor` plugin plus
permalink presets and helpers (`legacySlugify`, `renderHref`, `renderAttrs`, ...), and
`plugin-include` exports `resolveInclude` / `handleInclude` next to the `include` plugin.

## Code Rules

- Must be written in TypeScript.
- Use `src/index.ts` as the entry file to export the plugin.
- Use `src/plugin.ts` for plugin implementation.
- Use `src/options.ts` for option definitions (when the plugin has options).
- For plugins without options: omit `options.ts`; use `src/types.ts` if custom type definitions are
  needed.
- Forked files must include an attribution comment at the top.
- Spread nested modules into `src/` subdirectories when needed, e.g. `src/permalink/`, `src/rules/`,
  `src/deflate/`.

Logic that is not directly related to the plugin implementation should be extracted to other files in
the `src` directory, e.g.:

- Rules: `src/rules.ts`
- Utils: `src/utils.ts`
- Rendering helpers: `src/render.ts`
- Shared types: `src/types.ts`
- Security checks: `src/security.ts`

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

Commonly suppressed rules: `typescript/no-non-null-assertion`,
`typescript/strict-boolean-expressions`, `no-console`, `typescript/no-explicit-any`,
`no-param-reassign`, `new-cap`, `max-lines-per-function`.

## Package.json Standards

New packages are generated by `pnpm run packages:bootstrap`; existing manifests follow the same
shape and are edited by hand.

- `"name"`: `@mdit/plugin-<short-name>` or `@mdit/helper`.
- `"version"`: managed by Lerna (independent versions); a bootstrapped package starts at `0.0.0`.
- Metadata: `description` (`"<short-name> plugin for MarkdownIt"` for plugins), `keywords`, `homepage`,
  `bugs`, `repository` (with `directory`), `license: "MIT"`, `author`.
- `"type": "module"` and `"sideEffects": false`; style packages use an array such as
  `["./alert.css"]` instead of `false`.
- `"files": ["dist"]`; style packages also list their CSS file.
- **No top-level `main` / `types` fields** — resolution goes through `"exports"` only. Every manifest
  exports `"."` (with `types` and `default`) and `"./package.json"`; multi-entry packages add
  subpaths (`./mhchem`, `./async`, `./tab`, `./register-tab`, `./style`).
- CDN entries: `"unpkg": "./dist/cdn.umd.js"` and `"jsdelivr": "./dist/cdn.umd.js"` — only for
  packages with a UMD build. `@mdit/helper`, Node-only packages, `plugin-katex-slim` and the mathjax
  packages have no CDN fields.
- `"publishConfig": { "access": "public" }`.
- `"scripts": { "build": "tsdown", "clean": "rimraf ./dist" }`.
- `"dependencies"`: workspace packages as `"workspace:^"` / `"workspace:*"`, shared external versions
  from the pnpm `catalog:` (e.g. `markdown-it`, `katex`, `@mathjax/src`, `upath`). Do not add
  `@types/markdown-it` — markdown-it 15 ships its own types.
- `"peerDependencies"`: `"markdown-it": "catalog:"` with
  `"peerDependenciesMeta": { "markdown-it": { "optional": true } }`. Optional integrations (e.g.
  MathJax packages/fonts) follow the same `catalog:` + optional pattern.
- `"engines": { "node": ">=22" }`.

## Build Configuration

All packages use the shared `tsdownConfig` helper from `scripts/tsdown.ts`. The default plugin shape is
two builds: ESM and UMD/CDN.

```ts
import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"), // ESM build → dist/index.js
  tsdownConfig("index", {
    // UMD/CDN build → dist/cdn.umd.js
    globalName: "mdItPluginXxx",
    globals: { "markdown-it": "markdownit" },
  }),
];

export default config;
```

- `globalName` is `mdItPlugin` + the PascalCase short name (e.g. `mdItPluginAttrs`). It is also the
  UMD global.
- The root `build` script sets `NODE_ENV=production`, which enables minification and publint; ESM
  builds always emit declaration files. Source maps are always emitted, and ESM code targets `node22`
  unless browser-targeted.
- ESM-only packages use a single `const config: UserConfig = tsdownConfig("index")` (e.g.
  `@mdit/helper`). Node-only packages also pass `{ platform: "node" }` and build one entry.
- Extra entries are additional `tsdownConfig("<entry>")` calls (e.g. `async/index`, `worker`,
  `mhchem`, `tab`); entries exposed to consumers also get package subpath exports.
- `tsdownConfig` also accepts `platform`, `alias`, `alwaysBundle`, `onlyBundle`, `neverBundle`,
  `copy`, `treeshake` and other tsdown options. See `plugin-plantuml` (node/browser builds with a
  `@deflate` alias and bundled `pako`), `plugin-katex` (extra `mhchem` entry and a `katex` UMD
  global), and `plugin-tab` (extra entries, one overridden with `format: "umd"`).

## @mdit/helper

`packages/helper/` provides shared utilities used across plugins (import from `@mdit/helper`):

- `dedent` — template literal dedent
- `escape` — `escapeHtml`, `escapeRegExp`
- `markdown` — `scanFence`
- `reg` — `NEWLINE_RE`, `UNESCAPE_RE`
- `rules` — `hasRule`, `RuleScope`
- `sensitive-files` — `defaultSensitiveFiles`, `isSensitiveFile`
- `types` — `PluginSimple`, `PluginWithOptions`, `BlockRule`, `CoreRule`, `InlineRule`, `Nesting`,
  `TokenMeta`

## Commit Conventions

- **Format**: `type(scope): subject` or `type!: subject` (breaking change). The scope is optional —
  omit it when the change is not tied to one package. A `revert:` prefix is also accepted.
- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `workflow`, `build`,
  `ci`, `chore`, `types`, `release`.
- **Allowed scopes**: the public package directory names under `packages/` (e.g. `plugin-attrs`,
  `helper`) plus `deps`. Private packages such as `docs` are not valid scopes.
- **Subject**: at most 50 characters after `": "`, with an ASCII colon and exactly one space.
- **Validation**: the `commit-msg` hook runs `scripts/verifyCommit.ts`, which validates the message
  with `@mr-hope/verify-commit-message`. The `commitlint` field in `package.json` is not wired to the
  hook.

### Pre-commit Hooks

Husky + nano-staged:

- `**/*` → `oxfmt --no-error-on-unmatched-pattern`
- `*.{js,ts}` → `oxlint --fix`
- `*.md` → `markdownlint-cli2 --fix`

The `commit-msg` hook runs `scripts/verifyCommit.ts`.

## Test Rules

- Test files live in the package `__tests__` directory (`packages/<pkg>/__tests__/`,
  `scripts/__tests__/`), with nested folders mirroring `src/` when needed. `__tests__` may also hold
  shared test helpers, `__fixtures__/` and `__snapshots__/`; do not put spec files elsewhere.
- Use `vitest` for testing.
- Import the package under test from source with the `.js` extension:
  `import { pluginName } from "../src/index.js";` (subpaths such as `../src/plugin.js` are fine).
  Never import the package under test by its package name in specs.
- Import other workspace packages by their package name (e.g. `@mdit/plugin-attrs`); these resolve
  through the built `dist`, so run `pnpm run build` once after cloning and after changing another
  package's public entry point. CI builds before tests.
- Typical setup: create one instance per suite with `new`, e.g.
  `const md = new MarkdownIt({ linkify: true }).use(pluginName);` (drop `linkify` when irrelevant).
- Group tests with `describe`: `describe(pluginName, ...)` with nested `describe("case", ...)`, and
  prefer `it()` over `test()`.
- Coverage must stay at 100% for statements, branches, functions and lines. Coverage only counts
  `packages/*/src/**/*.ts`; `scripts/` tests are not part of the coverage threshold.
- Keep spec files readable: a single suite is usually `<pluginName>.spec.ts`; when a suite grows past
  ~500 lines, split it by feature (`tab-parse.spec.ts`, `permalink-*.spec.ts`,
  `renderer-idempotent.spec.ts`). `basic.spec.ts` / `nesting.spec.ts` / `options.spec.ts` are fine
  names when the split follows syntax/options.
- Use `*.bench.ts` files for benchmarks; they load the built `dist` entries, and
  `pnpm run test:bench` prepares the baseline worktree first. Use `__fixtures__` / `__snapshots__`
  for fixtures and snapshots.

### Vitest Configuration

- **Coverage provider**: `istanbul`, including `packages/*/src/**/*.ts`, with 100% thresholds for
  statements, branches, functions and lines; `test:coverage` fails when any threshold drops.
- **Environment**: Node.js by default (the root config sets no `environment`). DOM-dependent test
  files opt in with `// @vitest-environment happy-dom` at the top (see the `plugin-tab` and
  `plugin-tasklist` tests).
- **Benchmarks**: `*.bench.ts` files via `benchmark.include`; run with `pnpm run test:bench`, which
  first runs `bench:prepare` (builds the current tree and an `origin/main` baseline worktree under
  `temp/bench-baseline`). Bench files load the built `dist` entries through `scripts/bench.ts`.
- **CI reports**: `TEST_REPORT=true` switches coverage reporters to `["cobertura", "text"]` (no HTML
  report) and adds the `junit` reporter writing `coverage/test-report.junit.xml`.
- **Discovery**: the root config excludes `**/node_modules/**`, `**/dist/**` and `temp/**` for both
  tests and benchmarks.
- **Aliases**: the root config aliases `@deflate` to the Node.js plantuml implementation; each
  package build aliases it per platform.

## Release Workflow

Publishing is done exclusively by `.github/workflows/publish.yml`, triggered manually
(`workflow_dispatch`) from `main`. The job runs in the protected `release` environment and only the
repository maintainer may start it. Available inputs:

- `dryrun` — run `lerna version` and `lerna publish` with `--dry-run` and skip the mirror sync.
- `prerelease` / `graduate` — pass `--conventional-prerelease` / `--conventional-graduate` to
  `lerna version`.
- `publish_only` — skip `lerna version` and retry publishing only.

The workflow performs: build → type check → lint check → test coverage → `lerna version` (unless
`publish_only`) → `lerna publish from-package --force-publish --yes` → npmmirror sync.

Configuration lives in `lerna.json` (`@lerna-lite/cli`):

- `"version": "independent"` — each package has its own version.
- `"command.version"`: `allowBranch: "main"`, `conventionalCommits: true`, `createRelease: "github"`,
  `exact: true`, `skipBumpOnlyReleases: true`, message `release: publish`.
- `"command.publish"`: `graphType: "all"`, `removePackageFields: ["devDependencies", "scripts"]`.
- `changelogPreset`: `conventionalcommits` with the repo's section mapping.
- `ignoreChanges`: `**/__tests__/**`, `**/*.md`.
- The npm mirror sync step runs `pnpm exec unrun scripts/sync.ts` (npmmirror).

## Scripts Reference

| Script                    | Purpose                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `scripts/bootstrap.ts`    | Generate `package.json`, `LICENSE`, `tsdown.config.ts` and README for new packages              |
| `scripts/syncReadme.ts`   | Regenerate package READMEs (`packages:sync-readme`) or verify them (`packages:check-readme`)    |
| `scripts/sync.ts`         | Sync published packages to npmmirror (called by the publish workflow)                           |
| `scripts/analyze.ts`      | Upload per-package bundle analysis to Codecov (`bundle:analyze`)                                |
| `scripts/tsdown.ts`       | Shared tsdown config factory used by every package                                              |
| `scripts/verifyCommit.ts` | Validate the commit message in the `commit-msg` hook                                            |
| `scripts/bench.ts`        | Benchmark harness that loads the built package entries for `*.bench.ts` files                   |
| `scripts/prepareBench.ts` | Build the current tree and the `origin/main` baseline worktree for benchmarks (`bench:prepare`) |
| `scripts/__tests__/`      | vitest tests for the scripts above                                                              |

## TypeScript Configuration

- Extends `@mr-hope/tsconfig/web.json` (web/browser-targeted shared config).
- `isolatedDeclarations` is enabled.
- Includes `**/*.ts` and `**/.vuepress/**/*.ts`.
- Excludes `**/snippets/example.ts`, `**/__fixtures__/**` and `**/dist/**`.

## Performance Lint Overrides

For `packages/*/src/**`, certain oxlint rules are disabled due to performance considerations:

- `prefer-destructuring`, `prefer-object-spread`, `prefer-spread` — create intermediate objects
- `typescript/prefer-for-of` — slower than indexed loops in some cases
- `unicorn/prefer-array-flat`, `unicorn/prefer-spread` — create intermediate arrays
- `unicorn/prefer-code-point` — `charCodeAt` is used intentionally for performance

## Performance

- Perform quick checks and return early if possible to avoid unnecessary computations, especially in
  performance-critical paths. Check the cost of silent mode checking (`if (silent) return true;`).
- Usage of RegExp should be avoided, especially in performance-critical paths. Prefer using a pos
  pointer to access characters in string with logic instead. Unless it is clear that using RegExp is
  more efficient and does not cause performance issues.
- Operating strings with `slice`, `substring` and similar methods that create new strings shall be
  avoided if possible.
- Prefer using `charCodeAt` for character access and comparison instead of `charAt`.

  To improve readability, use the format `str.charCodeAt(index) === number /* char */` for character
  comparisons.

  E.g.: `str.charCodeAt(index) === 36 /* $ */`

- Constants must be defined at the top of the file to avoid local creation overhead.
- If a static variable is used multiple times, it should be extracted to a constant unless it is hard
  to deal with types or it breaks readability badly.

## JSDoc Rules

### Scope

- **Required for**: every option property in `src/options.ts`, and every exported helper that is part
  of the public API (parsers, renderers, permalink presets, utility functions). Plugin constants
  (`export const xxxPlugin`) may omit JSDoc unless their behavior is non-obvious.

### Format Requirements

- **Bilingual**: write the English description first, a blank `*` line, then the Chinese paragraph.
  This is required for every option in `src/options.ts` and for the exported helpers above.
- **Order**: description → `@example` → `@default` → `@param` → `@returns`.
- **@example**: use for exported functions/constants and for options whose value shape is not
  obvious; indent the example two spaces under the tag and use a fenced `ts` block when needed.
- **@default**: document every default defined in `src/options.ts`, including `@default false` and
  `@default ""`. No `@default` is needed when the default comes from a runtime fallback
  (`renderer ?? defaultRenderer`) or from an upstream package.
- **@param**: one tag per parameter on a single line, e.g.
  `@param src - Source string / 源字符串` (English, dash, Chinese after a slash). Older files may
  still repeat the tag once per language; fix them when you touch the file.
- **@returns**: one bilingual line for every non-`void` / non-`Promise<void>` return value, e.g.
  `@returns The escaped HTML content / 转义后的 HTML 内容`. Do not repeat the tag per language.

```ts
/**
 * English description
 *
 * 中文描述
 *
 * @default defaultValue
 * @param paramName - English description / 中文描述
 * @returns English description / 中文描述
 */
```

## Documentation Rules

### Documentation Site

- VuePress 2 site: config `docs/src/.vuepress/config.ts`, theme `docs/src/.vuepress/theme.ts`. Build
  with `pnpm run docs:build`, preview with `pnpm run docs:dev`.
- Locales: English pages at `docs/src/<plugin>.md` (locale `/`), Chinese pages at
  `docs/src/zh/<plugin>.md` (locale `/zh/`). One page per plugin, named after the package without
  the `plugin-` prefix.
- Frontmatter on every page: `title: "@mdit/plugin-<name>"`, `shortTitle: "plugin-<name>"` and an
  `icon`.
- The sidebar is generated from the folder structure (`sidebar: "structure"`), so page order follows
  file names.
- Shared fragments use the `*.snippet.md` suffix (e.g. `docs/src/render-rule.snippet.md`) and are
  excluded from pages by `pagePatterns`. Include them with `<!-- @include: ./x.snippet.md -->` from
  English pages and `../` from Chinese pages.
- Custom containers used by the docs theme: `::: tip`, `::: warning`, `::: fields`, `::: preview`,
  plus tabs and code tabs.

### Plugin Documentation

- Pages must be consistent with code behavior.
- English and Chinese pages mirror each other: same file name, same `##` sections in the same order,
  same number of options; no section may exist in only one language.
- Use consistent Chinese section headings: `## Usage` → `## 使用`, `## Syntax` → `## 语法`,
  `## Options` → `## 选项`, `## Demo` → `## 示例`. Many older pages still use `## 格式` (and a few
  use 配置选项/演示); normalize them when you edit those pages and never introduce another variant.
- Make content concise and clear, remove unnecessary words, avoid redundancy, prefer shorter if
  possible.
- Use "你" instead of "您" in Chinese.
- Typical page: frontmatter, intro, `<!-- more -->`, then Usage / Syntax / Options / Demo. Extra
  section pairs (e.g. Permalinks) are allowed when both languages match.

### Options Documentation Format

Options are rendered with the `::: fields` container (`markdown.fields` in the docs theme), not with
Markdown lists. Each option is one field item, in the same order as the interface in
`src/options.ts`:

````md
::: fields
@`optionName` type=boolean default=`false`

Whether to enable the feature.

@`requiredOption` type=string required

The required configuration.

@`complexOption` type=EmbedConfig[]

```ts
interface EmbedConfig {
  name: string;
}
```

Details for the complex option.
:::
````

- Start each item with `@` followed by the option name as inline code, then the attributes:
  `type=...`, then either `required` (required options only) or `default=...`.
- Use bare values for simple types (`string`, `boolean`, `number`, `string[]`); wrap compound types
  that contain spaces or `|` in backticks.
- `required` is a bare flag for required options only; never write "Required: No".
- Include `default=` whenever `src/options.ts` defines a default, including `false` and empty-string
  defaults; omit it when there is no default. For plugin options, `required` and `default` never
  appear on the same item.
- The description follows the item after one blank line, without a `Details:` label. It may use
  paragraphs, lists, fenced `ts` code blocks and `<!-- @include: ... -->`.
- Use `:::: fields` when the options block contains a nested container such as `::: tip`.

### Complex Option Types

Document markdown-it types (`RendererRule`, `Token`, `Options`, ...) and multi-line interfaces inline,
directly under the option that uses them:

```md
@`openRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Opening tag render function.
```

- Keep reusable type declarations in a snippet (`docs/src/render-rule.snippet.md`) and include them
  from both locales (`./` from English pages, `../` from Chinese pages).
- For plugin-specific shapes, follow the `@` line with a fenced `ts` block and then the description.
- Do not add a separate "Type Definitions" section: types are documented next to the option using
  them.

## Bug Fix Workflow

When fixing a bug, every fix MUST follow this strict 8-step workflow:

1. **Add a test**: Add a minimal, reasonable unit test that exposes the bug.
2. **Verify it fails**: Run the unit test and confirm it fails (bug reproduced).
3. **Fix the source**: Modify the source code to fix the bug.
4. **Verify the fix**: Run the unit test and confirm it passes.
5. **Coverage**: Confirm the modified code still has 100% coverage by running
   `pnpm run test:coverage` in the repo root (same command as CI; the four 100% thresholds fail the
   run if coverage drops). If not, adjust or add tests until it passes.
6. **Subagent review**: Send the concrete bug details to a subagent to review your changes. The
   subagent may ONLY review — it must NOT modify any files. Provide only the bug details, NOT your
   implementation approach, so the subagent independently evaluates whether your fix is correct.
7. **Iterate**: Read the subagent's feedback. If it raises new issues, return to step 1 (add a test
   exposing the new issue → ...) and repeat until the subagent reports no issues and considers the
   fix fully OK.
8. **Commit & push**: Create a branch with an appropriate name (e.g. `fix/plugin-<name>-<desc>`),
   commit with a message conforming to the rules above, and push to origin.

### Commit Iron Rules

- **Linter must pass**: `pnpm run lint:check` (oxlint + oxfmt) and `pnpm run lint:md` report no
  errors.
- **Types must pass**: `pnpm run type-check` reports no errors.
- **Coverage must be 100%**: `pnpm run test:coverage` in the repo root reports 100%
  statements/branches/functions/lines.
- **READMEs must match**: run `pnpm run packages:check-readme` when changing package metadata or
  README-related scripts.
- **Never commit if not passing**: If any of the above fails, do not commit — fix until it passes.
- **Never push directly to `main`**: Work must never be pushed directly to the `main` branch, unless
  the user explicitly asks to do so. Always work on and push feature branches.

## Keeping This File Accurate

This file drifted from the repository before. To prevent that:

- **Sources of truth**: root scripts → `package.json`; CI → `.github/workflows/`; release → `lerna.json`
  and the publish workflow; package layout and manifests → `scripts/bootstrap.ts` and existing
  packages; build settings → `scripts/tsdown.ts`; lint/test config → the root config files; docs
  conventions → `docs/src/` pages and the docs config.
- **Prefer pointing at files over copying them**: do not restate volatile lists (dependency versions,
  exact script bodies, every workflow step). When a section becomes a copy of a file, replace it with
  a reference plus the rule that readers cannot infer.
- **Update in the same change**: when you touch a script, workflow, template or config covered here,
  update the corresponding section (or delete the stale claim).
- **Check before committing**: `pnpm run lint:md` and `pnpm exec oxfmt --check AGENTS.md` must pass,
  and the facts above must match the current tree.
