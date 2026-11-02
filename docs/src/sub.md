---
title: "@mdit/plugin-sub"
shortTitle: "plugin-sub"
icon: subscript
---

Plugin to support subscript.

<!-- more -->

## Usage

```ts
import { sub } from "@mdit/plugin-sub";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(sub);

mdIt.render("H~2~O");
```

## Syntax

Use `~ ~` to mark the subscript.

::: tip Escaping

- You can use `\` to escape `~`:

  ```md
  H\~2~O
  ```

  will be

  H\~2~O

:::

## Demo

<!-- prettier-ignore -->
`H~2~O`: H~2~O

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-sub`](https://www.npmjs.com/package/markdown-it-sub) package `2.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    24 |    24 |          0 |                0 |

All 24 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          10,776 |            10,753 | 1.00× |
| normal/medium |           2,348 |             2,338 | 1.00× |
| normal/large  |             648 |               650 | 1.00× |
| heavy/small   |           3,887 |             3,888 | 1.00× |
| heavy/medium  |             732 |               738 | 0.99× |
| heavy/large   |             202 |               203 | 0.99× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series            | Sizes                    | Current exponent | Reference exponent |
| ----------------- | ------------------------ | ---------------: | -----------------: |
| inline-subscripts | 500 / 1000 / 2000 / 4000 |            ~1.01 |              ~1.01 |
| long-inline-run   | 512 / 1024 / 2048 / 4096 |            ~0.93 |              ~0.92 |
| unmatched-openers | 500 / 1000 / 2000 / 4000 |            ~0.99 |              ~1.00 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                           | Unpacked size | Entry gzip |
| --------------------------------- | ------------: | ---------: |
| @mdit/plugin-sub (current)        |       18.3 kB |      156 B |
| markdown-it-sub@2.0.0 (reference) |        9.6 kB |      674 B |

### Notes

- Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.
- The package uses the shared linear inline rule; like the reference it scans to the next marker, rejects unescaped whitespace in the content and unescapes backslash escapes. Every correctness case renders identical HTML, so no case is a documented difference.
- Scaling: the scanner stops at the next marker character, so repeated unmatched openers do not rescan the remaining line, and `long-inline-run` scans its content once. `inline-subscripts`, `unmatched-openers` and `long-inline-run` all fit a near-linear exponent on both sides; no superlinear path was found.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
