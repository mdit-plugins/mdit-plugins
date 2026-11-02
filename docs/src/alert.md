---
title: "@mdit/plugin-alert"
shortTitle: "plugin-alert"
icon: bell
---

Plugin to support GFM style alerts. ([Ref](https://github.com/orgs/community/discussions/16925))

Installing the plugin twice is a no-op: the first installation's options, parser rules and renderers stay in effect.

<!-- more -->

## Usage

```ts
import { alert } from "@mdit/plugin-alert";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(alert);

mdIt.render(`
> [!warning]
> Warning Text
`);
```

<!-- markdownlint-disable MD028 -->

## Syntax

With this plugin you can create block alerts with blockquote starting with `[!ALERT_NAME]` like:

```md
> [!warning]
> This is warning text
```

The `ALERT_NAME` isn't case sensitive and can be the following string:

- `note`
- `tip`
- `important`
- `caution`
- `warning`

::: tip Nesting and escaping

- By default, GFM style alerts can only be placed at root, but you can use `deep: true` to enable deep and nesting support:

  ```js
  md.use(alert, {
    deep: true,
  });
  ```

  ```md
  > [!warning]
  > This is warning text
  >
  > > [!warning]
  > > This is a nested warning

  - > [!warning]
    > This is warning text
  ```

  will be

  > [!warning]
  > This is warning text
  >
  > > [!warning]
  > > This is a nested warning
  - > [!warning]
    > This is warning text

- Escaping can be done by adding `\` to escape the `!` `[` or `]` marker:

  ```md
  > [\!warning]
  > This is warning text

  > \[!warning]
  > This is warning text
  ```

  will be

  > [\!warning]
  > This is warning text

  > \[!warning]
  > This is warning text

:::

## Options

::: fields
@`alertNames` type=string[] default=`['tip', 'warning', 'caution', 'important', 'note']`

Allowed alert names.

@`deep` type=boolean default=`false`

Whether to handle deep alert syntax.

@`openRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Hint opening tag render function.

@`closeRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Hint closing tag render function.

@`titleRenderer` type=RendererRule

Hint title render function.

:::

## Demo

::: preview Demo

> [!note]
> This is note text

> [!important]
> This is important text

> [!tip]
> This is tip text

> [!warning]
> This is warning text

> [!caution]
> This is caution text

:::

<!-- markdownlint-enable MD028 -->

::: tip Styles

With default options, you can import `@mdit/plugin-alert/style` to apply styles for alert box.

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-github-alerts`](https://www.npmjs.com/package/markdown-it-github-alerts) package `1.0.1`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |     4 |         12 |                9 |

The following cases are documented differences:

- `uppercase` — The reference lowercases the alert name before capitalizing the default title, so `[!TIP]` renders `Tip`; the current package preserves the written casing and renders `TIP`.
- `list-body` — The reference keeps the marker line's empty paragraph and emits `<p></p>` before the list; the current package consumes the marker line and starts the body with the list.
- `nested-blockquote` — The reference keeps an empty `<p></p>` for the marker line and closes the hoisted alert `<div>` before the nested `</blockquote>`; the current package keeps the nested blockquote inside the alert with balanced tags.
- `nested-alert` — The reference transforms the outermost blockquote because its first inline token starts with the marker, leaving the inner blockquote inside the alert; the current package (`deep: true`) transforms the inner blockquote and keeps the outer quote.
- `empty-body` — The reference accepts a marker with no body and renders an empty alert; the current package requires at least one body line, so the marker stays a literal blockquote.
- `empty-quoted-body` — The reference keeps an empty paragraph for the empty quoted line before the body; the current package consumes the marker line and emits only the body paragraph.
- `custom-title` — The reference treats trailing text after the marker as a custom title; the current package rejects the marker when anything but spaces follows `]`, so it stays a literal blockquote.
- `escaped-bracket` — The reference's regex accepts an optional backslash before `[`, so `\[!note]` is still parsed as an alert; the current package treats the escaped bracket as literal text, as documented.
- `hr-before-marker` — The reference searches the first inline token of the blockquote and therefore finds the marker after an `<hr>`; the current package only accepts the marker on the first line of the blockquote.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          17,243 |            17,098 | 1.01× |
| normal/medium |           2,481 |             2,501 | 0.99× |
| normal/large  |             787 |               796 | 0.99× |
| heavy/small   |           8,224 |             8,179 | 1.01× |
| heavy/medium  |           1,646 |             1,658 | 0.99× |
| heavy/large   |             429 |               435 | 0.99× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series          | Sizes                    | Current exponent | Reference exponent |
| --------------- | ------------------------ | ---------------: | -----------------: |
| alert-rows      | 250 / 500 / 1000 / 2000  |            ~1.02 |              ~1.01 |
| long-alert-body | 500 / 1000 / 2000 / 4000 |            ~1.00 |              ~0.99 |
| nested-alerts   | 250 / 500 / 1000 / 2000  |            ~1.02 |              ~1.01 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                                     | Unpacked size | Entry gzip |
| ------------------------------------------- | ------------: | ---------: |
| @mdit/plugin-alert (current)                |       57.4 kB |     1.4 kB |
| markdown-it-github-alerts@1.0.1 (reference) |       15.0 kB |     1.9 kB |

### Notes

- `deep: true` is enabled on the current package because the reference transforms every outermost blockquote after block parsing and therefore recognizes alerts at any nesting depth; the comparison covers nested blockquotes and alerts inside list items.
- The reference's default GitHub SVG icons are disabled with `icons: {}` because the current package has no icon option. This is a documented default-markup difference, not a normalization: with default options the reference title contains an inline `<svg>`, while the current title contains only text.
- `deep: true` and `icons: {}` were measured to be irrelevant for the throughput gap: enabling `deep` costs about 1.6% only on the heavy corpus (one nested alert per unit) and 0% on the normal corpus, and disabling the reference icons changes the reference throughput by about 0.2%. The benchmark difference therefore follows the implementations, not the option mapping.
- Whitespace between block-level tags is normalized because the reference renders its opening `<div>` and title `<p>` without newlines while the current package uses markdown-it's default block renderer; attribute order is normalized by the shared normalizer as well. Text content and code whitespace are preserved.
- The reference removes the marker from the first inline token and keeps the surrounding blockquote content. An alert whose first content line is empty therefore leaves an empty `<p></p>`, and a nested blockquote is hoisted into the alert. The current package consumes the marker line before parsing the body, so those structural differences remain visible in the `list-body`, `nested-blockquote`, `empty-quoted-body` and `nested-alert` cases.
- Parse-level differences are documented rather than normalized: the reference supports a custom title from trailing text (`> [!note] Title`), accepts a marker without any body, treats `\[!note]` as an alert, and finds a marker in the first inline token even after another block such as `<hr>`. The current package requires the marker line to contain only the marker, requires body content, and honors the escaped bracket. See the matching diff cases.
- Default title casing differs: the reference lowercases the marker before capitalizing it (`[!TIP]` → `Tip`), while the current package capitalizes the written name and preserves its casing (`[!TIP]` → `TIP`).
- Both sides use the same five case-insensitive alert names and the default `markdown-alert` class prefix. The reference's `classPrefix` / `titles` options and the current package's `openRenderer` / `closeRenderer` / `titleRenderer` hooks have no counterpart on the other side and are left at their defaults.
- Scaling: the reference scans a blockquote's token range once per outermost blockquote and the current package scans each alert body once, so `alert-rows`, `long-alert-body` and `nested-alerts` all grow linearly; no superlinear path was found.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
