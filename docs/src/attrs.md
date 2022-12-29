---
title: "@mdit/plugin-attrs"
icon: object
---

Plugins to add attrs to Markdown content.

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";

const mdIt = MarkdownIt().use(attrs, {
  // your options, optional
});

mdIt.render("# Heading 🎉{#heading}");
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { attrs } = require("@mdit/plugin-attrs");

const mdIt = MarkdownIt().use(attrs, {
  // your options, optional
});

mdIt.render("# Heading 🎉{#heading}");
```

:::

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
A paragraph with some text. {#p .a .b attrs=center customize-attr="content with spaces"}
```

will be rendered into:

```html
<p id="p" class="a b" attrs="center" customize-attr="content with spaces">
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

```ts
type MarkdownItAttrRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "hr"
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

### Inline

Text with `inline code`{.inline-code} and ![favicon](/favicon.ico){.image}, also supporting _emphasis_{.emphasis} and **bold**{.bold}.

```md
Text with `inline code`{.inline-code} and ![favicon](/favicon.ico){.image}, also supporting _emphasis_{.emphasis} and **bold**{.bold}.
```

### Block

block content {.block}

```md
block content {.block}
```

### Fence

<!-- markdownlint-disable MD033 -->

<!-- This is because VuePress bug -->

<div class="language-javascript" data-ext="js"><pre class="fence language-javascript"><code><span class="token keyword">const</span> a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
</code></pre></div>

<!-- markdownlint-enable MD033 -->

````md
```js {.fence}
const a = 1;
```
````

### Table

| Table   |
| ------- |
| content |

{.table}

```md
| Table   |
| ------- |
| content |

{.table}
```

### List

- list item{.list-item}

  - nested list item
    {.nested}

{.list}

```md
- list item{.list-item}

  - nested list item
    {.nested}

{.list}
```

### Horizontal

--- {.horizontal}

```md
--- {.horizontal}
```

### Softbreak

A line with break  
{.break}

```md
A line with break  
{.break}
```

<style>
.block,
.break,
.horizontal,
.image,
.inline-code,
.list,
.list-item,
.nested,
.emphasis,
.bold,
.table,
.fence {
  margin: 4px;
  padding: 4px;
  border: 1px solid red;
}
</style>
