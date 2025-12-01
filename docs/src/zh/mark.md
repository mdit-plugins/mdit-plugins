---
title: "@mdit/plugin-mark"
icon: highlighter
---

用于标记和突出显示内容的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { mark } from "@mdit/plugin-mark";

const mdIt = MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope ==十分强大==。");
```

## 格式

使用 `== ==` 进行标记。

## 示例

::: preview 示例

VuePress Theme Hope ==十分强大==。

:::
