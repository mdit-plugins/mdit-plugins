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

## Options

::: fields
@`refAttrs` type=`Record<string, string | number>`

Extra attributes for the footnote reference marker, i.e. the `<sup class="footnote-ref">` element wrapping the reference link.

A `class` value is merged with the built-in `footnote-ref` class. Other attributes are set on the element and override the generated ones.

@`itemAttrs` type=`Record<string, string | number>`

Extra attributes for each footnote item, i.e. the `<li id="footnote…" class="footnote-item">` element.

A `class` value is merged with the built-in `footnote-item` class. Other attributes are set on the element and override the generated ones. Overriding `id` breaks the `href` anchors.

@`backrefAttrs` type=`Record<string, string | number>`

Extra attributes for the back-reference links, i.e. the `<a href="#footnote-ref…" class="footnote-backref">` elements at the end of each footnote item.

A `class` value is merged with the built-in `footnote-backref` class. Other attributes are set on the element and override the generated ones.

@`containerAttrs` type=`Record<string, string | number>`

Extra attributes for the footnote container, i.e. the `<section class="footnotes">` element wrapping the ordered list and every footnote item. The `<hr class="footnotes-sep">` separator is emitted immediately before the section.

A `class` value is merged with the built-in `footnotes` class. Other attributes are set on the element and override the generated ones.
:::

The footnote markup is rendered from standard markdown-it tokens (`section_open`, `ordered_list_open`, `list_item_open`, `sup_open`, `link_open`, ...) by the default renderer. The options above cover the common cases; for anything else, modify those tokens in a core rule (for example with `attrJoin`) or override their renderer rules.

## Breaking Changes

::: warning v2 is a breaking major release

The plugin now emits standard markdown-it tokens instead of custom `footnote_*` tokens. Review the following changes before upgrading:

- The internal `footnote_ref`, `footnote_block_open`, `footnote_block_close`, `footnote_open`, `footnote_close` and `footnote_anchor` renderer rules are no longer registered. Override the standard token rules (`sup_open`, `section_open`, `ordered_list_open`, `list_item_open`, `link_open`, ...) instead.
- Core rules no longer see `footnote_ref` or any other `footnote_*` token in the final token stream. Modify the standard tokens instead.
- `FootNoteToken.meta.subId` and `FootNoteToken.meta.label` are now optional: inline references and inline notes do not set them.
- `env.docId` is interpolated into generated ids and `href` values as-is and escaped once by the default renderer. The rendered HTML is unchanged, but token attribute values are no longer pre-escaped.
- Image alt text no longer includes footnote reference markers: `![a[^1]](img.png)` still renders `alt="a"`.

:::

### Migration

Before (v1), renderer overrides used the internal rules:

```ts
md.renderer.rules.footnote_ref = (tokens, idx) => "...";
```

After (v2), use the options above or modify the standard tokens:

```ts
md.use(footnote, { refAttrs: { "data-kind": "reference" } });

md.core.ruler.push("footnote-custom", (state) => {
  for (const token of state.tokens) {
    if (token.type === "section_open") token.attrJoin("class", "custom-notes");
  }
});
```

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

---

> See the [comparison report](compare.md) for the full upstream comparison.

<!-- comparison:end -->
