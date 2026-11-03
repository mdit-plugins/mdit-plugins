# Reference comparison harness

Compares the packages in this repository against the upstream plugins they are based on, both for
correctness (rendered output) and performance (throughput and scaling).

The harness lives in `compare/` and its data is presented on the dedicated
[comparison page](https://mdit-plugins.github.io/compare.html) of the documentation site — the
plugin pages only link to it, so the comparison never overshadows the plugin documentation.

| File                    | Purpose                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `types.ts`              | Spec and result types, plus `defineComparison()`                                            |
| `loader.ts`             | Loads the current `dist` build and the installed reference package                          |
| `normalize.ts`          | Shared HTML normalization helpers                                                           |
| `bench.ts`              | Interleaved benchmark measurement and scaling exponent fitting                              |
| `run.ts`                | CLI that runs specs and writes `results/<plugin>.json`                                      |
| `size.ts`               | Entry import-cost measurement (gzip of the entry module graph), writes `results/sizes.json` |
| `render.ts`             | Builds the docs data and the generated README comparison sections                           |
| `syncDocs.ts`           | Generates the docs data and the per-plugin links                                            |
| `specs/<plugin>.ts`     | One comparison spec per package                                                             |
| `corpora/<plugin>/*.md` | Benchmark corpora, read verbatim by `run.ts`                                                |
| `results/<plugin>.json` | Committed comparison data                                                                   |
| `results/sizes.json`    | Committed package size data                                                                 |

## Commands

`compare/` is a private workspace package (`@mdit/compare`), so its commands run through the
workspace filter and its reference dependencies stay out of the root manifest. Run from the
repository root:

```bash
# Build the current tree first; both sides are measured as shipped code
pnpm run build

# Correctness comparison only (fast)
pnpm --filter=@mdit/compare run test

# Benchmarks only
pnpm --filter=@mdit/compare run bench

# Correctness + benchmarks
pnpm --filter=@mdit/compare run compare

# One package only
pnpm exec node --experimental-strip-types compare/run.ts plugin-attrs

# Skip writing results while iterating
pnpm exec node --experimental-strip-types compare/run.ts plugin-attrs --no-write

# Refresh correctness data only, keep the existing benchmark measurements
pnpm exec node --experimental-strip-types compare/run.ts plugin-attrs --correctness-only --merge

# Run our own package test suites against the reference implementations
pnpm --filter=@mdit/compare run tests

# Refresh import costs, then the generated reports
pnpm --filter=@mdit/compare run sizes
pnpm --filter=@mdit/compare run docs
pnpm run packages:sync-readme

# Verify the generated reports are up to date (also runs in CI)
pnpm --filter=@mdit/compare run check
```

## Spec contract

Every spec exports a `defineComparison({ ... })` result:

```ts
import { defineComparison } from "../types.ts";

export default defineComparison({
  plugin: "plugin-attrs", // package directory
  reference: "markdown-it-attrs", // installed reference package
  variants: [
    {
      id: "default",
      ourExport: "attrs", // export name in the current package
      referenceExport: "default", // export name in the reference package
      ourOptions: {}, // equivalent options on both sides
      referenceOptions: {},
      // Optional, for async APIs or token level comparisons
      createOurRenderer: (module) => (markdown) => render(markdown),
      createReferenceRenderer: (module) => (markdown) => render(markdown),
    },
  ],
  correctness: [{ name: "heading-id", markdown: "## Hello {#id}" }],
  bench: [
    {
      name: "normal/small",
      kind: "normal",
      size: "small",
      // Corpus paths are relative to `compare/`; the six cases per spec read
      // `corpora/<plugin>/{normal,heavy}-{small,medium,large}.md`
      file: "corpora/plugin-attrs/normal-small.md",
    },
  ],
  scaling: [
    {
      name: "inline-attrs",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"word {.cls} ".repeat(size)}\n`,
    },
  ],
  normalize: (html) => html, // optional, defaults to sorting attributes
  // Root causes of the expected differences, grouped by cause rather than by case
  issues: [
    {
      id: "source-map",
      category: "reference-error", // or "difference"
      note: { en: "The reference emits empty maps.", zh: "参考包输出空映射。" },
    },
  ],
  notes: [{ en: "Comparison notes go here.", zh: "对比说明写在这里。" }],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      category: "feature-gap", // "feature-gap" | "internal" | "packaging"
      why: {
        en: "This package provides idempotent installs; the reference has no equivalent protection.",
        zh: "本包提供幂等安装保护，参考包无对应能力。",
      },
    },
  ],
});
```

## Rules

1. **Equivalent options.** The comparison is only meaningful when both sides are configured to do
   the same job. Set `ourOptions` / `referenceOptions` accordingly and explain every non-obvious
   mapping in `notes`.
2. **Normalize deliberately.** `normalize` is applied to both sides. Only normalize differences
   that are not behavior differences (attribute order, wrapper markup that both sides emit by
   design, generated ids). Never normalize away a real output difference.
3. **Correctness compares HTML and tokens.** Besides the rendered HTML, the parsed token streams are
   compared for variants without a custom renderer (token metadata such as source maps is part of the
   public contract of a markdown-it plugin). Every difference must reference an issue id:
   `reference-error` when the reference output/tokens are objectively wrong (wrong `map`, broken
   `nesting`, lost or misplaced content, security issues), and `difference` when both sides are valid
   or the divergence is an intentional design decision. Issues are counted once per root cause, not
   per case. Use `compareTokens: false` on a variant only when the token stream is not comparable
   there.
4. **Document real differences.** A case that still differs must reference an issue explaining the
   root cause. Do not remove the case to make the numbers look better.
5. **Notes and case notes are bilingual.** Every note is `{ en, zh }`; the English page renders `en`
   and the Chinese page renders `zh`.
6. **Benchmarks are committed markdown files.** Every spec has six benchmark cases:
   `normal/{small,medium,large}` (sparse, realistic document) and `heavy/{small,medium,large}`
   (dense plugin syntax), stored under `corpora/<plugin>/` and referenced through `file`. Do not
   generate corpora inline in the spec: the files are committed and reviewed as markdown.
7. **Scaling cases target superlinear behavior.** Every spec has at least two scaling series, and
   each series measures at least four sizes. Series are built to expose the complexity of the
   reference implementation (for example many delimiters on one line, many unmatched openers,
   deeply nested blocks). The fitted exponent is reported: `~1` is linear, `~2` is quadratic.
   Research the upstream implementation and its issue tracker before choosing the series.
8. **Do not write results while iterating.** Use `--no-write`. The final result files are generated
   in one controlled, sequential run so that measurements from different packages are comparable.
   When only correctness changes, run `--correctness-only --merge` to refresh the correctness data
   without re-measuring benchmarks.

## Test suite comparison

`pnpm --filter=@mdit/compare run tests` runs the tests of every compared package (`packages/<plugin>/__tests__`)
against the reference implementation: a shim re-exports the reference package under our public
export names and the vitest run swaps the package entry, so the whole suite executes against the
reference. This is the most detailed correctness signal — our tests cover much more than the six
benchmark corpora and the curated correctness cases.

Some tests only assert internal implementation details that the reference does not provide (rule
registration guards, internal helper APIs, fork-only extensions). Those are listed in the spec's
`testSuiteSkips` with a bilingual reason, and they are **not counted** — neither passed nor failed.
Every other failing test is a behavior difference between the two packages.

`testSuiteExports` maps extra export aliases the tests import (e.g. `mathjax` as an alias of the
compared `installSyncMathjax` variant) to the corresponding reference export.

## Presentation

- `compare/render.ts` turns the committed results into `docs/src/.vuepress/data/comparison.json`,
  which the `ComparisonReport` Vue component on `docs/src/compare.md` and `docs/src/zh/compare.md`
  renders as an overview table with search, filtering and expandable per-package details. The data
  file is generated by the compare package `docs` script (which the `docs:build` / `docs:dev`
  scripts run first) and is
  not committed — only the underlying results are.
- The plugin pages only get a one-line link to the comparison page, and the package READMEs get a
  compact summary (correctness & tests, throughput, import cost) plus the link to the comparison page.
- The compare package `check` script verifies the generated data file and every generated link
  block; it runs in CI.
