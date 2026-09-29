---
title: "@mdit/plugin-uml"
shortTitle: "plugin-uml"
icon: scissors
---

支持从上下文中拆分内容的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { uml } from "@mdit/plugin-uml";

const mdIt = new MarkdownIt().use(uml, {
  name: "demo",
  open: "demostart",
  close: "demoend",
  renderer: (tokens, index) => {
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

该插件会将 `@openmarker` 和 `@closemarker` 之间的内容提取到单个 Token 中，然后使用 `renderer` 函数对其进行渲染。

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

## 选项

::: fields
@`name` type=string required

UML 名称。

@`open` type=string required

开始标记。

@`close` type=string required

结束标记。

@`renderer` type=RendererRule required

<!-- @include: ../render-rule.snippet.md -->

渲染函数。

:::
