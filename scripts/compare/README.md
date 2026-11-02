# Reference comparison harness

Compares the packages in this repository against the upstream plugins they are based on, both for
correctness (rendered output) and performance (throughput and scaling).

The harness lives in `scripts/compare/`:

| File                    | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `types.ts`              | Spec and result types, plus `defineComparison()`                   |
| `loader.ts`             | Loads the current `dist` build and the installed reference package |
| `normalize.ts`          | Shared HTML normalization helpers                                  |
| `bench.ts`              | Interleaved benchmark measurement and scaling exponent fitting     |
| `run.ts`                | CLI that runs specs and writes `results/<plugin>.json`             |
| `specs/<plugin>.ts`     | One comparison spec per package                                    |
| `results/<plugin>.json` | Committed comparison data used by the README and docs generators   |

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
pnpm exec node --experimental-strip-types scripts/compare/run.ts plugin-attrs

# Skip writing results while iterating
pnpm exec node --experimental-strip-types scripts/compare/run.ts plugin-attrs --no-write
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
    { name: "normal/small", kind: "normal", size: "small", markdown: "..." },
    // ... normal/medium, normal/large, heavy/small, heavy/medium, heavy/large
  ],
  scaling: [
    {
      name: "inline-attrs",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"word {.cls} ".repeat(size)}\n`,
    },
  ],
  normalize: (html) => html, // optional, defaults to sorting attributes
  notes: ["Any documented difference goes here."],
});
```

## Rules

1. **Equivalent options.** The comparison is only meaningful when both sides are configured to do
   the same job. Set `ourOptions` / `referenceOptions` accordingly and explain every non-obvious
   mapping in `notes`.
2. **Normalize deliberately.** `normalize` is applied to both sides. Only normalize differences
   that are not behavior differences (attribute order, wrapper markup that both sides emit by
   design, generated ids). Never normalize away a real output difference.
3. **Document real differences.** A case that still differs after normalization must have a `note`
   explaining why. Do not remove the case to make the numbers look better.
4. **Benchmarks cover two corpora.** Every spec has six benchmark cases:
   `normal/{small,medium,large}` (sparse, realistic document) and `heavy/{small,medium,large}`
   (dense plugin syntax). `kind` and `size` are required fields.
5. **Scaling cases target superlinear behavior.** Every spec has at least two scaling series, and
   each series measures at least four sizes. Series are built to expose the complexity of the
   reference implementation (for example many delimiters on one line, many unmatched openers,
   deeply nested blocks). The fitted exponent is reported: `~1` is linear, `~2` is quadratic.
   Research the upstream implementation and its issue tracker before choosing the series.
6. **Do not write results while iterating.** Use `--no-write`. The final result files are generated
   in one controlled, sequential run so that measurements from different packages are comparable.
