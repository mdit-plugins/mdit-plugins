---
title: "@mdit/plugin-img-size"
icon: resize
---

Plugins to support image size syntax.

<!-- more -->

## Usage

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

## Syntax

You can use `=widthxheight` to specify the image size at the end of image link.

Both `width` and `height` should be number which means size in pixels, and both of them are optional. The whole marker should be separated with spaces from the image link.

```md
![Alt](/example.png =200x300)

![Alt](/example.jpg "Image title" =200x)
![Alt](/example.bmp =x300)
```

will be parsed as:

```html
<img src="/example.png" width="200" height="300" />
<img src="/example.jpg" title="Image title" width="200" />
<img src="/example.bmp" height="300" />
```

## Demo

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

```md
![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)
```
