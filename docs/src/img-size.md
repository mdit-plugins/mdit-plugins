---
title: "@mdit/plugin-img-size"
shortTitle: "plugin-img-size"
icon: up-right-and-down-left-from-center
---

Plugins to support setting size for images.

<!-- more -->

## Usage

```ts
import { legacyImgSize, imgSize, obsidianImgSize } from "@mdit/plugin-img-size";
import MarkdownIt from "markdown-it";

// New syntax
const mdNew = new MarkdownIt().use(imgSize);
mdNew.render("![image =300x200](https://example.com/image.png)");

// Obsidian syntax
const mdObsidian = new MarkdownIt().use(obsidianImgSize);
mdObsidian.render("![image|300x200](https://example.com/image.png)");

// Legacy syntax
const mdLegacy = new MarkdownIt().use(legacyImgSize);
mdLegacy.render("![image](https://example.com/image.png =300x200)");
```

## Syntax

### New Syntax

Append `=widthxheight` to image alt text with spaces as separator.

Both `width` and `height` should be numbers as pixels and are optional. A single trailing `%` is supported to use percentages, a dimension set to `0` is treated as unspecified, and a size whose width and height are both `0` is ignored.

```md
![Alt =200x300](/example.png)
![Alt =200x](/example.jpg "Title")
![Alt =x300](/example.bmp)
![Alt =50%x300](/example.webp)
```

Renders as ↓

```html
<img src="/example.png" alt="Alt" width="200" height="300" />
<img src="/example.jpg" alt="Alt" title="Title" width="200" />
<img src="/example.bmp" alt="Alt" height="300" />
<img src="/example.webp" alt="Alt" width="50%" height="300" />
```

### Obsidian Syntax

Append `widthxheight` after image alt text and use `|` to separate.

Both `width` and `height` should be numbers as pixels and are required. Setting one of them with `0` to scale by ratio with the other.

```md
![Alt|200x200](/example.png)
![Alt|200x0](/example.jpg)
![Alt|0x300](/example.bmp)
```

Renders as ↓

```html
<img src="/example.png" alt="Alt" width="200" height="200" />
<img src="/example.jpg" alt="Alt" width="200" />
<img src="/example.bmp" alt="Alt" height="300" />
```

### Legacy Syntax (Deprecated)

::: warning This may cause rendering issues on platforms like GitHub.
:::

Append `=widthxheight` at the end of image link section with spaces as separator.

Both `width` and `height` should be numbers as pixels and are optional. A single trailing `%` is supported to use percentages, a dimension set to `0` is treated as unspecified, and a size whose width and height are both `0` is ignored.

```md
![Alt](/example.png =200x300)
![Alt](/example.jpg "Title" =200x)
![Alt](/example.bmp =x300)
![Alt](/example.webp =50%x300)
```

Renders as ↓

```html
<img src="/example.png" alt="Alt" width="200" height="300" />
<img src="/example.jpg" alt="Alt" title="Title" width="200" />
<img src="/example.bmp" alt="Alt" height="300" />
<img src="/example.webp" alt="Alt" width="50%" height="300" />
```

::: tip Choosing between 3 Grammars

- The legacy grammar breaks image rendering in environments that don't support it (e.g.: GitHub)
- Both the new grammar and the Obsidian grammar are compatible with the Markdown standard, but new grammar is more natural.

:::

## Demo

::: preview Demo

<!-- New Syntax -->

![Logo =200x200](/logo.svg "Markdown")
![Logo =150x](/logo.svg "Markdown")
![Logo =x100](/logo.svg "Markdown")
![Logo =50%x300](/logo.svg "Markdown")

<!-- Legacy Syntax -->

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)
![Logo](/logo.svg "Markdown" =50%x300)

<!-- Obsidian Syntax -->

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-imsize`](https://www.npmjs.com/package/markdown-it-imsize) package `2.0.1`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |    19 |          0 |                6 |

The following cases are documented differences:

- `zero-width` — The current package drops a `0` width (treated as unspecified), the reference emits `width="0"`.
- `zero-height` — The current package drops a `0` height (treated as unspecified), the reference emits `height="0"`.
- `zero-both` — The current package rejects an all-zero size and leaves the markdown unparsed as an image, the reference renders the image with `width="0" height="0"`.
- `zero-percent-width` — The current package treats `0%` as an unspecified width, the reference emits `width="0%"`.
- `percent-in-middle` — The reference number scanner accepts `%` anywhere in a dimension, while the current package only accepts one trailing `%`.
- `tab-before-size` — The current package accepts a tab before the size, the reference only accepts a literal space.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          18,139 |            18,221 | 1.00× |
| normal/medium |           2,169 |             2,189 | 0.99× |
| normal/large  |             568 |               573 | 0.99× |
| heavy/small   |          15,608 |            16,314 | 0.96× |
| heavy/medium  |           2,014 |             2,102 | 0.96× |
| heavy/large   |             552 |               575 | 0.96× |

Geometric mean throughput ratio: 0.98× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series           | Sizes                | Current exponent | Reference exponent |
| ---------------- | -------------------- | ---------------: | -----------------: |
| malformed-sizes  | 64 / 128 / 256 / 512 |            ~1.02 |              ~1.02 |
| sized-images     | 64 / 128 / 256 / 512 |            ~1.01 |              ~1.01 |
| unmatched-labels | 64 / 128 / 256 / 512 |            ~1.19 |              ~1.19 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                              | Unpacked size | Entry gzip |
| ------------------------------------ | ------------: | ---------: |
| @mdit/plugin-img-size (current)      |       87.2 kB |     1.8 kB |
| markdown-it-imsize@2.0.1 (reference) |      638.1 kB |     1.6 kB |

### Notes

- Only the deprecated `legacyImgSize` variant is compared: `imgSize` (`![alt =100x200](url)`) and `obsidianImgSize` (`![alt|100x200](url)`) are extensions of this package with no equivalent in `markdown-it-imsize`.
- The current package treats a dimension whose numeric value is `0` as unspecified and rejects a size whose width and height are both `0`; the reference emits the literal `0`. `zero-width`, `zero-height`, `zero-both` and `zero-percent-width` document this.
- The current package accepts a single trailing `%` per dimension (the documented syntax); the reference's number scanner accepts `%` anywhere, so `=5%0x3%0` is parsed by the reference only. Documented in `percent-in-middle`.
- The current package accepts any whitespace before the size specification, while the reference requires a literal space (its check is `charCodeAt(pos - 1) === 0x20`); `tab-before-size` is therefore parsed by the current package only.
- The reference `autofill` option is not compared: it reads image files from disk (`image-size`) and its output depends on the filesystem.
- Scaling: the reference image rule re-attempts `parseLinkLabel` for every `![` opener and parses every label again; malformed sizes fall back to the core image rule. markdown-it caches `skipToken` positions, so all series stay ~linear (no superlinear behavior was found in the upstream implementation).
- Attribute order is normalized.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
