# MarkdownIt Plugins Coding Standards

## Project Overview

- **Project Type**: TypeScript Monorepo
- **Node.js Version**: >= 20.6.0
- **Package Manager**: pnpm (version 10.32.1)
- **Plugin Count**: 39+ MarkdownIt plugins
- **Target Environments**: Node.js and Browser

## Project Structure

```
mdit-plugins/
├── .github/
│   ├── workflows/             # CI/CD workflows
│   ├── copilot-instructions.md # AI coding standards
│   └── FUNDING.yml
├── docs/                       # VuePress documentation site
├── packages/                   # 39 plugin packages
│   ├── abbr/                   # Abbreviation
│   ├── alert/                  # GFM alerts
│   ├── align/                  # Content alignment
│   ├── attrs/                  # Custom attributes
│   ├── container/              # Block containers
│   ├── emoji/                  # Emoji support
│   └── ...                     # Other plugins
├── scripts/                    # Build and release scripts
├── package.json                # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
├── vitest.config.ts           # Vitest config
└── tsconfig.base.json         # TypeScript base config
```

## Build Tools

- **tsdown** (0.21.3) - TypeScript bundler
- **TypeScript** (5.9.3) - Type checking and compilation
- **oxlint** / **oxfmt** - Linting and formatting
- **vitest** (4.0.18) - Testing framework

## Common Commands

| Command                  | Description                            |
| ------------------------ | -------------------------------------- |
| `pnpm run build`         | Build all packages                     |
| `pnpm run test`          | Run unit tests                         |
| `pnpm run test:coverage` | Run tests with coverage report         |
| `pnpm run lint`          | Run linting with auto-fix              |
| `pnpm run lint:check`    | Run linting without auto-fix           |
| `pnpm run type-check`    | Type check all packages                |
| `pnpm run docs:dev`      | Start docs dev server                  |
| `pnpm run docs:build`    | Build documentation                    |
| `pnpm run release`       | Clean, build, version bump and publish |

## CI/CD Workflows

- **unit-test.yml**: Run tests and coverage on Node.js 20, 22, 24
- **linter-test.yml**: Type check, bundle analysis, linting
- **docs.yml**: Build and deploy docs to GitHub Pages
- **publish.yml**: Build and publish packages to npm and npmmirror

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
└── README.md
```

## Code Rules

- Must be written in TypeScript
- Use `src/index.ts` as the entry file to export the plugin
- Use `src/options.ts` for options definition
- Use `src/plugin.ts` for plugin implementation

Logic that is not directly related to the plugin implementation should be extracted to other files in `src` directory, e.g.:

- Rules: `src/rules.ts`
- Utils: `src/utils.ts`
- Default render: `src/defaultRender.ts`

## Test Rules

- Test files must be in `__tests__` directory
- Use `vitest` for testing
- Tests should be grouped by testing cases with `describe`
- Tests should target 100% branch coverage
- A test file should not have too many lines. If it exceeds 300-500 lines, consider splitting it into multiple files if possible:
  - `__tests__/basic.spec.ts` for basic syntax tests
  - `__tests__/nesting.spec.ts` for nesting related tests
  - `__tests__/options.spec.ts` for options related tests

## Committing in CI

When committing in CI, make sure to run tests and check coverage before pushing:

```bash
pnpm run lint
pnpm run test:coverage
```

Also, make sure you are using `HUSKY=0` to disable husky when committing in CI, otherwise the commit may fail due to lint errors or test failures.

### How to Run Tests

First, cd to the plugin directory (e.g., `cd packages/alert`), then run:

```bash
pnpm exec vitest run --coverage
```

This should only run tests in the current plugin and generate coverage report. Do NOT run `pnpm exec vitest run --coverage` in the root directory.

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
