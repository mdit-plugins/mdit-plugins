---
title: "@mdit/plugin-anchor"
icon: link
---

Plugin to add `id` attributes to headings and optionally permalinks.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { anchor } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt().use(anchor);

mdIt.render("# Heading");
```

With a custom slugify:

```ts
import MarkdownIt from "markdown-it";
import { anchor } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt().use(anchor, {
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

## Demo

::: preview Demo

### Hello World

Lorem ipsum dolor sit amet.

#### Sub Section

Consectetur adipiscing elit.

:::

## Options

### level

- Type: `number | number[]`
- Default: `1`
- Details: Heading levels to add anchors to. A number means "the given level and deeper (e.g. `2` selects h2–h6)", an array means "exact levels".

### slugify

- Type: `(str: string) => string`
- Details: Custom slugification function to transform heading text to URL-friendly slugs.

By default it lowercases ASCII letters, keeps non-ASCII characters (e.g. CJK), folds whitespace and dashes into a single dash, and strips other ASCII punctuation. If you want strictly percent-encoded slugs instead, use the exported `legacySlugify`:

```ts
import MarkdownIt from "markdown-it";
import { anchor, legacySlugify } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt().use(anchor, { slugify: legacySlugify });
```

### slugifyWithState

- Type: `(str: string, state: StateCore) => string`
- Details: Like `slugify` but with access to the markdown-it state, e.g. to use `state.env`.

### getTokensText

- Type: `(tokens: Token[]) => string`
- Details: Custom function to extract the text contents from heading tokens. By default includes `text` and `code_inline` tokens.

### uniqueSlugStartIndex

- Type: `number`
- Default: `1`
- Details: Starting index for duplicate slug numbering. Set to `2` to get `title`, `title-2`, `title-3`.

### permalink

- Type: `PermalinkGenerator`
- Details: A function to render permalinks. See [Permalinks](#permalinks) below. Use one of the provided presets or provide your own.

### callback

- Type: `(token: Token, info: AnchorInfo) => void`
- Details: Called after rendering each heading with the `token` and an `info` object containing `slug` and `title`.

### tabIndex

- Type: `string | number | false`
- Default: `"-1"`
- Details: Value of the `tabindex` attribute on headings. We set `-1` by default, which marks headings as focusable but not reachable by keyboard — screen readers will read the title when jumped to. Set to `false` to remove the attribute.

::: tip Manual ID support

You can manually set heading IDs via [@mdit/plugin-attrs](./attrs.md). Make sure to load attrs **before** anchor:

```ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";
import { anchor } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt()
  .use(attrs, { allowed: ["id"] })
  .use(anchor);

mdIt.render("# My Title {#custom-id}");
```

The anchor plugin will reuse the existing `id`.

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
import MarkdownIt from "markdown-it";
import { anchor, linkAfterHeader } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt().use(anchor, {
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
