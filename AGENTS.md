# MarkdownIt Plugins Coding Standards

## Project Overview

- **Project Type**: TypeScript Monorepo
- **Node.js Version**: >= 22
- **Package Manager**: pnpm (version 11, enforced by devEngines)
- **Plugin Count**: 40+ MarkdownIt plugins
- **Target Environments**: Node.js and Browser

## Project Structure

```
mdit-plugins/
├── docs/       # VuePress documentation site
├── packages/   # 40+ plugin packages
└── ...
```

## Build Tools

- **tsdown** - bundler (shared config in `scripts/tsdown.ts`)
- **oxlint** / **oxfmt** - Linting and formatting
- **vitest** - Testing framework (coverage via istanbul, env: happy-dom)
- **TypeScript** - via `@mr-hope/tsconfig/web.json`

## Common Commands

| Command                       | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `pnpm run build`              | Build all packages                                      |
| `pnpm run clean`              | Clean build outputs of all packages                     |
| `pnpm run test`               | Run unit tests                                          |
| `pnpm run test:coverage`      | Run tests with coverage report                          |
| `pnpm run test:bench`         | Run vitest benchmarks                                   |
| `pnpm run lint`               | Run oxlint + oxfmt with auto-fix                        |
| `pnpm run lint:check`         | Run oxlint + oxfmt without auto-fix                     |
| `pnpm run lint:md`            | Lint markdown files                                     |
| `pnpm run type-check`         | Type check all packages                                 |
| `pnpm run bundle:analyze`     | Upload bundle analysis to Codecov                       |
| `pnpm run docs:dev`           | Start docs dev server                                   |
| `pnpm run docs:build`         | Build documentation                                     |
| `pnpm run release`            | Full release (clean → build → version → publish → sync) |
| `pnpm run packages:bootstrap` | Bootstrap a new plugin package                          |
| `pnpm run packages:update`    | Update all dependencies                                 |

## CI/CD Workflows

| Workflow          | Triggers         | Description                                                |
| ----------------- | ---------------- | ---------------------------------------------------------- |
| `unit-test.yml`   | PR to main, push | Tests + coverage on Node.js 22, 24, 26; uploads to Codecov |
| `linter-test.yml` | PR to main, push | Type check, bundle analysis, oxlint, markdown lint         |
| `codeql.yml`      | Weekly (Wed)     | CodeQL security analysis for JavaScript                    |
| `docs.yml`        | PR to main, push | Build and deploy docs to GitHub Pages                      |
| `publish.yml`     | Push to main     | Build and publish packages via Lerna                       |

All workflows use `pnpm/action-setup@v6` and `pnpm ci`.

## Package Structure

Each plugin follows this structure:

```
packages/<plugin-name>/
├── src/
│   ├── index.ts        # Main entry point
│   ├── plugin.ts       # Plugin implementation
│   ├── options.ts      # Options definition
│   └── *.ts            # Other utilities
├── __tests__/
│   └── *.spec.ts       # Test files
├── dist/               # Build output
├── package.json
├── tsdown.config.ts    # Build config
├── CHANGELOG.md
├── LICENSE.md
└── README.md
```

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

  Examples: `attrs`, `container`, `figure`, `alert`, `emoji`, `embed`

**Naming**: The exported `const` name must match the plugin name.

### index.ts Export Patterns

| Pattern                                                               | Use case                                         |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| `export type * from "./options.js";` + `export * from "./plugin.js";` | Plugin with options, single variant              |
| `export * from "./plugin.js";`                                        | Plugin without options                           |
| `export * from "./plugin.js";` + `export type * from "./types.js";`   | Plugin without options, but exposes custom types |
| Multiple named exports from separate files                            | Plugin with multiple variants (see below)        |

### Multi-Variant Plugins

Some packages export multiple named plugin variants from a single package:

