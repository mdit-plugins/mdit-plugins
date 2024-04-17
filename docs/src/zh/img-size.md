---
title: "@mdit/plugin-img-size"
icon: resize
---

支持设置图片尺寸的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { imgSize } from "@mdit/plugin-img-size";

const mdIt = MarkdownIt().use(imgSize);

mdIt.render("![image](https://example.com/image.png =300x200)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { imgSize } = require("@mdit/plugin-img-size");

const mdIt = MarkdownIt().use(imgSize);

mdIt.render("![image](https://example.com/image.png =300x200)");
```

:::

## 语法

你可以在图片链接末尾使用 `=widthxheight` 来指定图片尺寸。

`width` 和 `height` 都应该为数字并意味着像素单位的尺寸，并且它们两者都是可选的。整个标记应该通过空格与图片链接相分割。

```md
![Alt](/example.png =200x300)

![Alt](/example.jpg "Image title" =200x)
![Alt](/example.bmp =x300)
```

会被解析为

```html
<img src="/example.png" width="200" height="300" />
<img src="/example.jpg" title="Image title" width="200" />
<img src="/example.bmp" height="300" />
```

## 示例

::: md-demo 示例

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

:::
