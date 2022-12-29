---
title: "@mdit/plugin-sub"
icon: subscript
---

提供上角标支持的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "subdown-it";
import { sub } from "@mdit/plugin-sub";

const mdIt = MarkdownIt().use(sub);

mdIt.render("19^th^");
```

@tab JS

```js
const MarkdownIt = require("subdown-it");
const { sub } = require("@mdit/plugin-sub");

const mdIt = MarkdownIt().use(sub);

mdIt.render("19^th^");
```

:::

## 语法

使用 `^ ^` 进行上角标标注。

## 示例

19^th^

```md
19^th^
```
