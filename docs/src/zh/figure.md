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

const mdIt = new MarkdownIt().use(figure, {
  // 你的选项，可选的
});

mdIt.render("![image](https://example.com/image.png)");
```

## 格式

有时，你可能希望为图像添加描述，并将其单独展示在上下文中，所以我们提供了此插件

当你单独将图片至于一行 (也可同时嵌套链接)，图像将显示为 `<figure>` ，标题或图片替代文字将显示为 `<figcaption>`。

## 选项

### focusable

- 类型：`boolean`
- 默认值：`true`
- 详情：图片是否可聚焦。

### linkImage

- 类型：`boolean`
- 默认值：`true`
- 详情：是否将链接图片 (`[![image](url)](link)`) 转换为 figure。

### moveAttrs

- 类型：`boolean | (string | RegExp)[]`
- 详情：

  将图片属性复制或移动到 `<figure>` 上。

  - `true`：**复制**除原生 img 属性（src、alt、srcset、width、height、loading 等）外的所有属性到 `<figure>`，图片保留这些属性。
  - `(string | RegExp)[]`：**移动**仅匹配的属性到 `<figure>`，图片失去这些属性。

  原生 img 属性（src、alt、title、width、height 等）永远不会被移动或复制到 `<figure>` 上，且 `title` 始终作为 `<figcaption>` 内容显示。

  ```ts
  // 复制所有非原生属性到 figure（img 保留）
  moveAttrs: true;

  // 将 class 和 data-* 属性移动到 figure（img 失去）
  moveAttrs: ["class", /^data-/];
  ```

## 示例

::: preview 示例

![Logo](/favicon.ico)

[![Logo](/favicon.ico)](https://commonmark.org/)

![Logo](/favicon.ico "Markdown")

[![Logo](/favicon.ico "Markdown")](https://commonmark.org/)

:::
