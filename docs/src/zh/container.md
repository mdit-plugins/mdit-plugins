---
title: "@mdit/plugin-container"
icon: box
---

用于创建块级自定义容器的插件。

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { container } from "@mdit/plugin-container";

const mdIt = MarkdownIt().use(container, {
  // your options, name is required
  name: "warning",
});

mdIt.render("# Heading 🎉{#heading}");
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { container } = require("@mdit/plugin-container");

const mdIt = MarkdownIt().use(container, {
  // your options, name is required
  name: "warning",
});

mdIt.render("# Heading 🎉{#heading}");
```

:::

使用此插件，您可以创建块容器，例如:

```md
::: warning
_here be dragons_
:::
```

并指定它们应该如何呈现。如果没有定义渲染器，将创建带有容器名称 class 的 `<div>`：

```html
<div class="warning">
  <em>here be dragons</em>
</div>
```

标记与代码块相同。但是默认情况下，插件使用另一个字符作为标记并且内容由插件呈现为 Markdown 标记。

## 选项

```ts
interface MarkdownItContainerOptions {
  /**
   * 自定义容器的名称
   */
  name: string;

  /**
   * 自定义容器的标识符
   *
   * @default ":"
   */
  marker?: string;

  /**
   * 校验内容是否应该作为此类型容器
   *
   * @param params 标识符后面的内容
   * @param markup 标识字符
   * @returns 是否是此容器类型
   *
   * @default params.trim().split(" ", 2)[0] === name
   */
  validate?: (params: string, markup: string) => boolean;

  /**
   * 开始标签渲染函数
   */
  openRender?: RenderRule;

  /**
   * 结束标签渲染函数
   */
  closeRender?: RenderRule;
}
```

## 示例

### 提示容器

通过添加一些样式和:

```js
md.use(container, {
  name: "hint",
  openRender: (tokens, index, _options) => {
    const token = tokens[index];
    // resolve info (title)
    let info = token.info.trim().slice(4).trim();
    return `<div class="custom-container hint">\n<p class="custom-container-title">${
      info || "提示"
    }</p>\n`;
  },
});
```

你可以像这样写一个提示:

```md
::: hint 这是一个提示
:::

::: hint

这是一个为你准备的**提示**!

- 提示 1
  - 提示 1.1
  - 提示 1.2
- 提示 2

:::
```

::: hint 这是一个提示

:::

::: hint

这是一个为你准备的**提示**!

- 提示 1
  - 提示 1.1
  - 提示 1.2
- 提示 2

:::
