---
title: "@mdit/plugin-sup"
icon: superscript
---

提供上角标支持的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { sup } from "@mdit/plugin-sup";

const mdIt = new MarkdownIt().use(sup);

mdIt.render("19^th^");
```

## 格式

使用 `^ ^` 进行上角标标注。

::: tip 转义

- 你可以使用 `\` 来转义 `^`:

  ```md
  19\^th^
  ```

  会被渲染为

  19\^th^

:::

## 示例

`19^th^`: 19^th^
