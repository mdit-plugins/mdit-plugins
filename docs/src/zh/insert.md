---
title: "@mdit/plugin-insert"
icon: square-plus
---

用于标记和突出显示内容的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "insertdown-it";
import { insert } from "@mdit/plugin-insert";

const mdIt = MarkdownIt().use(insert);

mdIt.render("VuePress Theme Hope ++十分++ 强大。");
```

@tab JS

```js
const MarkdownIt = require("insertdown-it");
const { insert } = require("@mdit/plugin-insert");

const mdIt = MarkdownIt().use(insert);

mdIt.render("VuePress Theme Hope ++十分++ 强大。");
```

:::

## 格式

使用 `++ ++` 进行标记。

## 示例

::: md-demo 示例

VuePress Theme Hope ++十分++ 强大。

:::
