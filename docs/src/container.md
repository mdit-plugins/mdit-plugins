---
title: "@mdit/plugin-container"
shortTitle: "plugin-container"
icon: box-open
---

Plugin for creating block-level custom containers.

<!-- more -->

## Usage

```ts
import { container } from "@mdit/plugin-container";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(container, {
  // your options, name is required
  name: "warning",
});

mdIt.render(`
::: warning

Warning Text

:::
`);
```

## Syntax

With this plugin you can create block containers like:

```md
::: warning
_here be dragons_
:::
```

and specify how they should be rendered. If no renderer defined, `<div>` with container name class will be created:

```html
<div class="warning">
  <em>here be dragons</em>
</div>
```

Markup is the same as for fenced code blocks. However by default the plugin use another character as marker and content is rendered as markdown markup by plugin.

::::: tip Nesting and escaping

- Nestings can be done by increasing marker number of outer container:

  ```md
  :::: warning
  Warning contents...

  ::: details
  Some details
  :::
  ::::
  ```

  will be

  :::: warning
  Warning contents...

  ::: details
  Some details
  :::
  ::::

- Escaping can be done by adding `\` to escape the marker:

  ```md
  \::: warning

  :::
  ```

  will be

  \::: warning

  :::

:::::

## Options

::: fields
@`name` type=string required

Container name.

@`marker` type=string default=`":"`

Container marker.

@`validate` type=Validator

```ts
/**
 * Validate whether it should be regarded as this container type
 *
 * @default params.trim().split(" ", 2)[0] === name
 * @param params The content after the marker
 * @param markup Marker character
 * @returns Is this container type or not
 */
type Validator = (params: string, markup: string) => boolean;
```

Validate whether it should be regarded as this container type.

@`openRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Opening tag render function.

@`closeRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Closing tag render function.

:::

## Demo

### Hint container

With the following code and some styles:

```js
import { escapeHtml } from "@mdit/helper";

md.use(container, {
  name: "hint",
  openRenderer: (tokens, index, _options) => {
    const info = tokens[index].info.trim().slice(4).trim();

    return `<div class="custom-container hint">\n<p class="custom-container-title">${
      escapeHtml(info) || "Hint"
    }</p>\n`;
  },
});
```

::: warning Untrusted input

Custom container titles come from document content, so they must be HTML-escaped when rendered as HTML; the example above uses `escapeHtml` for this.

:::

:::: preview You can write a hint like this:

::: hint Here is a Hint
:::

::: hint

Here is a **hint** for you!

- Hint 1
  - Hint 1.1
  - Hint 1.2
- Hint 2

:::

::::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-container`](https://www.npmjs.com/package/markdown-it-container) package `4.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    23 |    20 |          0 |                3 |

The following cases are documented differences:

- `indented-opening` — The current package requires the closing marker to be indented exactly like the opening marker (both are 2 columns here, then 0), so the container stays unclosed; the reference accepts the unindented closing marker and closes it.
- `indented-closing` — The reference accepts a closing marker indented by less than four columns; the current package requires the closing marker to be indented exactly like the opening marker, so it keeps the `:::` line as container content.
- `indented-closing-after-blank` — Same closing-marker rule as `indented-closing`: the reference closes the empty container, while the current package renders the indented marker as a paragraph inside it.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          12,010 |            11,933 | 1.01× |
| normal/medium |           2,335 |             2,333 | 1.00× |
| normal/large  |             576 |               576 | 1.00× |
| heavy/small   |           7,278 |             7,283 | 1.00× |
| heavy/medium  |           1,375 |             1,372 | 1.00× |
| heavy/large   |             345 |               345 | 1.00× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series                   | Sizes                  | Current exponent | Reference exponent |
| ------------------------ | ---------------------- | ---------------: | -----------------: |
| deeply-nested-containers | 128 / 256 / 512 / 1024 |            ~1.61 |              ~1.66 |
| non-matching-containers  | 128 / 256 / 512 / 1024 |            ~1.00 |              ~1.00 |
| sibling-containers       | 128 / 256 / 512 / 1024 |            ~1.00 |              ~1.00 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                                 | Unpacked size | Entry gzip |
| --------------------------------------- | ------------: | ---------: |
| @mdit/plugin-container (current)        |       29.2 kB |      910 B |
| markdown-it-container@4.0.0 (reference) |       20.1 kB |     1.4 kB |

### Notes

- The current package takes a required `name` option object, while the reference takes the container name as a positional argument; both sides are installed through custom renderers so that two equivalent containers are registered (`warning` with the default `:` marker and `spoiler` with the `%` marker).
- The current package does not need `openRenderer` / `closeRenderer` to be compared: both are user render functions with no reference counterpart. The default renderer output (the container class on the opening `<div>`) is compared.
- `indented-opening`, `indented-closing` and `indented-closing-after-blank` are expected differences: the current package only accepts a closing marker indented exactly like the opening marker, while the reference accepts any closing marker indented less than four columns relative to the enclosing block, so the reference closes those blocks and the current package keeps the marker as content.
- Both custom renderers raise markdown-it's `maxNesting` to 10,000; the default cap of 100 limits how deeply containers can nest and would hide the quadratic closing-marker scan of the `deeply-nested-containers` series. The benchmark corpora are shallow, so throughput is unaffected.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
