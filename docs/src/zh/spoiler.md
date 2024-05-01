---
title: "@mdit/plugin-spoiler"
icon: eraser
---

用于隐藏内容的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "spoilerdown-it";
import { spoiler } from "@mdit/plugin-spoiler";

const mdIt = MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope !!十分强大!!。");
```

@tab JS

```js
const MarkdownIt = require("spoilerdown-it");
const { spoiler } = require("@mdit/plugin-spoiler");

const mdIt = MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope !!十分强大!!。");
```

:::

在使用默认选项的情况下，你可以导入 `@mdit/plugin-spoiler/style` 以应用相应样式。

## 格式

使用 `!! !!` 进行标记。

## 示例

::: md-demo 示例

VuePress Theme Hope !!十分强大!!。

:::

## 选项

```ts
export interface MarkdownItSpoilerOptions {
  /**
   * @default "span"
   */
  tag?: string;

  /**
   * @default [["class", "spoiler"], ["tabindex","-1"]]
   */
  attrs?: [string, string][];
}
```
