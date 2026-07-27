---
title: "@mdit/plugin-attrs"
icon: code
---

Plugins to add attrs to Markdown content.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";

const mdIt = MarkdownIt().use(attrs, {
  // your options, optional
});

mdIt.render("# Heading 🎉{#heading}");
```

## Syntax

You can use `{attrs}` to add attrs to Markdown content.

For example, if you want a heading2 "Hello World" with a id "say-hello-world", you can write:

```md
## Hello World {#say-hello-world}
```

If you want a image with class "full-width", you can write:

```md
![img](link/to/image.png){.full-width}
```

Also, other attrs are supported, so:

```md
A paragraph with some text. {#p .a .b align=center customize-attr="content with spaces"}
```

will be rendered into:

```html
<p id="p" class="a b" align="center" customize-attr="content with spaces">
  A paragraph with some text.
</p>
```

::: tip Escaping

Escaping can be done by adding `\` to escape the delimiter:

```md
### Heading \{#heading}
```

will be

### Heading \{#heading}

:::

## Advanced

You can pass options to `@mdit/plugin-attrs` to customize plugin behavior.

### rule

- Type: `"all" | boolean | MarkdownItAttrRuleName[]`

```ts
type MarkdownItAttrRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "hr"
  | "heading"
  | "softbreak"
  | "blockInfo"
  | "blockEnd"
  // legacy alias of "blockEnd"
  | "block"
  // opt-in, excluded from "all"
  | "tasklist"
  | "dl";
```

- Default: `"all"`
- Details: Rules to enable.

  The default is `"all"`, which enables all rules. This is the most important option, as it controls which Markdown elements will have attrs enabled and affects the performance of the plugin.

  If you only need id attrs for headings (for most cases), you shall set `rule: ["heading"]` to only enable attrs for headings.

  The `fence` rule only applies to fenced code blocks, while the `blockInfo` rule covers other block tokens carrying attributes on their info line (e.g.: containers from `@mdit/plugin-container`). The `blockEnd` rule applies attributes written at the end of a block element - `block` is its legacy alias.

  The `tasklist` rule supports task list plugins that wrap item contents in a label (e.g. `@mdit/plugin-tasklist`). Task lists are not part of core markdown-it, so this rule must be enabled explicitly in the rule array and is excluded from `"all"`. The `dl` rule does the same for definition lists (e.g. `@mdit/plugin-dl`), whose paragraph-wrapped definitions hide attributes from the other rules.

  The package exports the rule name lists as `DEFAULT_RULES` (the `"all"` set) and `EXTENSION_RULES`, so you can tweak the defaults without hardcoding them:

  ```ts
  mdIt.use(attrs, { rule: DEFAULT_RULES.filter((name) => name !== "fence") });
  ```

### allowed

- Type: `(string | RegExp)[]`
- Default: `[]`
- Details: Allowed attributes. An empty list means allowing all attributes.

### left

- Type: `string`
- Default: `'{'`
- Details: Left delimiter for attributes.

### right

- Type: `string`
- Default: `'}'`
- Details: Right delimiter for attributes.

## Demo

> All classes are styled with `margin: 4px;padding: 4px;border: 1px solid red;` to show the effect.

::: preview Inline

Text with `inline code`{.inline-code} and ![favicon](/favicon.ico){.image}, also supporting _emphasis_{.inline-emphasis} and **bold**{.inline-bold}.

:::

::: preview Block

block content {.block}

:::

::: preview Fence

```js {.fence}
const a = 1;
```

:::

> No red border here: the syntax highlighter used by these docs replaces the fence renderer and drops the attributes, as most code highlighting setups do.

::: preview Table

| A                        | B   | C   | D              |
| ------------------------ | --- | --- | -------------- |
| A1                       | B1  | C1  | D1 {rowspan=3} |
| A2 {colspan=2 rowspan=2} | B2  | C2  | D2             |
| A3                       | B3  | C3  | D3             |

{.table border=1}

:::

::: preview List

- list item{.list-item}
  - nested list item
    {.nested}

{.list-wrapper}

:::

::: preview Horizontal Rule

--- {.horizontal}

:::

::: preview Softbreak

A line with break  
{.break}

:::

<style scoped>
.block,
.break,
.horizontal,
.image,
.inline-code,
.list-wrapper,
.list-item,
.nested,
.inline-emphasis,
.inline-bold,
.table,
.fence {
  margin: 4px;
  padding: 4px;
  border: 1px solid red;
}
</style>
