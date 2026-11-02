# Reference comparison harness

Compares the packages in this repository against the upstream plugins they are based on, both for
correctness (rendered output) and performance (throughput and scaling).

The harness lives in `compare/` and its data is presented on the dedicated
[comparison page](https://mdit-plugins.github.io/compare.html) of the documentation site — the
plugin pages only link to it, so the comparison never overshadows the plugin documentation.

| File                    | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `types.ts`              | Spec and result types, plus `defineComparison()`                   |
| `loader.ts`             | Loads the current `dist` build and the installed reference package |
| `normalize.ts`          | Shared HTML normalization helpers                                  |
| `bench.ts`              | Interleaved benchmark measurement and scaling exponent fitting     |
| `run.ts`                | CLI that runs specs and writes `results/<plugin>.json`             |
| `size.ts`               | Package size measurement, writes `results/sizes.json`              |
| `render.ts`             | Builds the docs data and the generated README comparison sections  |
| `syncDocs.ts`           | Generates the docs data and the per-plugin links                   |
| `specs/<plugin>.ts`     | One comparison spec per package                                    |
| `corpora/<plugin>/*.md` | Benchmark corpora, read verbatim by `run.ts`                       |
| `results/<plugin>.json` | Committed comparison data                                          |
| `results/sizes.json`    | Committed package size data                                        |

## Commands

```bash
# Build the current tree first; both sides are measured as shipped code
pnpm run build

# Correctness comparison only (fast)
pnpm run compare:test

# Benchmarks only
pnpm run compare:bench

# Correctness + benchmarks
pnpm run compare

# One package only
pnpm exec node --experimental-strip-types compare/run.ts plugin-attrs

# Skip writing results while iterating
pnpm exec node --experimental-strip-types compare/run.ts plugin-attrs --no-write

# Refresh correctness data only, keep the existing benchmark measurements
pnpm exec node --experimental-strip-types compare/run.ts plugin-attrs --correctness-only --merge

# Refresh package sizes, then the generated reports
pnpm run compare:sizes
pnpm run compare:docs
pnpm run packages:sync-readme

# Verify the generated reports are up to date (also runs in CI)
pnpm run compare:check
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
  notes: [{ en: "Any documented difference goes here.", zh: "任何已记录的差异写在这里。" }],
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
   public contract of a markdown-it plugin). A difference in either output counts as a documented
   difference and needs a `note`; token-only differences get a generated note pointing at the first
   diverging field. Use `compareTokens: false` on a variant only when the token stream is not
   comparable there.
4. **Document real differences.** A case that still differs after normalization must have a `note`
   explaining why. Do not remove the case to make the numbers look better.
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

## Presentation

- `compare/render.ts` turns the committed results into `docs/src/.vuepress/data/comparison.json`,
  which the `ComparisonReport` Vue component on `docs/src/compare.md` and `docs/src/zh/compare.md`
  renders as an overview table with search, filtering and expandable per-package details.
- The plugin pages only get a one-line link to the comparison page, and the package READMEs get a
  compact summary (correctness, throughput, package size) plus the link to the comparison page.
- `compare:check` verifies the generated data file and every generated link block; it runs in CI.
