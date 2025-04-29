---
title: "@mdit/plugin-img-size (obsidian option)"
icon: up-right-and-down-left-from-center
---

支持设置图片尺寸的插件。（obsidian语法版本）

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { imgSize, obsidianImgSize } from "@mdit/plugin-img-size";

const mdIt = MarkdownIt().use(obsidianImgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { imgSize, obsidianImgSize } = require("@mdit/plugin-img-size");

const mdIt = MarkdownIt().use(obsidianImgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");
```

:::

## 语法

你可以在图片Alt区域末尾使用 `|widthxheight` 来指定图片尺寸。

`width` 和 `height` 都应该为数字并意味着像素单位的尺寸，并且它们两者都是可选的 (或填写0表示忽略)。整个标记应该通过空格与图片链接相分割。

```md
![Alt|200x300](/example.png)

![Alt|200x0](/example.jpg)
![Alt|0x300](/example.bmp)
```

会被解析为

```html
<img src="/example.png" width="200" height="300" />
<img src="/example.jpg" width="200" />
<img src="/example.bmp" height="300" />
```

## 示例

::: md-demo 示例

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::
