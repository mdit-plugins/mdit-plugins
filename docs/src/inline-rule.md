---
title: "@mdit/plugin-inline-rule"
shortTitle: "plugin-inline-rule"
icon: wand-magic-sparkles
---

A unified inline syntax factory plugin for creating custom punctuation-based inline tags.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { inlineRule } from "@mdit/plugin-inline-rule";

const mdIt = new MarkdownIt().use(inlineRule, {
  marker: "=",
  tag: "mark",
  token: "mark",
  nested: true,
  double: true,
  placement: "before-emphasis",
});

mdIt.render("==highlighted==");
// <p><mark>highlighted</mark></p>
```

## Options

::: fields
@`marker` type=string required

The punctuation character used as the marker (e.g., `"^"`, `"~"`, `"="`).

@`tag` type=string required

HTML tag name for the rendered element (e.g., `"sup"`, `"mark"`, `"span"`).

@`token` type=string required

Token type name used for markdown-it token identification (e.g., `"sup"`, `"mark"`).

@`nested` type=boolean default=`false`

When `false`, uses a high-performance linear scan. No inline tags are parsed inside (e.g., sub/sup). When `true`, uses the delimiter state machine. Supports nested bold, italic, and other inline rules inside the markers (e.g., mark/spoiler/ins).

@`double` type=boolean default=`false`

Whether markers must be doubled (e.g., `++` vs `+`). Set to `true` for double-marker syntax.

@`placement` type=`"before-emphasis" | "after-emphasis"` default=`"after-emphasis"`

Ruler position relative to the core emphasis rule. Use `"before-emphasis"` to override emphasis behavior for the same marker character (e.g., using `_` as a custom tag).

@`attrs` type=`[attr: string, value: string][]`

Custom HTML attributes for the rendered element.

@`allowSpace` type=boolean default=`false`

Whether to allow unescaped spaces inside the content. Only applies to non-nested rules.

:::

## Examples

### Simple tag (sup)

```ts
md.use(inlineRule, {
  marker: "^",
  tag: "sup",
  token: "sup",
});

// ^text^ → <sup>text</sup>
```

### Nested tag with attributes (spoiler)

```ts
md.use(inlineRule, {
  marker: "!",
  tag: "span",
  token: "spoiler",
  nested: true,
  double: true,
  placement: "before-emphasis",
  attrs: [["class", "spoiler"]],
});

// !!hidden text!! → <span class="spoiler">hidden text</span>
```

### Single-marker nested (ins)

```ts
md.use(inlineRule, {
  marker: "+",
  tag: "ins",
  token: "ins",
  nested: true,
  double: false,
  placement: "before-emphasis",
});

// +inserted+ → <ins>inserted</ins>
// ++nested inserted++ → <ins><ins>nested inserted</ins></ins>
// +**bold** inside+ → <ins><strong>bold</strong> inside</ins>
```

### Custom syntax

```ts
md.use(inlineRule, {
  marker: "%",
  tag: "span",
  token: "help",
  nested: true,
  double: true,
  placement: "before-emphasis",
  attrs: [["class", "help-text"]],
});

// %%help text%% → <span class="help-text">help text</span>
```
