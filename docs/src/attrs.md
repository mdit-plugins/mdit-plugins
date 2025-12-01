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
![img](link/to/image.png) {.full-width}
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

You can pass options to `@mdit-plugin-attrs` to customize plugin behavior.

The `rule` option allows you to specify which rules to enable. The default is `"all"`, which enables all rules. This is the most important one, as it controls which Markdown elements will have attrs enabled and affects the performance of the plugin.

If you only need id attrs for headings (for most cases), you shall set `rule: ["heading"]` to only enable attrs for headings.

```ts
type MarkdownItAttrRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "hr"
  | "heading"
  | "softbreak"
  | "block";

interface MarkdownItAttrsOptions {
  /**
   * left delimiter
   *
   * @default '{'
   */
  left?: string;

  /**
   * right delimiter
   *
   * @default '}'
   */
  right?: string;

  /**
   * allowed attributes
   *
   * @description An empty list means allowing all attribute
   *
   * @default []
   */
  allowed?: (string | RegExp)[];

  /**
   * Rules to enable
   *
   * @default "all"
   */
  rule?: "all" | boolean | MarkdownItAttrRuleName[];
}
```

## Demo

> ALl class are styled with `margin: 4px;padding: 4px;border: 1px solid red;` to show the effect.

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

<style scope>
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