- `plugin-emoji` → `bareEmoji`, `lightEmoji`, `fullEmoji` (in `bare.ts`, `light.ts`, `full.ts`)
- `plugin-img-size` → `imgSize`, `legacyImgSize`, `obsidianImgSize`
- `plugin-anchor` → `anchor`, `legacyAnchor`
- `plugin-include` → `include`, `resolveInclude`

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

Each plugin's `package.json` follows a fixed structure (auto-generated by `scripts/bootstrap.ts`):

- `"type": "module"` — all packages are ESM
- `"sideEffects": false` — tree-shakable
- `"files": ["dist"]` — only publish the dist folder
- `"main"`: `"lib/index.js"`, `"types"`: `"lib/index.d.ts"`
- `"exports"`: maps `"."` to `./lib/index.js` with types
- `"unpkg"` / `"jsdelivr"`: `"./dist/cdn.umd.js"` — CDN entry
- `"dependencies"`: `{ "@types/markdown-it": "^14.1.1" }` (typed plugins only)
- `"peerDependencies"`: `{ "markdown-it": "^14.2.0" }` with `"optional": true`
- `"publishConfig"`: `{ "access": "public" }` — always public
- `"scripts.build"`: `"tsdown --config-loader unrun"`
- `"scripts.clean"`: `"rimraf ./lib"`

## Build Configuration

All plugins use the shared `tsdownConfig` helper from `scripts/tsdown.ts`:

```ts
import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"), // ESM build
  tsdownConfig("index", {
    // UMD/CDN build
    globalName: "mditPluginXxx",
    globals: { "markdown-it": "markdownit" },
  }),
];

export default config;
```

- The first entry produces the ESM lib output
- The second entry produces the UMD/CDN bundle with `globalName` as the global variable name

## @mdit/helper

The `packages/helper/` package provides shared utilities used across all plugins:

- `dedent` — template literal dedent
- `escape` — HTML escape utilities
- `reg` — common regex patterns

Import from `@mdit/helper` when these utilities are needed.

## Commit Conventions

- **Format**: `type(scope): message` or `type!: message` (for breaking changes)
- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `workflow`, `build`, `ci`, `chore`, `types`, `release`
- **Allowed scopes**: any directory under `packages/` (e.g., `plugin-attrs`) + `deps`
- **Validation**: `commitlint` with `@commitlint/config-conventional` + custom `scripts/verifyCommit.ts`

### Pre-commit Hooks

Husky + nano-staged:

- `**/*` → `oxfmt --no-error-on-unmatched-pattern`
- `*.{js,ts}` → `oxlint --fix --type-check --type-aware --report-unused-disable-directives`
- `*.md` → `markdownlint-cli2 --fix`

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

- **Coverage provider**: `istanbul` (includes `packages/*/src/**/*.ts`)
- **Environment**: `happy-dom`
- **Benchmarks**: `**/*.bench.ts` files are supported
- **CI mode**: Set `TEST_REPORT=true` to generate JUnit XML + cobertura reports
- Root `vitest.config.ts` excludes `temp/` and `node_modules/` from test discovery

## Release Workflow

Publishing uses Lerna with independent versioning:

- `"version": "independent"` — each package has its own version
- `"allowBranch": "main"` — releases only from main branch
- `"conventionalCommits": true` — auto-generate changelogs from commits
- `"createRelease": "github"` — auto-create GitHub releases
- `"removePackageFields": ["devDependencies", "scripts"]` — stripped before publish

Release steps:

1. `pnpm run clean` — remove previous build outputs
2. `pnpm run build` — build all packages
3. `lerna version` — bump versions based on conventional commits
4. `lerna publish from-package --force-publish --yes` — publish to npm
5. `scripts/sync.ts` — sync packages to npmmirror.com

## Scripts Reference

