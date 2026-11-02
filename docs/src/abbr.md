---
title: "@mdit/plugin-abbr"
shortTitle: "plugin-abbr"
icon: spell-check
---

Plugin to support abbreviation tag `<abbr>`.

<!-- more -->

## Usage

```ts
import { abbr } from "@mdit/plugin-abbr";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(abbr);

mdIt.render(`
*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
The HTML specification is maintained by the W3C.
`);
```

<!-- markdownlint-disable MD028 -->

## Syntax

With this plugin you can declare abbreviations using reference beginning with an extra `*`:

<!-- prettier-ignore-start -->

```md
*[Abbr word]: Abbr content
```

<!-- prettier-ignore-end -->

::: tip Escaping

Escaping can be done by adding `\` to escape the `*` `[` or `]` marker:

```md
\*[text]: content
```

will be

\*[text]: content

:::

## Demo

<!-- prettier-ignore-start -->

::: preview Demo

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

The HTML specification is maintained by the W3C.

:::

<!-- prettier-ignore-end -->

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-abbr`](https://www.npmjs.com/package/markdown-it-abbr) package `2.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    23 |    23 |          0 |                0 |

All 23 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          10,569 |            10,094 | 1.05× |
| normal/medium |           2,420 |             2,369 | 1.02× |
| normal/large  |             599 |               590 | 1.02× |
| heavy/small   |           5,585 |             5,471 | 1.02× |
| heavy/medium  |           1,045 |             1,043 | 1.00× |
| heavy/large   |             261 |               253 | 1.03× |

Geometric mean throughput ratio: 1.02× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series                    | Sizes                    | Current exponent | Reference exponent |
| ------------------------- | ------------------------ | ---------------: | -----------------: |
| dense-occurrences         | 128 / 256 / 512 / 1024   |            ~0.99 |              ~0.98 |
| interleaved-abbreviations | 512 / 1024 / 2048 / 4096 |            ~1.05 |              ~1.94 |
| many-definitions          | 128 / 256 / 512 / 1024   |            ~0.95 |              ~0.95 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                            | Unpacked size | Entry gzip |
| ---------------------------------- | ------------: | ---------: |
| @mdit/plugin-abbr (current)        |       30.7 kB |      979 B |
| markdown-it-abbr@2.0.0 (reference) |       21.2 kB |     1.6 kB |

### Notes

- Neither package takes options; both are installed with their defaults.
- The reference rewrites the inline token list with `md.utils.arrayReplaceAt` for every text token that contains an abbreviation, copying the whole token array each time, so a paragraph with inline markup between abbreviations grows quadratically on the reference side. The current package rebuilds the children list in a single pass and stays linear; `interleaved-abbreviations` exposes the difference.
- Abbreviations are matched case-sensitively and only at word boundaries, so `HTML` is not replaced inside `HTML5` or `html`.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
