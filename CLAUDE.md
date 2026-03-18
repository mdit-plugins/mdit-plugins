# CLAUDE.md - mdit-plugins Project Guide

## Project Overview

mdit-plugins is a TypeScript Monorepo containing 39+ MarkdownIt plugins with 100% test coverage, supporting Node.js (>= 20.6.0) and browser environments.

- **Repository**: <https://github.com/mdit-plugins/mdit-plugins>
- **Documentation**: <https://mdit-plugins.github.io/> (English) | <https://mdit-plugins.github.io/zh/> (Chinese)
- **License**: MIT
- **Author**: Mr.Hope

## Tech Stack

- **Language**: TypeScript 5.9.3
- **Package Manager**: pnpm 10.32.1
- **Bundler**: tsdown 0.21.3
- **Testing**: vitest 4.0.18
- **Linting**: oxlint 1.55.0 / oxfmt 0.40.0
- **Monorepo**: lerna-lite 4.11.5
- **Documentation**: VuePress 2.x + vuepress-theme-hope

## Project Structure

```
mdit-plugins/
├── .github/
│   ├── workflows/              # CI/CD workflows
│   └── copilot-instructions.md # AI coding standards
├── docs/                       # VuePress documentation
├── packages/                   # 39 plugin packages
├── scripts/                    # Build and release scripts
├── vitest.config.ts            # Test configuration
├── pnpm-workspace.yaml        # pnpm workspace config
└── tsconfig.base.json         # TypeScript base config
```

## Key Commands

```bash
# Build
pnpm build                  # Build all packages

# Test
pnpm test                   # Run unit tests
pnpm test:coverage          # Run tests with coverage

# Code Quality
pnpm lint                   # Lint with auto-fix
pnpm lint:check            # Lint without auto-fix
pnpm type-check             # Type check all packages

# Documentation
pnpm docs:dev               # Start docs dev server
pnpm docs:build            # Build documentation

# Release
pnpm release               # Clean, build, version bump and publish
```

## Testing Individual Plugins

Run tests in a plugin directory:

```bash
cd packages/abbr
pnpm vitest run --coverage
```

This runs only the current plugin's tests. Do NOT run `pnpm vitest run --coverage` in the root directory.

## CI/CD Workflows

- **unit-test.yml**: Tests and coverage on Node.js 20, 22, 24
- **linter-test.yml**: Type check, bundle analysis, linting
- **docs.yml**: Build and deploy docs to GitHub Pages
- **publish.yml**: Build and publish to npm and npmmirror

## Package Structure

```
packages/<name>/
├── src/
│   ├── index.ts        # Main entry, exports plugin
│   ├── plugin.ts       # Plugin implementation
│   ├── options.ts      # Options definition
│   └── *.ts            # Other utilities
├── __tests__/
│   └── *.spec.ts       # Test files
├── dist/               # Build output
├── package.json
├── tsdown.config.ts    # Build config
└── README.md
```

## Coding Standards

For detailed coding standards, see [.github/copilot-instructions.md](.github/copilot-instructions.md).
