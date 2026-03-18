---
title: "@mdit/plugin-spoiler"
icon: eraser
---

用于隐藏内容的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { spoiler } from "@mdit/plugin-spoiler";

const mdIt = MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope !!十分强大!!。");
```

在使用默认选项的情况下，你可以导入 `@mdit/plugin-spoiler/style` 以应用相应样式。

## 格式

使用 `!! !!` 进行标记。

## 示例

::: preview 示例

VuePress Theme Hope !!十分强大!!。

:::

## 选项

### tag

- 类型：`string`
- 默认值：`"span"`
- 详情：剧透元素的 HTML 标签名称。

### attrs

- 类型：`[attr: string, value: string][]`
- 默认值：`[["class", "spoiler"], ["tabindex","-1"]]`
- 详情：剧透元素的自定义 HTML 属性。
