---
title: "@mdit/plugin-anchor"
shortTitle: "plugin-anchor"
icon: anchor
---

Plugin to add `id` attributes to headings and optionally permalinks.

<!-- more -->

## Usage

```ts
import { anchor } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor);

mdIt.render("# Heading");
```

With a custom slugify:

```ts
import { anchor } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor, {
  slugify: (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff-]+/g, "-")
      .replace(/-+/g, "-"),
});

mdIt.render("# Hello World");
```

## Syntax

All headings matching the `level` option will receive `id` and `tabindex` attributes.

## Sharing the slug registry

Used slugs are stored on `env.markdownItAnchor.slugs` (a `{ [slug]: true }`
map). A later plugin loaded after this one can read the same object on
`state.env.markdownItAnchor.slugs`.

The map lives on `env`, so it is shared across `render()` calls that receive
the same object. Pass one `env` when several Markdown sources make up a single
HTML page; pass a new `env` (or omit it) per page.

You can also pre-seed reserved IDs:

```ts
import { anchor } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor);

const env = { markdownItAnchor: { slugs: { h1: true } } };

mdIt.render("# H1", env);
// <h1 id="h1-1" tabindex="-1">H1</h1>

// env.markdownItAnchor.slugs === { h1: true, "h1-1": true }
```

## Options

:::: fields
@`level` type=`number | number[]` default=`1`

Heading levels to add anchors to. A number means "the given level and deeper (e.g. `2` selects h2–h6)", an array means "exact levels".

@`slugify` type=`(str: string) => string`

Custom slugification function to transform heading text to URL-friendly slugs.

By default it lowercases ASCII letters, keeps non-ASCII characters (e.g. CJK), folds whitespace and dashes into a single dash, and strips other ASCII punctuation. If you want strictly percent-encoded slugs instead, use the exported `legacySlugify`:

```ts
import { anchor, legacySlugify } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor, { slugify: legacySlugify });
```

@`slugifyWithState` type=`(str: string, state: StateCore) => string`

Like `slugify` but with access to the markdown-it state, e.g. to use `state.env`.

@`getTokensText` type=`(tokens: Token[]) => string`

Custom function to extract the text contents from heading tokens. By default includes `text` and `code_inline` tokens.

@`uniqueSlugStartIndex` type=number default=`1`

Starting index for duplicate slug numbering. Set to `2` to get `title`, `title-2`, `title-3`.

@`defaultPlaceHolder` type=string default=`"heading"`

Placeholder slug used when a heading has no text content and generates an empty slug (e.g. image-only headings).

@`permalink` type=PermalinkGenerator

