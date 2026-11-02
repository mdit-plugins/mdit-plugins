---
title: "@mdit/plugin-tasklist"
shortTitle: "plugin-tasklist"
icon: list-check
---

Plugins to support tasklist.

<!-- more -->

## Usage

```ts
import { tasklist } from "@mdit/plugin-tasklist";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(tasklist, {
  // your options, optional
});

mdIt.render(`\
- [x] task 1
- [ ] task 2
`);
```

## Syntax

- Use `- [ ] some text` to render a unchecked task item.
- Use `- [x] some text` to render a checked task item. (Capital `X` is also supported)

## Options

::: fields
@`disabled` type=boolean default=`true`

Whether to disable checkbox.

@`label` type=boolean default=`true`

Whether to use `<label>` to wrap text.

@`containerClass` type=string default=`'task-list-container'`

Class for tasklist container.

@`itemClass` type=string default=`'task-list-item'`

Class for tasklist item.

@`labelClass` type=string default=`'task-list-item-label'`

Class for tasklist item label.

@`checkboxClass` type=string default=`'task-list-item-checkbox'`

Class for tasklist item checkbox.

:::

## Demo

::: preview Demo

- [ ] Plan A
- [x] Plan B

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-task-checkbox`](https://www.npmjs.com/package/markdown-it-task-checkbox) package `1.0.6`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    21 |     7 |         13 |                1 |

The following cases are documented differences:

- `marker-as-link-reference` — The marker also resolves as a link reference: the current package removes the three parsed marker tokens, while the reference only strips the first text token, leaving the link markup inside the item.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          14,640 |            14,664 | 1.00× |
| normal/medium |           2,058 |             2,042 | 1.01× |
| normal/large  |             516 |               510 | 1.01× |
| heavy/small   |           6,656 |             6,428 | 1.04× |
| heavy/medium  |           1,178 |             1,067 | 1.10× |
| heavy/large   |             261 |               161 | 1.62× |

Geometric mean throughput ratio: 1.11× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series          | Sizes                    | Current exponent | Reference exponent |
| --------------- | ------------------------ | ---------------: | -----------------: |
| long-task-items | 64 / 128 / 256 / 512     |            ~1.00 |              ~1.11 |
| many-lists      | 64 / 128 / 256 / 512     |            ~1.00 |              ~1.18 |
| many-task-items | 512 / 1024 / 2048 / 4096 |            ~1.02 |              ~1.62 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                                     | Unpacked size | Entry gzip |
| ------------------------------------------- | ------------: | ---------: |
| @mdit/plugin-tasklist (current)             |       27.4 kB |      731 B |
| markdown-it-task-checkbox@1.0.6 (reference) |       76.9 kB |     1.4 kB |

### Notes

- `ulClass` / `liClass` are mapped to `containerClass` / `itemClass` with the reference defaults (`task-list` / `task-list-item`); `divWrap` stays `false` and `disabled` stays `true` on the reference side.
- Both packages label the item text, but the structure differs by design: the current package nests the checkbox inside `<label class="task-list-item-label">` and emits no ids, while the reference emits `<input id="cbx_N"><label for="cbx_N">`. Normalization unwraps the label tags and removes the generated `cbx_*` ids, so the compared part is the list structure, container/item classes, checkbox state and item text.
- `checkboxClass` is set to an empty string because the reference emits no class on the checkbox; the resulting empty `class` attribute is normalized away. The current package's extra `labelClass` is not observable after the label tags are normalized.
- `checked="checked"` / `disabled="disabled"` and the reference `checked="true"` / `disabled="true"` are equivalent boolean attributes; the normalizer canonicalizes them to the bare attribute.
- Scaling: the reference locates the parent list token with a backward scan through the token stream for every task item, which is quadratic in the number of items in one list; the current package records the last token index per nesting level in one forward pass and stays linear. `many-task-items` exposes the difference.
- Attribute order is normalized.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
