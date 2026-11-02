---
title: "@mdit/plugin-ins"
shortTitle: "plugin-ins"
icon: underline
---

Plugins to add insert tag support.

<!-- more -->

## Usage

```ts
import { ins } from "@mdit/plugin-ins";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(ins);

mdIt.render("VuePress Theme Hope is ++very++ powerful.");
```

## Syntax

Use `++ ++` to add `<ins>` tag.

## Demo

::: preview Demo

VuePress Theme Hope is ++very++ powerful.

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-ins`](https://www.npmjs.com/package/markdown-it-ins) package `4.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    23 |    23 |          0 |                0 |

All 23 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          10,799 |            10,688 | 1.01× |
| normal/medium |           2,256 |             2,212 | 1.02× |
| normal/large  |             629 |               621 | 1.01× |
| heavy/small   |           4,295 |             4,311 | 1.00× |
| heavy/medium  |             812 |               793 | 1.02× |
| heavy/large   |             221 |               223 | 0.99× |

Geometric mean throughput ratio: 1.01× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series             | Sizes                    | Current exponent | Reference exponent |
| ------------------ | ------------------------ | ---------------: | -----------------: |
| inline-insertions  | 500 / 1000 / 2000 / 4000 |            ~1.03 |              ~1.02 |
| nested-odd-markers | 128 / 256 / 512 / 1024   |            ~1.04 |              ~1.01 |
| unmatched-openers  | 500 / 1000 / 2000 / 4000 |            ~1.03 |              ~1.00 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                           | Unpacked size | Entry gzip |
| --------------------------------- | ------------: | ---------: |
| @mdit/plugin-ins (current)        |       18.6 kB |      187 B |
| markdown-it-ins@4.0.0 (reference) |       15.6 kB |     1.1 kB |

### Notes

- Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.
- The package registers the shared nested inline rule with doubled `++` markers, like the reference; both follow the CommonMark emphasis delimiter rules and relocate the lone marker of odd-length runs. Every correctness case renders identical HTML, so no case is a documented difference.
- Scaling: both implementations consume each marker run once and move the lone marker of an odd-length run within a single run of adjacent close tags. `inline-insertions`, `unmatched-openers` and `nested-odd-markers` all fit a near-linear exponent on both sides; no superlinear path was found.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
