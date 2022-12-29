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
import MarkdownIt from "supdown-it";
import { sup } from "@mdit/plugin-sup";

const mdIt = MarkdownIt().use(sup);

mdIt.render("H~2~O");
```

@tab JS

```js
const MarkdownIt = require("supdown-it");
const { sup } = require("@mdit/plugin-sup");

const mdIt = MarkdownIt().use(sup);

mdIt.render("H~2~O");
```

:::

## 语法

使用 `^ ^` 进行下角标标注。

## 示例

H~2~O

```md
H~2~O
```
