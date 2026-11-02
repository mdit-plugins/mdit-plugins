---
title: "@mdit/plugin-spoiler"
shortTitle: "plugin-spoiler"
icon: eraser
---

Plugins to hide content.

<!-- more -->

## Usage

```ts
import { spoiler } from "@mdit/plugin-spoiler";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope is !!powerful!!.");
```

With the default options, you can import `@mdit/plugin-spoiler/style` to apply styles.

## Syntax

Use `!! !!` hide contents.

## Options

::: fields
@`tag` type=string default=`"span"`

HTML tag name for the spoiler element.

@`attrs` type=`[attr: string, value: string][] | (() => [attr: string, value: string][])` default=`() => [["class", "spoiler"], ["tabindex","-1"]]`

Custom HTML attributes for the spoiler element. A static array is cloned for every token; a factory function is called once per token and must return a new array (recommended for dynamic attributes).

:::

## Demo

::: preview Demo

VuePress Theme Hope is !!powerful!!.

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-spoiler`](https://www.npmjs.com/package/markdown-it-spoiler) package `1.1.1`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    22 |    22 |          0 |                0 |

All 22 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          18,894 |            19,234 | 0.98× |
| normal/medium |           2,566 |             2,562 | 1.00× |
| normal/large  |             747 |               753 | 0.99× |
| heavy/small   |           5,901 |             6,009 | 0.98× |
| heavy/medium  |           1,199 |             1,190 | 1.01× |
| heavy/large   |             339 |               342 | 0.99× |

Geometric mean throughput ratio: 0.99× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series             | Sizes                    | Current exponent | Reference exponent |
| ------------------ | ------------------------ | ---------------: | -----------------: |
| inline-spoilers    | 500 / 1000 / 2000 / 4000 |            ~1.02 |              ~1.01 |
| nested-odd-markers | 128 / 256 / 512 / 1024   |            ~0.98 |              ~0.99 |
| unmatched-openers  | 500 / 1000 / 2000 / 4000 |            ~1.00 |              ~1.00 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                               | Unpacked size | Entry gzip |
| ------------------------------------- | ------------: | ---------: |
| @mdit/plugin-spoiler (current)        |       21.3 kB |      235 B |
| markdown-it-spoiler@1.1.1 (reference) |        6.6 kB |     1.7 kB |

### Notes

- The current package adds `tabindex="-1"` to the spoiler element by default for keyboard accessibility. The variant sets `attrs` to `[["class", "spoiler"]]` so that the compared markup is the reference's `<span class="spoiler">`; the accessibility attribute is an intentional addition and is not part of this comparison.
- The reference exposes a `frontPriorMode` option that controls where an odd leftover marker is placed. The current package has no counterpart, so both sides are compared in the reference's default mode (`frontPriorMode: false`); the odd-length marker cases cover that mode.
- All correctness cases render identical HTML, so no output normalization beyond the harness default (attribute order) is applied.
- Scaling: both implementations consume each marker run once and relocate lone odd markers within a single run of adjacent close tags, so `inline-spoilers`, `unmatched-openers` and `nested-odd-markers` all grow linearly; no superlinear path was found.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
