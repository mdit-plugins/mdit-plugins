---
title: "@mdit/plugin-footnote"
shortTitle: "plugin-footnote"
icon: quote-left
---

Plugin to support footnotes.

<!-- more -->

## Usage

```ts
import { footnote } from "@mdit/plugin-footnote";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

## Syntax

- Use `[^Anchor text]` in Markdown to define a footnote

- Use block starting with `[^Anchor text]: ...` to describe footnote content

- If there are multiple paragraph in footnote, the paragraph show be double indented.

::: tip Nesting and escaping

- Nestings are supported:

  ```md
  Footnote 1 link[^first].

  [^first]: Footnote can reference [^second].

  [^second]: Other footnote.
  ```

- Escaping can be done by adding `\`:

  ```md
  The following \[^first] is not a footnote.
  ```

  will be

  The following \[^first] is not a footnote.

:::

## Demo

::: preview Demo

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference.

[^first]: Footnote **can have markup**

    and multiple paragraphs[^second].

[^second]: Footnote text.

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-footnote`](https://www.npmjs.com/package/markdown-it-footnote) package `4.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    22 |     6 |         16 |                0 |

All 22 cases match the reference output after normalization.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          17,185 |            17,241 | 1.00× |
| normal/medium |           2,459 |             2,447 | 1.01× |
| normal/large  |             592 |               585 | 1.01× |
| heavy/small   |           9,230 |             9,095 | 1.01× |
| heavy/medium  |           1,592 |             1,516 | 1.05× |
| heavy/large   |             395 |               327 | 1.21× |

Geometric mean throughput ratio: 1.05× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series               | Sizes                    | Current exponent | Reference exponent |
| -------------------- | ------------------------ | ---------------: | -----------------: |
| duplicate-references | 128 / 256 / 512 / 1024   |            ~0.98 |              ~0.97 |
| many-definitions     | 128 / 256 / 512 / 1024   |            ~1.00 |              ~1.00 |
| many-footnotes       | 512 / 1024 / 2048 / 4096 |            ~1.03 |              ~1.61 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                                | Unpacked size | Entry gzip |
| -------------------------------------- | ------------: | ---------: |
| @mdit/plugin-footnote (current)        |       58.6 kB |     1.7 kB |
| markdown-it-footnote@4.0.0 (reference) |       46.8 kB |     2.7 kB |

### Notes

- The current package emits an extra empty `<a class="footnote-anchor">` inside `<sup class="footnote-ref">` so that consumers can set a CSS scroll offset, while the reference keeps the back-reference id on the link itself. Normalization removes that element and unifies the generated `footnote*` / `fn*` ids and `href`s before comparing.
- Generated footnote ids, reference ids and `href` targets are normalized; footnote numbering, captions (`[1]`, `[1:1]`) and the rendered footnote list are compared.
- Neither plugin takes options, so `ourOptions` and `referenceOptions` are omitted.
- The current package escapes a caller-provided `env.docId` before interpolating it into generated ids (the reference does not). The harness renders without `env`, so the `docId` path is not exercised by the cases.
- Scaling: the reference `footnote_tail` rebuilds the token array for every footnote definition (`state.tokens = state.tokens.concat(tokens)`), which is quadratic in the number of footnotes; the current package pushes into the existing array instead. `many-footnotes` exposes this (reference exponent ~1.6, current ~1.0).
- Attribute order is normalized.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