| Script                    | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `scripts/bootstrap.ts`    | Auto-generate `package.json` and `README.md` for new plugins |
| `scripts/sync.ts`         | Sync all packages to npmmirror.com (Chinese npm mirror)      |
| `scripts/analyze.ts`      | Upload bundle analysis to Codecov                            |
| `scripts/tsdown.ts`       | Shared tsdown build config helper for all plugins            |
| `scripts/verifyCommit.ts` | Commit message validation hook                               |

## TypeScript Configuration

- Extends `@mr-hope/tsconfig/web.json` (web/browser-targeted shared config)
- Excludes: `**/snippets/example.ts`, `**/__fixtures__/**`

## Performance Lint Overrides

For `packages/*/src/**`, certain oxlint rules are disabled due to performance considerations:

- `prefer-destructuring`, `prefer-object-spread`, `prefer-spread` — create intermediate objects
- `typescript/prefer-for-of` — slower than indexed loops in some cases
- `unicorn/prefer-code-point` — `charCodeAt` is used intentionally for performance

## Committing in CI

When committing in CI, make sure to run tests and check coverage before pushing:

```bash
pnpm run lint
pnpm run test:coverage
```

Also, make sure you are using `HUSKY=0` to disable husky when committing in CI, otherwise the commit may fail due to lint errors or test failures.

### How to Run Tests

cd to the plugin directory and run:

```bash
cd packages/<name>
pnpm exec vitest run --coverage
```

Do NOT run `pnpm exec vitest run --coverage` in the root.

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
- **@default**: Always include if exists for all properties (including `@default false`)
- **@example**: Only for exported functions
- **@description**: Optional, only if necessary to explain more
- **@param**: Required for all parameters, should be bilingual, separate with `/` for English and Chinese
- **@returns**: Required for all return values except `void` and `Promise<void>`, should be bilingual, separate with `/` for English and Chinese

````ts
/**
 * English description
 *
 * 中文描述
 *
 * @description (optional) English detailed description
 *
 * 中文详细描述
 *
 * @param paramName - English description / 中文描述
 *
 * @default defaultValue
 * @example
 * ```ts
 * // Example code in TypeScript
 * ```
 */
````

## Documentation Rules

### Plugin Documentation

- Consistent with code behaviors
- Chinese/English content must be consistent in structure and content
- Make content concise and clear, remove unnecessary words, avoid redundancy, prefer shorter if possible
- Use "你" instead of "您" in Chinese

### Options Documentation Format

Each option in plugin documentation must include these sections **in this exact order**:

1. **Type**
   - English: `- Type: \`type\``
   - Chinese: `- 类型：\`type\``
   - Follow with code fence for complex types

2. **Required Status**
   - Only for required options: `- Required: Yes` / `- 必填：是`
   - **Never write "Required: No" for optional options**

3. **Default Value**
   - **INCLUDE Default when**: Default value is NOT the expected/obvious value
   - **OMIT Default when**: Default value is expected/obvious
     - `boolean` options with `false` default → **OMIT**
     - `string` options with `''` default → **OMIT**
     - `object` options with `undefined` default → **OMIT**
   - Format: `- Default: \`value\``/`- 默认值：\`value\``

4. **Details** (must be included)
   - English: `- Details: Brief description`
   - Chinese: `- 详情：简要描述`
   - Prefer same line for short contents and paragraph for long contents

**Example Format:**

```md
### optionName

- Type: `boolean`
- Details: Whether to enable this feature.

### requiredOption

- Type: `string`
- Required: Yes
- Details: The required configuration.

### optionWithNonStandardDefault

- Type: `number`
- Default: `100`
- Details: Custom timeout value.
```

### Type Definitions Section

For plugins using markdown-it internal types (RenderRule, Token, Options, etc.), add a type definitions section after "Usage" but before "Options":

```md
## Type Definitions

### RenderRule

- Type: `(tokens: Token[], index: number, options: Options, env: Env, self: Renderer) => string`
- Details: A render function used by markdown-it to render tokens. Returns the rendered HTML string.
```
