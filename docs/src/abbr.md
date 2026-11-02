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
| normal/small  |          10,455 |            10,268 | 1.02× |
| normal/medium |           2,386 |             2,378 | 1.00× |
| normal/large  |             595 |               597 | 1.00× |
| heavy/small   |           5,572 |             5,473 | 1.02× |
| heavy/medium  |           1,048 |             1,055 | 0.99× |
| heavy/large   |             259 |               258 | 1.00× |

Geometric mean throughput ratio: 1.01× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series                    | Sizes                    | Current exponent | Reference exponent |
| ------------------------- | ------------------------ | ---------------: | -----------------: |
| dense-occurrences         | 128 / 256 / 512 / 1024   |            ~0.97 |              ~0.97 |
| interleaved-abbreviations | 512 / 1024 / 2048 / 4096 |            ~1.83 |              ~1.81 |
| many-definitions          | 128 / 256 / 512 / 1024   |            ~0.96 |              ~0.96 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                            | Unpacked size | Entry gzip |
| ---------------------------------- | ------------: | ---------: |
| @mdit/plugin-abbr (current)        |       27.7 kB |      954 B |
| markdown-it-abbr@2.0.0 (reference) |       21.2 kB |     1.6 kB |

### Notes

- Neither package takes options; both are installed with their defaults.
- The replacement pass rewrites the inline token list with `md.utils.arrayReplaceAt`, which copies the whole token array for every text token that contains an abbreviation. A paragraph with inline markup between abbreviations therefore grows quadratically; both implementations fork the same algorithm and show the same exponent.
- Abbreviations are matched case-sensitively and only at word boundaries, so `HTML` is not replaced inside `HTML5` or `html`.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
