---
title: "@mdit/plugin-img-size"
icon: up-right-and-down-left-from-center
---

Plugins to support setting size for images.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { legacyImgSize, imgSize } from "@mdit/plugin-img-size";

// new grammar (same as obsidian but a little different)
const mdIt = MarkdownIt().use(imgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");

// legacy grammar
const mdIt2 = MarkdownIt().use(legacyImgSize);

mdIt2.render("![image](https://example.com/image.png =300x200)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { legacyImgSize, imgSize } = require("@mdit/plugin-img-size");

// new grammar (same as obsidian but a little different)
const mdIt = MarkdownIt().use(imgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");

// legacy grammar
const mdIt2 = MarkdownIt().use(legacyImgSize);

mdIt2.render("![image](https://example.com/image.png =300x200)");
```

:::

## Syntax

You can use `|widthxheight` to specify the image size at the end of image alt.

Both `width` and `height` should be number which means size in pixels, and both of them are optional (set `0` to indicate ignore).

If you want the same behavior as Obsidian, you can pass `{ strict: true }` in plugin options. Now both `width` and `height` are both required to be set (one of them can be `0` to scale with radio according to the other).

```md
![Logo|200x200](/example.png)

![Logo|200x0](/example.jpg)
![Logo|0x300](/example.bmp)

<!-- These won't work when `strict: true` as obsidian does not support them -->

![Logo|200](/example.jpg)
![Logo|200x](/example.jpg)
![Logo|x300](/example.bmp)
```

will be parsed as:

```html
<img src="/example.png" width="200" height="300" />

<img src="/example.jpg" width="200" />
<img src="/example.bmp" height="300" />

<img src="/example.jpg" width="200" />
<img src="/example.jpg" width="200" />
<img src="/example.bmp" height="300" />
```

### Legacy Grammar

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

::: tip Choosing between 2 Grammars

You shall prefer the Obsidian grammar, as it's not breaking backward compatibility.

The legacy grammar will break image rendering in environment that doesn't support it, such as GitHub.

:::

## Demo

::: md-demo Demo

<!-- Default grammar -->

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

<!-- legacy grammar -->

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

:::
