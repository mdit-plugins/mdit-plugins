---
title: "@mdit/plugin-figure"
icon: image
---

生成带有标题的图片插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { figure } from "@mdit/plugin-figure";

const mdIt = MarkdownIt().use(figure, {
  // 你的选项，可选的
});

mdIt.render("![image](https://example.com/image.png)");
```

## 格式

有时，你可能希望为图像添加描述，并将其单独展示在上下文中，所以我们提供了此插件

当你单独将图片至于一行 (也可同时嵌套链接)，图像将显示为 `<figure>` ，标题或图片替代文字将显示为 `<figcaption>`。

## 选项

```ts
interface MarkdownItFigureOptions {
  /**
   * 图片是否可聚焦
   *
   * @default true
   */
  focusable?: boolean;
}
```

## 示例

::: preview 示例

![Logo](/favicon.ico)

[![Logo](/favicon.ico)](https://commonmark.org/)

![Logo](/favicon.ico "Markdown")

[![Logo](/favicon.ico "Markdown")](https://commonmark.org/)

:::
