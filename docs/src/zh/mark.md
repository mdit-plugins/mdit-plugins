---
title: "@mdit/plugin-mark"
icon: write
---

用于标记和突出显示内容的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { mark } from "@mdit/plugin-mark";

const mdIt = MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { mark } = require("@mdit/plugin-mark");

const mdIt = MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

:::

## 语法

使用 `== ==` 进行标记。

## 示例

VuePress Theme Hope ==十分强大==。

```md
VuePress Theme Hope ==十分强大==。
```
