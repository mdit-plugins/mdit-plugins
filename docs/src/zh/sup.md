---
title: "@mdit/plugin-sup"
icon: superscript
---

提供下角标支持的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { sup } from "@mdit/plugin-sup";

const mdIt = MarkdownIt().use(sup);

mdIt.render("19^th^");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { sup } = require("@mdit/plugin-sup");

const mdIt = MarkdownIt().use(sup);

mdIt.render("19^th^");
```

:::

## 格式

使用 `^ ^` 进行下角标标注。

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
