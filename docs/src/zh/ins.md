---
title: "@mdit/plugin-ins"
icon: square-plus
---

添加 ins 标签支持的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { ins } from "@mdit/plugin-ins";

const mdIt = MarkdownIt().use(ins);

mdIt.render("VuePress Theme Hope ++十分++ 强大。");
```

## 格式

使用 `++ ++` 插入 `<ins>` 标签。

## 示例

::: preview 示例

VuePress Theme Hope ++十分++ 强大。

:::
