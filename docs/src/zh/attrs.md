---
title: "@mdit/plugin-attrs"
icon: object
---

用于向 Markdown 内容添加属性的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";

const mdIt = MarkdownIt().use(attrs, {
  // 你的选项，可选
});

mdIt.render("# Heading 🎉{#heading}");
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { attrs } = require("@mdit/plugin-attrs");

const mdIt = MarkdownIt().use(attrs, {
  // 你的选项，可选
});

mdIt.render("# Heading 🎉{#heading}");
```

:::

## 语法

你可以使用语法 `{attrs}` 来为 Markdown 元素添加属性。

比如，如果你想要一个 id 为 say-hello-world，文字为 Hello World 的二级标题，你可以使用:

```md
## Hello World {#say-hello-world}
```

如果你想要一个有 full-width Class 的图片，你可以使用:

```md
![img](link/to/image.png) {.full-width}
```

同时，其他属性也收到支持:

```md
一个包含文字的段落。 {#p .a .b align=center customize-attr="content with spaces"}
```

会被渲染为:

```html
<p id="p" class="a b" align="center" customize-attr="content with spaces">
  一个包含文字的段落。
</p>
```

::: tip 转义

转义可以通过使用 `\` 来转义标识符来完成:

```md
### 标题 \{#heading}
```

会被渲染为

### 标题 \{#heading}

:::

## 高级

你可以向 `@mdit-plugin-attrs` 传递选项以自定义插件行为。

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
   * 左分隔符
   *
   * @default '{'
   */
  left?: string;

  /**
   * 右分隔符
   *
   * @default '}'
   */
  right?: string;

  /**
   * 允许的属性
   *
   * @description 设置空数组意味着允许所有属性
   *
   * @default []
   */
  allowed?: (string | RegExp)[];

  /**
   * 启用的规则
   *
   * @default "all"
   */
  rule?: "all" | boolean | MarkdownItAttrRuleName[];
}
```

## 示例

> 所有的 class 都使用 `margin: 4px;padding: 4px;border: 1px solid red;` 进行显示以展示效果。

### Inline

包含 `行内代码`{.inline-code} 和 ![favicon](/favicon.ico){.image} 的文字，也支持 _强调_{.inline-emphasis} 和 **加粗**{.inline-bold}。

```md
包含 `行内代码`{.inline-code} 和 ![favicon](/favicon.ico){.image} 的文字，也支持 _强调_{.inline-emphasis} 和 **加粗**{.inline-bold}。
```

### Block

块级元素 {.block}

```md
块级元素 {.block}
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

| 表格 |
| ---- |
| 内容 |

{.table}

```md
| 表格 |
| ---- |
| 内容 |

{.table}
```

### List

- 列表内容{.list-item}

  - 嵌套列表内容
    {.nested}

{.list}

```md
- 列表内容{.list-item}

  - 嵌套列表内容
    {.nested}

{.list}
```

### Horizontal

--- {.horizontal}

```md
--- {.horizontal}
```

### Softbreak

一行换行的文字  
{.break}

```md
一行换行的文字  
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
.inline-emphasis,
.inline-bold,
.table,
.fence {
  margin: 4px;
  padding: 4px;
  border: 1px solid red;
}
</style>
