---
title: "@mdit/plugin-demo"
icon: lightbulb
---

用于同时展示片段渲染和片段代码。

<!-- more -->

## 使用

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { demo } from "@mdit/plugin-demo";

const mdIt = MarkdownIt().use(demo, {
  // your options
});

mdIt.render(`
::: demo

# Heading 1

Text

:::
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { demo } = require("@mdit/plugin-demo");

const mdIt = MarkdownIt().use(demo, {
  // your options
});

mdIt.render(`
::: demo

# Heading 1

Text

:::
`);
```

::::

## 格式

使用此插件，你可以快速展示 Markdown 片段和其对应的源代码。你可以自定义渲染输出，默认情况下将会渲染出一个 `<details>` 块。

语法与 [container](./container.md) 相同，只不过对应的 `name` 为 `demo`。

## 选项

```ts
interface MarkdownItDemoOptions {
  /**
   * 容器名称
   *
   * @default "demo"
   */
  name?: string;

  /**
   * 代码是否显示在内容前
   *
   * @default false
   */
  showCodeFirst?: boolean;

  /**
   * 开始标签渲染函数
   */
  openRender?: RenderRule;

  /**
   * 结束标签渲染函数
   */
  closeRender?: RenderRule;

  /**
   * 代码渲染函数
   */
  codeRender?: RenderRule;

  /**
   * 内容开始标签渲染函数
   */
  contentOpenRender?: RenderRule;

  /**
   * 内容结束标签渲染函数
   */
  contentCloseRender?: RenderRule;
}
```

## 示例

::: md-demo

## Heading 1

Text

:::

```md
::: md-demo

## Heading 1

Text

:::
```
