---
title: "@mdit/plugin-spoiler"
shortTitle: "plugin-spoiler"
icon: eraser
---

用于隐藏内容的插件。

<!-- more -->

## 使用

```ts
import { spoiler } from "@mdit/plugin-spoiler";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope !!十分强大!!。");
```

在使用默认选项的情况下，你可以导入 `@mdit/plugin-spoiler/style` 以应用相应样式。

## 格式

使用 `!! !!` 进行标记。

## 选项

::: fields
@`tag` type=string default=`"span"`

剧透元素的 HTML 标签名称。

@`attrs` type=`[attr: string, value: string][] | (() => [attr: string, value: string][])` default=`() => [["class", "spoiler"], ["tabindex","-1"]]`

剧透元素的自定义 HTML 属性。静态数组会为每个令牌克隆一份；工厂函数会为每个令牌调用一次，且必须返回新数组（推荐用于动态属性）。

:::

## 示例

::: preview 示例

VuePress Theme Hope !!十分强大!!。

:::
