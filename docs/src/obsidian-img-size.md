---
title: "@mdit/plugin-img-size (obsidian option)"
icon: up-right-and-down-left-from-center
---

Plugins to support setting size for images. (obsidian syntax version)

<!-- more -->

## Usage

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

## Syntax

You can use `|widthxheight` to specify the image size at the end of image alt.

Both `width` and `height` should be number which means size in pixels, and both of them are optional (or fill in 0 to indicate ignore). The whole marker should be separated with spaces from the image link.

```md
![Alt](/example.png =200x300)

![Alt](/example.jpg "Image title" =200x)
![Alt](/example.bmp =x300)
```

will be parsed as:

```html
<img src="/example.png" width="200" height="300" />
<img src="/example.jpg" width="200" />
<img src="/example.bmp" height="300" />
```

## Demo

::: md-demo Demo

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::
