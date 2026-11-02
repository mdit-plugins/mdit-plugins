---
title: "@mdit/plugin-mark"
shortTitle: "plugin-mark"
icon: highlighter
---

Plugins to mark and highlight contents.

<!-- more -->

## Usage

```ts
import { mark } from "@mdit/plugin-mark";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

## Syntax

Use `== ==` to mark.

## Demo

::: preview Demo

VuePress Theme Hope is ==powerful==.

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-mark`](https://www.npmjs.com/package/markdown-it-mark) package `4.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    23 |    23 |          0 |                0 |

All 23 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          10,862 |            10,919 | 0.99× |
| normal/medium |           2,222 |             2,222 | 1.00× |
| normal/large  |             636 |               637 | 1.00× |
| heavy/small   |           4,348 |             4,263 | 1.02× |
| heavy/medium  |             806 |               810 | 1.00× |
| heavy/large   |             228 |               232 | 0.98× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series             | Sizes                    | Current exponent | Reference exponent |
| ------------------ | ------------------------ | ---------------: | -----------------: |
| inline-marks       | 500 / 1000 / 2000 / 4000 |            ~1.01 |              ~1.01 |
| nested-odd-markers | 128 / 256 / 512 / 1024   |            ~1.09 |              ~0.99 |
| unmatched-openers  | 500 / 1000 / 2000 / 4000 |            ~0.99 |              ~0.99 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                            | Unpacked size | Entry gzip |
| ---------------------------------- | ------------: | ---------: |
| @mdit/plugin-mark (current)        |       18.6 kB |      185 B |
| markdown-it-mark@4.0.0 (reference) |       15.7 kB |     1.1 kB |

### Notes

- Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.
- The package registers the shared nested inline rule with doubled `==` markers, like the reference; both follow the CommonMark emphasis delimiter rules and relocate the lone marker of odd-length runs. Every correctness case renders identical HTML, so no case is a documented difference.
- Scaling: both implementations consume each marker run once and move the lone marker of an odd-length run within a single run of adjacent close tags. `inline-marks`, `unmatched-openers` and `nested-odd-markers` all fit a near-linear exponent on both sides; no superlinear path was found.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
