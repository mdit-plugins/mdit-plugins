---
title: "@mdit/plugin-attrs"
icon: code
---

用于向 Markdown 内容添加属性的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";

const mdIt = MarkdownIt().use(attrs, {
  // 你的选项，可选
});

mdIt.render("# Heading 🎉{#heading}");
```

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
<p id="p" class="a b" align="center" customize-attr="content with spaces">一个包含文字的段落。</p>
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

你可以向 `@mdit/plugin-attrs` 传递选项以自定义插件行为。

### rule

- 类型：`"all" | boolean | MarkdownItAttrRuleName[]`

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
```

- 默认值：`"all"`
- 详情：启用的规则。

  默认值为 `"all"`，这会启用所有规则。这是最重要的选项，因为它控制哪些 Markdown 元素将启用属性功能，并影响插件的性能。

  如果你只需要为标题添加 id 属性（在大多数情况下），你应该设置 `rule: ["heading"]` 来只为标题启用属性功能。

### allowed

- 类型：`(string | RegExp)[]`
- 默认值：`[]`
- 详情：允许的属性。设置空数组意味着允许所有属性。

### left

- 类型：`string`
- 默认值：`'{'`
- 详情：属性左分隔符。

### right

- 类型：`string`
- 默认值：`'}'`
- 详情：属性右分隔符。

## 示例

> 所有的 class 都使用 `margin: 4px;padding: 4px;border: 1px solid red;` 进行显示以展示效果。

::: preview 行内元素

包含 `行内代码`{.inline-code} 和 ![favicon](/favicon.ico){.image} 的文字，也支持 _强调_{.inline-emphasis} 和 **加粗**{.inline-bold}。

:::

::: preview 块级元素

块级元素 {.block}

:::

::: preview 代码块

```js {.fence}
const a = 1;
```

:::

::: preview 表格

| A                        | B   | C   | D              |
| ------------------------ | --- | --- | -------------- |
| A1                       | B1  | C1  | D1 {rowspan=3} |
| A2 {colspan=2 rowspan=2} | B2  | C2  | D2             |
| A3                       | B3  | C3  | D3             |

{.table border=1}

:::

::: preview 列表

- 列表内容{.list-item}
  - 嵌套列表内容
    {.nested}

{.list-wrapper}

:::

::: preview 水平线

--- {.horizontal}

:::

::: preview 换行

一行换行的文字  
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
