---
title: "@mdit/plugin-figure"
shortTitle: "plugin-figure"
icon: image
---

Plugin for generating figures with captions from images.

<!-- more -->

## Usage

```ts
import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(figure, {
  // your options, optional
});

mdIt.render("![image](https://example.com/image.png)");
```

## Syntax

Sometimes, you may want to add a description with image and place it between contents, so here is this plugin.

If a image is standalone in a line, wrapped or not wrapped by link, it will be displayed as `<figure>` and title (or alt) will be displayed as `<figcaption>`.

## Options

::: fields
@`moveAttrs` type=`boolean | (string | RegExp)[]` default=`false`

Copy or move image attributes to `<figure>`.

- `true`: **copy** all attributes except native img ones (src, alt, srcset, width, height, loading, etc.) to `<figure>`. Image keeps them.
- `(string | RegExp)[]`: **move** only matching attributes to `<figure>`. Image loses them.

Native img attributes (src, alt, title, width, height, etc.) are never moved or copied to `<figure>`, and `title` is always used as the `<figcaption>` content.

When the `<figure>` already has a `class` or `style` attribute, the image value is merged into it: `class` tokens are deduplicated, and `style` declarations are joined with `;` (empty declarations are dropped). When merging duplicate keys, attribute names are compared case-insensitively. Other duplicate keys are ignored, so the figure's existing value wins.

```ts
// Copy all non-native attrs to figure (img keeps them)
moveAttrs: true;

// Move class and data-* attrs to figure (img loses them)
moveAttrs: ["class", /^data-/];
```

@`focusable` type=boolean default=`true`

Whether the figure is focusable. When enabled, `tabindex="0"` is added to the image unless it already has a `tabindex` attribute, which is preserved.

@`linkImage` type=boolean default=`true`

Whether to convert linked images (`[![image](url)](link)`) to figures.

:::

## Demo

::: preview Demo

![Logo](/favicon.ico)

[![Logo](/favicon.ico)](https://commonmark.org/)

![Logo](/favicon.ico "Markdown")

[![Logo](/favicon.ico "Markdown")](https://commonmark.org/)

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-image-figures`](https://www.npmjs.com/package/markdown-it-image-figures) package `2.1.1`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    21 |    18 |          0 |                3 |

The following cases are documented differences:

- `figure-alt-only` — The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.
- `linked-image-alt-only` — The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.
- `tight-list-image` — The current package skips images inside hidden (tight list) paragraphs, so the paragraph is untouched; the reference converts it and emits a `<figcaption>` without a `<figure>` wrapper.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          14,215 |            14,199 | 1.00× |
| normal/medium |           2,447 |             2,438 | 1.00× |
| normal/large  |             562 |               570 | 0.99× |
| heavy/small   |           9,527 |             9,588 | 0.99× |
| heavy/medium  |           1,644 |             1,597 | 1.03× |
| heavy/large   |             377 |               361 | 1.04× |

Geometric mean throughput ratio: 1.01× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series         | Sizes                | Current exponent | Reference exponent |
| -------------- | -------------------- | ---------------: | -----------------: |
| linked-figures | 64 / 128 / 256 / 512 |            ~1.00 |              ~1.01 |
| long-captions  | 64 / 128 / 256 / 512 |            ~1.00 |              ~1.00 |
| many-figures   | 64 / 128 / 256 / 512 |            ~1.11 |              ~1.01 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                                     | Unpacked size | Entry gzip |
| ------------------------------------------- | ------------: | ---------: |
| @mdit/plugin-figure (current)               |       37.8 kB |     1.1 kB |
| markdown-it-image-figures@2.1.1 (reference) |       22.7 kB |      972 B |

### Notes

- `focusable` is disabled because the current package adds `tabindex="0"` to the image, while the reference `tabindex` option numbers figures from `1`; the reference option is therefore not used.
- The current package derives `<figcaption>` from the image `title` and falls back to the `alt` text; `markdown-it-image-figures` has no fallback mode, so `figcaption: "title"` is compared and alt-only images are documented as a difference.
- The current package skips hidden paragraphs (tight list items) so that a `<figcaption>` is never emitted without its `<figure>` wrapper; the reference converts images in tight list items without a `<figure>` wrapper. Documented in `tight-list-image`.
- `moveAttrs` is not compared: for `true` the current package copies non-native image attributes to `<figure>` and keeps them on the image, for a pattern list it moves them (the image loses them), and it merges `class`/`style` values. The reference `copyAttrs` copies every matching attribute to `<figure>` and keeps the original order on the image, which is not equivalent.
- Reference-only options (`dataType`, `link`, `tabindex`, `lazy`, `async`, `classes`, `removeSrc`) have no equivalent and are not compared.
- Scaling: the reference core rule walks the token stream once and calls `md.parseInline` once per caption, so the work is linear in the document size and caption length; all three series measure ~1 (no superlinear behavior was found in the upstream implementation).
- Attribute order is normalized.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
