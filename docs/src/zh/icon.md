---
title: "@mdit/plugin-icon"
icon: icons
---

支持图标的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { icon } from "@mdit/plugin-icon";

const mdIt = MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { icon } = require("@mdit/plugin-icon");

const mdIt = MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
```

:::

## 语法

使用 `::icon classes::` 插入自定义图标。默认情况下，插件将使用给定的图标类渲染一个 `<i>` 标签，你也可以通过传递自定义渲染器来渲染任何你喜欢的内容。

::: tip 为什么不使用 markdownit-plugin-emoji？

`markdownit-plugin-emoji` 仅支持将已知的表情代码转换为图标，而此插件支持任何自定义图标类。

当你与字体图标库一起使用时，如 Font Awesome、Material Icons 等，这将非常有用。

:::

## 演示

::: md-demo 演示

iPhone 是由 ::apple:: 制造的。

:::
