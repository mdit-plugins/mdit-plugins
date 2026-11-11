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

Extra attributes for the reference element, the `<sup class="footnote-ref">` wrapper. `class` is merged with the default `footnote-ref` class, other attributes override the generated ones.

@`itemAttrs` type=`Record<string, string | number>`

Extra attributes for each footnote item, the `<li id="footnoteN" class="footnote-item">` element. `class` is merged with the default `footnote-item` class, other attributes override the generated ones, including the generated `id`.

@`backrefAttrs` type=`Record<string, string | number>`

Extra attributes for the backreference link, the `<a class="footnote-backref">` element. `class` is merged with the default `footnote-backref` class, other attributes override the generated ones, including the generated `href`.

@`containerAttrs` type=`Record<string, string | number>`

Extra attributes for the footnote container, the `<section class="footnotes">` element. `class` is merged with the default `footnotes` class, other attributes override the generated ones.

:::

Attribute names that cannot be serialized safely are ignored, including empty names, names containing whitespace or control characters, `"`, `'`, `/`, `<`, `=` and `>`. Empty `class` values are ignored as well.

`refAttrs` applies to the `<sup>` wrapper only, so an `href` or `id` there changes neither link. Link targets are generated data, so overriding one of them requires updating the matching token data: overriding the item `id` through `itemAttrs` breaks the forward link unless `meta.href` of `footnote_ref` is updated; overriding the back-reference `href` through `backrefAttrs` does not affect the forward link, but the back-reference no longer reaches the anchor; changing the anchor `id` inside the reference requires updating `meta.anchorId` of `footnote_ref` and the `href` of `footnote_anchor`.

## Customizing Output

The plugin resolves every rendered attribute and piece of render data while parsing and stores it on the token: element attributes on `token.attrs`, generated ids, hrefs, classes and texts on `token.meta`. The render rules only serialize those values, so a core rule can adjust the output by editing the tokens after the `footnoteTail` core rule.

```ts
import { footnote } from "@mdit/plugin-footnote";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(footnote);

mdIt.core.ruler.after("footnoteTail", "customize-footnote", (state) => {
  for (const token of state.tokens) {
    if (token.type === "footnote_block_open") {
      token.attrJoin("class", "custom-notes");
    } else if (token.type === "footnote_anchor" && token.meta) {
      token.meta.text = "↑";
    }
  }
});
```

Footnotes are numbered in the order of the first reference. The index assignment is not configurable, while the rendered caption can still be overridden through the `footnote_caption` render rule. Anchor names are resolved while parsing, so the previous internal `footnote_anchor_name` helper is gone; update the generated ids and `href`s on the tokens instead: `meta.href` and `meta.anchorId` of `footnote_ref`, the `id` attribute of `footnote_open`, and the `href` attribute of `footnote_anchor`. Fields such as `meta.id` and `meta.subId` are internal parse state; modifying them may desynchronize the generated references.

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
