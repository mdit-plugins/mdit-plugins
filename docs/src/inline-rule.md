---
title: "@mdit/plugin-inline-rule"
icon: wand-magic-sparkles
---

A unified inline syntax factory plugin for creating custom punctuation-based inline tags.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { inlineRule } from "@mdit/plugin-inline-rule";

const mdIt = MarkdownIt().use(inlineRule, {
  marker: "=",
  tag: "mark",
  token: "mark",
  nested: true,
  placement: "before-emphasis",
});

mdIt.render("==highlighted==");
// <p><mark>highlighted</mark></p>
```

## Options

### marker

- Type: `string`
- Required

The punctuation character used as the marker (e.g., `"^"`, `"~"`, `"="`).

### tag

- Type: `string`
- Required

HTML tag name for the rendered element (e.g., `"sup"`, `"mark"`, `"span"`).

### token

- Type: `string`
- Required

Token type name used for markdown-it token identification (e.g., `"sup"`, `"mark"`).

### nested

- Type: `boolean`
- Default: `false`

When `false`, uses a high-performance linear scan. No inline tags are parsed inside (e.g., sub/sup). When `true`, uses the delimiter state machine with double markers. Supports nested bold, italic, etc. (e.g., mark/spoiler).

### double

- Type: `boolean`
- Default: `false` (non-nested), forced `true` (nested)

Whether markers must be doubled (e.g., `!!` vs `!`). Nested rules always use double markers.

### placement

- Type: `"before-emphasis" | "after-emphasis"`
- Default: `"after-emphasis"`

Ruler position relative to the core emphasis rule. Use `"before-emphasis"` to override emphasis behavior for the same marker character (e.g., using `_` as a custom tag).

### attrs

- Type: `[string, string][]`
- Default: `undefined`

Custom HTML attributes for the rendered element.

### allowSpace

- Type: `boolean`
- Default: `false`

Whether to allow unescaped spaces inside the content. Only applies to non-nested rules.

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
  placement: "before-emphasis",
  attrs: [["class", "spoiler"]],
});

// !!hidden text!! → <span class="spoiler">hidden text</span>
```

### Custom syntax

```ts
md.use(inlineRule, {
  marker: "?",
  tag: "span",
  token: "help",
  nested: true,
  placement: "before-emphasis",
  attrs: [["class", "help-text"]],
});

// ??help text?? → <span class="help-text">help text</span>
```
