---
title: "@mdit/plugin-uml"
shortTitle: "plugin-uml"
icon: scissors
---

支持从上下文中拆分内容的插件。

<!-- more -->

## 使用

```ts
import { uml } from "@mdit/plugin-uml";
import MarkdownIt from "markdown-it";

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

::: warning 安全

`title` 属性始终会被转义。遵循 markdown-it 的 `html` 选项语义，默认渲染器仅在 `html: false`（默认值）时转义提取出的内容，因此 UML 块中由作者提供的 HTML 会作为纯文本渲染。当 `html: true` 时，内容会按原始 HTML 保留：该模式下作者 HTML 被信任，请在展示渲染结果前自行 sanitize（markdown-it 不会替你处理）。若需要完全控制，请传入自定义 `renderer`。

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
