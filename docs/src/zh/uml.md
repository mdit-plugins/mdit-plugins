---
title: "@mdit/plugin-uml"
icon: file-lines
---

支持从上下文中拆分内容的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { uml } from "@mdit/plugin-uml";

const mdIt = MarkdownIt().use(uml, {
  name: "demo",
  open: "demostart",
  close: "demoend",
  render: (tokens, index) => {
    // render content here
  },
});

mdIt.render(`\
@demostart
Content
Another content
@demoend
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { uml } = require("@mdit/plugin-uml");

const mdIt = MarkdownIt().use(uml, {
  name: 'demo'
  open: 'demostart',
  close: 'demoend',
  render: (tokens, index) => {
    // render content here
  },
});

mdIt.render(`\
@demostart
Content
Another content
@demoend
`);
```

:::

该插件会将 `@openmarker` 和 `@closemarker` 之间的内容提取到单个 Token 中，然后使用 `render` 函数对其进行渲染。

::: tip

该插件与容器插件不同，容器内的内容将被解析为 markdown，而 uml 内的内容将被解析为纯文本并转换为单个 Token。

:::

::: tip 转义

- 你可以使用 `\` 来转义 `@`，因此以下内容不会被解析：

  ```MD
  \@demostart

  \@demoend
  ```

:::

## Options

```ts
interface MarkdownItUMLOptions {
  /**
   * UML 名称
   */
  name: string;

  /**
   * 开始标记
   */
  open: string;

  /**
   * 结束标记
   */
  close: string;

  /**
   * 渲染函数
   */
  render: RenderRule;
}
```
