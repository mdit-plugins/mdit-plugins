---
title: "@mdit/plugin-dl"
shortTitle: "plugin-dl"
icon: book
---

Plugin to support definition list.

<!-- more -->

## Usage

```ts
import { dl } from "@mdit/plugin-dl";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(dl);

mdIt.render(`\
Apple
: Pomaceous fruit of plants of the genus Malus in the family Rosaceae.

Orange
: The fruit of an evergreen tree of the genus Citrus.
`);
```

## Syntax

The grammar is based on [PanDoc Definition lists](https://pandoc.org/MANUAL.html#definition-lists)

Each term must be on one line, optionally followed by a blank line. After a term, it must be followed by one or more definitions.

Each definition needs to start with `:` or `~` and may be followed by one or more definition paragraphs, starting on the same or the next line. When multiple block elements are defined, subsequent block elements should be indented by four spaces.

If there is a blank line after the term, the definition text will be treated as a paragraph, otherwise a compact list will be displayed.

## Demo

::: preview Demo

Term 1

: Definition 1

Term 2 with _inline markup_

: Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

Term 3

: Definition
with lazy continuation.

    Second paragraph of the definition.

---

Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-deflist`](https://www.npmjs.com/package/markdown-it-deflist) package `4.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    22 |    22 |          0 |                0 |

All 22 cases match the reference output exactly.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          12,034 |            12,072 | 1.00× |
| normal/medium |           2,298 |             2,313 | 0.99× |
| normal/large  |             582 |               582 | 1.00× |
| heavy/small   |           6,307 |             6,328 | 1.00× |
| heavy/medium  |           1,371 |             1,373 | 1.00× |
| heavy/large   |             338 |               336 | 1.01× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series                    | Sizes                  | Current exponent | Reference exponent |
| ------------------------- | ---------------------- | ---------------: | -----------------: |
| many-definitions-per-term | 128 / 256 / 512 / 1024 |            ~1.00 |              ~1.00 |
| many-terms                | 128 / 256 / 512 / 1024 |            ~1.00 |              ~1.00 |
| nested-definitions        | 128 / 256 / 512 / 1024 |            ~1.58 |              ~1.59 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                               | Unpacked size | Entry gzip |
| ------------------------------------- | ------------: | ---------: |
| @mdit/plugin-dl (current)             |       29.9 kB |      978 B |
| markdown-it-deflist@4.0.0 (reference) |       26.7 kB |     1.9 kB |

### Notes

- Neither package takes options; both are installed with their defaults.
- The current package and the reference only differ in source-map / token metadata that is not rendered, so every correctness case compares equal.
- Historical context: the reference implementation had a hang (infinite loop) on definition lines starting with `: >` or `~ >` (markdown-it-deflist#5), fixed in 2.0.3. The installed 4.0.0 and this fork are both linear on that pattern and on all other probed patterns.
- `nested-definitions` grows its indentation by four spaces per level, so the generated input itself is quadratic in the series size; the fitted exponent is a lower bound for the parser's work per input byte, not a quadratic parser.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