A function to render permalinks. See [Permalinks](#permalinks) below. Use one of the provided presets or provide your own.

@`callback` type=`(token: Token, info: AnchorInfo) => void`

Called after rendering each heading with the `token` and an `info` object containing `slug` and `title`.

@`tabIndex` type=`string | number | false` default=`"-1"`

Value of the `tabindex` attribute on headings. We set `-1` by default, which marks headings as focusable but not reachable by keyboard — screen readers will read the title when jumped to. Set to `false` to remove the attribute.

::: tip Manual ID support

You can manually set heading IDs via [@mdit/plugin-attrs](./attrs.md). Make sure to load attrs **before** anchor:

```ts
import { anchor } from "@mdit/plugin-anchor";
import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(attrs, { allowed: ["id"] }).use(anchor);

mdIt.render("# My Title {#custom-id}");
```

The anchor plugin will reuse the existing `id`.

:::

::::

## Demo

::: preview Demo

### Hello World

Lorem ipsum dolor sit amet.

#### Sub Section

Consectetur adipiscing elit.

:::

## Permalinks

The plugin provides four permalink presets. Choose one based on your
accessibility needs.

All renderers share these common options:

| Name          | Description                                     | Default                  |
| ------------- | ----------------------------------------------- | ------------------------ |
| `class`       | The class of the permalink anchor.              | `header-anchor`          |
| `symbol`      | The symbol in the permalink anchor.             | `#`                      |
| `renderHref`  | Custom permalink `href` rendering function.     | `(slug) => \`#${slug}\`` |
| `renderAttrs` | Custom permalink attributes rendering function. | `() => ({})`             |

### headerLink

Wraps the entire heading content in a permalink anchor.

Simple and accessible out of the box. Headings that already contain a link
(either a markdown link or a raw `<a>` tag when `html` is enabled) are left
untouched, since wrapping them would produce invalid nested anchors.

```ts
import { headerLink } from "@mdit/plugin-anchor";
```

**Output:** `<h2 id="title" tabindex="-1"><a class="header-anchor" href="#title">Title</a></h2>`

| Name              | Description                                                             | Default |
| ----------------- | ----------------------------------------------------------------------- | ------- |
| `safariReaderFix` | Add a `<span>` inside the link so Safari shows headings in reader view. | `false` |
|                   | See [common options](#permalinks).                                      |         |

### linkInsideHeader

Inserts a permalink anchor inside the heading, after or before the text.

```ts
import { linkInsideHeader } from "@mdit/plugin-anchor";
```

**Output:** `<h2 id="title" tabindex="-1">Title <a class="header-anchor" href="#title">#</a></h2>`

| Name         | Description                                                                                                | Default |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ------- |
| `space`      | Add a space between the header text and the permalink. Set to a string for custom spacing (e.g. `&nbsp;`). | `true`  |
| `placement`  | Placement of the permalink, can be `before` or `after`.                                                    | `after` |
| `ariaHidden` | Whether to add `aria-hidden="true"` to the permalink.                                                      | `false` |
|              | See [common options](#permalinks).                                                                         |         |

::: warning Accessibility

If you use a symbol like `#`, screen readers will read it as part of
every heading. Consider using `ariaHidden()` or passing accessible HTML
as `symbol`.

:::

### ariaHidden

Alias for `linkInsideHeader` with `ariaHidden: true` by default.

```ts
import { ariaHidden } from "@mdit/plugin-anchor";
```

**Output:** `<h2 id="title" tabindex="-1">Title <a class="header-anchor" href="#title" aria-hidden="true">#</a></h2>`

### linkAfterHeader

Places a permalink anchor **after** the heading block. Offers the most
flexibility for accessible screen reader experiences.

Unlike the other presets, `linkAfterHeader` has no default options — pass at least `assistiveText` and `visuallyHiddenClass` when using the default `visually-hidden` style:

```ts
import { anchor, linkAfterHeader } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor, {
  permalink: linkAfterHeader({
    assistiveText: (title) => `Permalink for ${title}`,
    visuallyHiddenClass: "sr-only",
  }),
});
```

**Output:** `<h2 id="title" tabindex="-1">Title</h2><a class="header-anchor" href="#title"><span class="sr-only">Permalink for Title</span> <span aria-hidden="true">#</span></a>`

| Name                  | Description                                                                                              | Default           |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
| `style`               | The style: `visually-hidden`, `aria-label`, `aria-describedby` or `aria-labelledby`.                     | `visually-hidden` |
| `assistiveText`       | Function taking the title and returning assistive text. Required for `visually-hidden` and `aria-label`. | `undefined`       |
| `visuallyHiddenClass` | The class that makes an element visually hidden. Required for `visually-hidden`.                         | `undefined`       |
| `space`               | Add a space between the assistive text and the permalink symbol.                                         | `true`            |
| `placement`           | Placement of the permalink symbol relative to the assistive text (`before` / `after`).                   | `after`           |
| `wrapper`             | Optional `[opening, closing]` HTML wrapper around the heading + permalink.                               | `null`            |
|                       | See [common options](#permalinks).                                                                       |                   |

### Custom Permalink

If none of the presets suit you, provide your own renderer:

```ts
function customPermalink(slug, opts, state, idx) {
  // Modify state.tokens around idx to build your permalink
}

mdIt.use(anchor, { permalink: customPermalink });
```

Where `state` is a markdown-it `StateCore` instance, and `idx` is the
index of the `heading_open` token. The `heading_open` token is followed
by an `inline` token containing the heading text, then `heading_close`.

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-anchor`](https://www.npmjs.com/package/markdown-it-anchor) package `10.0.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Variant            | Cases | Exact | Normalized | Documented diffs |
| ------------------ | ----: | ----: | ---------: | ---------------: |
| default            |    22 |    16 |          0 |                6 |
| legacy-slugify     |    22 |    20 |          0 |                2 |
| link-inside-header |    22 |    20 |          0 |                2 |
| header-link        |    22 |    19 |          0 |                3 |

The following cases are documented differences:

- `default/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `default/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.
- `default/heading-punctuation` — Default slugify policy difference: the reference percent-encodes `,`, `!` and `?`, the current default strips them.
- `default/heading-cjk` — Default slugify policy difference: the reference percent-encodes CJK characters, the current default keeps them.
- `default/heading-only-punctuation` — The current default strips all punctuation and falls back to `heading`; the reference keeps `!!!` (percent-encoding leaves `!` untouched).
- `default/heading-html` — With `html: false` the angle brackets are text; the reference percent-encodes them and the current default strips them.
- `legacy-slugify/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `legacy-slugify/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.
- `link-inside-header/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `link-inside-header/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.
- `header-link/heading-with-link` — Our `headerLink` preset leaves this heading untouched; the reference wraps the existing link and emits nested anchors. The `default`, `legacy-slugify` and `link-inside-header` variants match.
- `header-link/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `header-link/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.

### Benchmarks

| Variant            | Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------------ | ------------- | --------------: | ----------------: | ----: |
| default            | normal/small  |          17,455 |            17,380 | 1.00× |
| default            | normal/medium |           2,352 |             2,349 | 1.00× |
| default            | normal/large  |             493 |               504 | 0.98× |
| default            | heavy/small   |           7,580 |             7,659 | 0.99× |
| default            | heavy/medium  |             869 |               896 | 0.97× |
| default            | heavy/large   |              95 |                99 | 0.96× |
| legacy-slugify     | normal/small  |          17,429 |            17,438 | 1.00× |
| legacy-slugify     | normal/medium |           2,352 |             2,364 | 1.00× |
| legacy-slugify     | normal/large  |             483 |               496 | 0.97× |
| legacy-slugify     | heavy/small   |           7,521 |             7,608 | 0.99× |
| legacy-slugify     | heavy/medium  |             840 |               876 | 0.96× |
| legacy-slugify     | heavy/large   |              87 |                93 | 0.94× |
| link-inside-header | normal/small  |          15,316 |            15,327 | 1.00× |
| link-inside-header | normal/medium |           2,079 |             2,091 | 0.99× |
| link-inside-header | normal/large  |             434 |               454 | 0.95× |
| link-inside-header | heavy/small   |           5,394 |             5,416 | 1.00× |
| link-inside-header | heavy/medium  |             664 |               696 | 0.95× |
| link-inside-header | heavy/large   |              79 |                87 | 0.91× |
| header-link        | normal/small  |          15,567 |            15,832 | 0.98× |
| header-link        | normal/medium |           2,091 |             2,152 | 0.97× |
| header-link        | normal/large  |             436 |               464 | 0.94× |
| header-link        | heavy/small   |           5,584 |             5,907 | 0.95× |
| header-link        | heavy/medium  |             674 |               734 | 0.92× |
| header-link        | heavy/large   |              80 |                90 | 0.89× |

Geometric mean throughput ratio: 0.97× across 24 cases; above 1× means the current package is faster.

### Scaling

| Variant            | Series                 | Sizes                     | Current exponent | Reference exponent |
| ------------------ | ---------------------- | ------------------------- | ---------------: | -----------------: |
| default            | duplicate-headings     | 128 / 256 / 512 / 1024    |            ~1.91 |              ~1.90 |
| default            | heading-inline-content | 256 / 512 / 1024 / 2048   |            ~1.04 |              ~1.07 |
| default            | unique-headings        | 1024 / 2048 / 4096 / 8192 |            ~1.06 |              ~1.33 |
| legacy-slugify     | duplicate-headings     | 128 / 256 / 512 / 1024    |            ~1.92 |              ~1.91 |
| legacy-slugify     | heading-inline-content | 256 / 512 / 1024 / 2048   |            ~1.04 |              ~1.07 |
| legacy-slugify     | unique-headings        | 1024 / 2048 / 4096 / 8192 |            ~1.07 |              ~1.33 |
| link-inside-header | duplicate-headings     | 128 / 256 / 512 / 1024    |            ~1.81 |              ~1.78 |
| link-inside-header | heading-inline-content | 256 / 512 / 1024 / 2048   |            ~1.06 |              ~1.07 |
| link-inside-header | unique-headings        | 1024 / 2048 / 4096 / 8192 |            ~1.28 |              ~1.29 |
| header-link        | duplicate-headings     | 128 / 256 / 512 / 1024    |            ~1.82 |              ~1.81 |
| header-link        | heading-inline-content | 256 / 512 / 1024 / 2048   |            ~1.06 |              ~1.08 |
| header-link        | unique-headings        | 1024 / 2048 / 4096 / 8192 |            ~1.32 |              ~1.32 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                               | Unpacked size | Entry gzip |
| ------------------------------------- | ------------: | ---------: |
| @mdit/plugin-anchor (current)         |       76.9 kB |     2.2 kB |
| markdown-it-anchor@10.0.0 (reference) |      138.7 kB |     2.2 kB |

### Notes

- The `default` variant uses the defaults of both packages. The current package intentionally ships a different default slugify than the reference legacy percent-encoding slugify: it lowercases ASCII, keeps non-ASCII characters (e.g. CJK), folds whitespace and dashes into a single dash and strips other ASCII punctuation. Headings with punctuation, CJK or raw HTML text therefore produce different ids; those cases carry a `note`. Generated ids are compared byte for byte and are never normalized.
- The `legacy-slugify` variant configures the current package with its exported `legacySlugify`, which is byte-identical to the reference default slugify, so every heading id matches.
- `link-inside-header` compares the `linkInsideHeader` permalink presets with the same `class` and `symbol` options and a matching slugify. Markup is identical except for the empty-slug placeholder difference.
- `header-link` compares the `headerLink` presets. The current preset leaves headings that already contain a link untouched, because wrapping them would emit invalid nested `<a>` elements, while the reference wraps the existing link; that case carries a `note`.
- Empty slugs are behavior, not a formatting difference: for headings without text (image-only or empty headings) the reference emits `id=""`, while the current package falls back to its `defaultPlaceHolder` option (`heading`). These cases carry a `note`.
- Manual heading ids (e.g. set by plugin-attrs) are not compared: both packages reuse a preset id and both throw on duplicate explicit ids (reference default `failOnNonUnique: true`; the current package has no option to disable the failure).
- Scaling: `duplicate-headings` is quadratic in both packages, because the unique-slug loop rescans the used-slug map for every duplicate. `unique-headings` exposes the leftover `state.tokens.indexOf(token)` call the reference executes for every heading after the permalink step (the O(n²) loop from markdown-it-anchor#80); without a permalink renderer the current package does not rescan tokens, with one it does. `heading-inline-content` is the linear baseline.
- Benchmarks render fixed corpora (`normal` = sparse headings, `heavy` = heading-dense) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.
- Only attribute order is normalized (the harness default); no other normalization is applied.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
