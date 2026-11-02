---
title: "@mdit/plugin-sup"
shortTitle: "plugin-sup"
icon: superscript
---

Plugin to support superscript.

<!-- more -->

## Usage

```ts
import { sup } from "@mdit/plugin-sup";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(sup);

mdIt.render("19^th^");
```

## Syntax

Use `^ ^` to mark the superscript.

::: tip Escaping

- You can use `\` to escape `^`:

  ```md
  19\^th^
  ```

  will be

  19\^th^

:::

## Demo

`19^th^`: 19^th^

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-sup`](https://www.npmjs.com/package/markdown-it-sup) package `2.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    24 |    24 |          0 |                0 |

All 24 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          10,913 |            10,885 | 1.00× |
| normal/medium |           2,367 |             2,354 | 1.01× |
| normal/large  |             645 |               648 | 0.99× |
| heavy/small   |           3,942 |             3,942 | 1.00× |
| heavy/medium  |             755 |               756 | 1.00× |
| heavy/large   |             206 |               207 | 1.00× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series              | Sizes                    | Current exponent | Reference exponent |
| ------------------- | ------------------------ | ---------------: | -----------------: |
| inline-superscripts | 500 / 1000 / 2000 / 4000 |            ~1.00 |              ~1.00 |
| long-inline-run     | 512 / 1024 / 2048 / 4096 |            ~0.93 |              ~0.93 |
| unmatched-openers   | 500 / 1000 / 2000 / 4000 |            ~0.99 |              ~1.00 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                           | Unpacked size | Entry gzip |
| --------------------------------- | ------------: | ---------: |
| @mdit/plugin-sup (current)        |       18.3 kB |      155 B |
| markdown-it-sup@2.0.0 (reference) |        9.6 kB |      674 B |

### Notes

- Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.
- The package uses the shared linear inline rule; like the reference it scans to the next marker, rejects unescaped whitespace in the content and unescapes backslash escapes. Every correctness case renders identical HTML, so no case is a documented difference.
- Scaling: the scanner stops at the next marker character, so repeated unmatched openers do not rescan the remaining line, and `long-inline-run` scans its content once. `inline-superscripts`, `unmatched-openers` and `long-inline-run` all fit a near-linear exponent on both sides; no superlinear path was found.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
