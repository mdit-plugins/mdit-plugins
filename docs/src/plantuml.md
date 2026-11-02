---
title: "@mdit/plugin-plantuml"
shortTitle: "plugin-plantuml"
icon: diagram-project
---

Plugin to support plant uml base on [@mdit/plugin-uml](uml.md).

<!-- more -->

## Usage

```ts
import { plantuml } from "@mdit/plugin-plantuml";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(plantuml);

mdIt.render(`\
@startuml
Bob -> Alice : hello
@enduml
`);
```

## Options

:::: fields
@`type` type=`"uml" | "fence"` default=`"uml"`

Plantuml parse type.

@`name` type=string default=`"uml"`

Diagram type. Only available when using default srcGetter.

@`fence` type=string

Fence info. Defaults to the value of `name`.

@`open` type=string

Opening marker. Only available with type "uml". Defaults to `"start" + name`.

@`close` type=string

Closing marker. Only available with type "uml". Defaults to `"end" + name`.

@`server` type=string default=`"https://www.plantuml.com/plantuml"`

Plantuml server. Only available when using default srcGetter.

::: warning External requests

With the default `srcGetter`, the diagram source is sent to the configured PlantUML server (`https://www.plantuml.com/plantuml` by default), which is an external request that may leak diagram content. Self-host the server or provide a custom `renderer` when the diagram source is sensitive.

:::

@`format` type=string default=`"svg"`

Image format. Only available when using default srcGetter.

@`srcGetter` type=`(content: string) => string`

Image src getter. Takes diagram content and returns image link.

@`renderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Diagram renderer.

::::

## Demo

::: preview demo

@startuml
Bob -> Alice : hello
@enduml

:::

::: preview Non-ascii demo

@startuml
Bob -> Alice : 你好
@enduml

:::

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-plantuml`](https://www.npmjs.com/package/markdown-it-plantuml) package `1.4.1`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    24 |     6 |         10 |                8 |

The following cases are documented differences:

- `list-item` — The current package strips the list indentation from the diagram source, while the reference keeps the two leading spaces of the content line. The rendered list and `<img>` structure are identical.
- `blockquote` — The reference slices `state.src` without removing blockquote markers, so the `>` prefix leaks into the diagram source; the current package dedents the quoted lines. The blockquote structure is identical.
- `nested-blockquote` — Same cause as `blockquote`: the reference keeps every `>` prefix in the diagram source, while the current package strips both quote levels. The nested blockquote structure is identical.
- `indented-marker` — Both sides accept the two-space indented marker, but the reference keeps the indentation of the content line in the diagram source and the current package strips it with `dedent`.
- `indented-content` — The current package removes the common indentation of the diagram body, while the reference keeps every line as written. The relative indentation is preserved by `dedent`, so the drawing itself is unchanged.
- `title` — The current package uses the raw marker suffix as alt, including the separating space after `@startuml`; the reference removes that space and inline-parses the title.
- `title-inline-markup` — Besides the separating space, the reference inline-parses the title, so `**Flow**` becomes `Flow` in alt; the current package keeps the raw markers.
- `title-html` — Only the separating space differs: the reference inline-parses `<b>` but keeps it as text in the alt attribute, so both sides end up with the same escaped HTML.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          36,932 |            34,019 | 1.09× |
| normal/medium |           9,063 |             7,248 | 1.25× |
| normal/large  |           3,114 |             1,844 | 1.69× |
| heavy/small   |          97,253 |            38,981 | 2.49× |
| heavy/medium  |          24,580 |             4,156 | 5.91× |
| heavy/large   |           8,286 |               557 | 14.9× |

Geometric mean throughput ratio: 2.82× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series            | Sizes                  | Current exponent | Reference exponent |
| ----------------- | ---------------------- | ---------------: | -----------------: |
| long-diagram-body | 64 / 128 / 256 / 512   |            ~0.98 |              ~0.95 |
| many-diagrams     | 128 / 256 / 512 / 1024 |            ~1.01 |              ~1.94 |
| unmatched-openers | 128 / 256 / 512 / 1024 |            ~1.01 |              ~1.87 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                                | Unpacked size | Entry gzip |
| -------------------------------------- | ------------: | ---------: |
| @mdit/plugin-plantuml (current)        |      390.9 kB |      749 B |
| markdown-it-plantuml@1.4.1 (reference) |       64.1 kB |     1.5 kB |

### Notes

- Both packages parse `@startuml` … `@enduml` blocks and render an `<img>` whose `src` points at a PlantUML server. The current package compresses with its platform deflate implementation (Node: `node:zlib`, browser: pako) and its own base64 variant, while the reference package ships its own deflate implementation, so the encoded URLs are not byte-comparable by design. The source generators are replaced through the documented hooks: `srcGetter` returns the token content on the current side and `generateSource` returns the diagram code on the reference side. The compared `src` is therefore the decoded diagram source (the text that would be compressed into the URL), not the encoded URL. No PlantUML server is contacted and no request is made while rendering.
- The current package parses through `@mdit/plugin-uml` and extracts block content with `state.getLines` plus `dedent`, while the reference slices `state.src` itself. As a result the reference keeps the raw indentation of indented blocks and lists (and even the `>` prefix of blockquotes) in the diagram source, whereas the current package strips it. The `list-item`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` cases document this; block structure itself is identical.
- An untitled diagram gets a different default alt text from each package (`PlantUML Diagram` vs `uml diagram`). Both are arbitrary fallbacks, so the current wording is normalized to the reference one before comparing; explicit titles are not normalized. Attribute order is normalized as well.
- Explicit titles differ by design: the current package uses the raw marker suffix (including the separating space after `@startuml`) and does not inline-parse it, while the reference drops that space and inline-parses the title, so emphasis and code markers disappear from its alt text. The `title`, `title-inline-markup` and `title-html` cases document this.
- The default renderer of each package is kept; only the `src` generator is replaced. Alt text, HTML escaping, block structure and the number of rendered images are therefore compared as produced by both plugins.
- Benchmarks run through the same deterministic renderers, so they measure parsing and markup generation only: the deflate + base64 encoders are bypassed on both sides and are not part of the throughput numbers. The `heavy` corpora contain many diagrams, so their ratios also reflect the reference's per-block document split described below. Corpora stay modest (normal ≈ 1/4/12 KB with one diagram per section, heavy ≈ 0.7/3/9 KB with four diagrams per section).
- Scaling: the reference extracts every block with `state.src.split('\n')`, so each diagram costs O(document size) and many diagrams cost O(blocks × document), i.e. quadratic (`many-diagrams`, and `unmatched-openers`, which places one unclosed marker inside every list item so each item auto-closes its own block). The current package slices only the block lines with `state.getLines` and stays linear in the number of diagrams. `long-diagram-body` is linear on both sides; no superlinear path was found in the current package. Encoding cost is excluded from all series.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
