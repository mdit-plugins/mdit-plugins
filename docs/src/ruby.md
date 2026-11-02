---
title: "@mdit/plugin-ruby"
shortTitle: "plugin-ruby"
icon: language
---

Plugin to support ruby annotation `<ruby>`.

<!-- more -->

## Usage

```ts
import { ruby } from "@mdit/plugin-ruby";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(ruby);

mdIt.render("{中国:zhōng|guó}");
```

## Syntax

Use `{ruby base:ruby text1|ruby text2|...}` to add ruby annotation.

::: tip Escaping

- You can use `\` to escape `{` `:` or `}`:

  ```md
  \{中国:zhōng|guó}
  ```

  will be

  \{中国:zhōng|guó}

:::

## Demo

`{中国:zhōng|guó}`: {中国:zhōng|guó}

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-ruby`](https://www.npmjs.com/package/markdown-it-ruby) package `1.1.2`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    21 |    10 |          0 |               11 |

The following cases are documented differences:

- `documented-syntax` — The reference splits on `|`, not on `:`: it renders `中国:zhōng` as the base text with `guó` as ruby text, while this package splits the base per character and pairs `中`/`zhōng` and `国`/`guó`.
- `upstream-syntax` — This package does not recognize the upstream `|` divider, so it leaves the construct as plain text; the reference renders it as ruby.
- `simple-ruby` — Same divider difference: this package renders ruby, the reference leaves the text untouched.
- `equal-length-pairs` — Divider difference: this package splits per character into two `<rt>` pairs, while the reference does not recognize `:` as the divider.
- `wrapped-in-strong` — Divider difference inside emphasis; both sides keep the surrounding `**` markup.
- `inline-markup-inside-ruby` — Divider difference: this package parses inline markup inside the base text, the reference leaves the whole construct as text with the emphasis parsed normally.
- `inline-markup-in-ruby-text` — Divider difference: this package parses inline markup inside the ruby text, the reference leaves the construct as text.
- `empty-ruby-segment` — This package rejects empty `|`-separated segments and leaves the source as text; the reference sees no `:` divider, treats `ab:` as base text and renders an empty `<rt></rt>`.
- `extra-colon` — This package keeps everything after the first `:` as ruby text; the reference does not recognize `:` and leaves the source as text.
- `escaped-backslash` — This package treats `\\` as an escaped backslash and the following `:` as the divider; the reference does not parse `:` at all.
- `in-table-cell` — Divider difference: this package renders ruby inside the table cell, the reference keeps the source text.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |           7,132 |             7,643 | 0.93× |
| normal/medium |           1,394 |             1,494 | 0.93× |
| normal/large  |             347 |               369 | 0.94× |
| heavy/small   |           3,289 |             3,308 | 0.99× |
| heavy/medium  |             622 |               624 | 1.00× |
| heavy/large   |             152 |               150 | 1.01× |

Geometric mean throughput ratio: 0.97× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series                  | Sizes                   | Current exponent | Reference exponent |
| ----------------------- | ----------------------- | ---------------: | -----------------: |
| dense-documented-syntax | 128 / 256 / 512 / 1024  |            ~1.01 |              ~1.92 |
| unmatched-openers       | 256 / 512 / 1024 / 2048 |            ~1.93 |              ~1.93 |
| upstream-syntax         | 128 / 256 / 512 / 1024  |            ~1.94 |              ~1.00 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                            | Unpacked size | Entry gzip |
| ---------------------------------- | ------------: | ---------: |
| @mdit/plugin-ruby (current)        |       20.1 kB |      575 B |
| markdown-it-ruby@1.1.2 (reference) |       21.3 kB |     1.9 kB |

### Notes

- The current package and the installed reference use different dividers: this package implements `{ruby base:ruby text}` (the upstream syntax that the fork was based on), while the installed `markdown-it-ruby@1.1.2` implements DenDenMarkdown's `{ruby base|ruby text}`. This is a real behavioral difference, not a normalization, so every case that renders ruby on one side renders plain text on the other and carries a `note`.
- The reference has an `rp` option (`[open, close]`). This package does not implement it, so the reference is left at its default `rp: []`, which renders no `<rp>` elements and matches the current package's output shape.
- The reference renders empty rubies such as `{ab:|}` (base `ab:`, empty `<rt></rt>`) because it only splits on `|`; this package rejects empty `|`-separated segments and empty ruby text, which is covered by `empty-ruby-segment`.
- Because the syntax differs, every benchmark corpus mixes both divider styles: each side parses its own syntax and only scans over the other side's lines. Throughput ratios therefore compare equivalent mixtures, not identical parse work.
- Both implementations scan forward to the end of the line when an opening `{` has no valid divider/close in that line; `unmatched-openers` exposes that quadratic path for both, `dense-documented-syntax` is linear for this package but quadratic for the reference, and `upstream-syntax` is the mirror image.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
