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

## Usage (Obsidian Version)

Or use the syntax of the obsidian version:

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { obsidianImgSize } from "@mdit/plugin-img-size";

const mdIt = MarkdownIt().use(obsidianImgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { obsidianImgSize } = require("@mdit/plugin-img-size");

const mdIt = MarkdownIt().use(obsidianImgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");
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

## Syntax (Obsidian Version)

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

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::

> [!TIP]
>
> The two optional grammars make it difficult to choose. Which one should I choose?
>
> The advantages of the Obsidian version: Firstly, it is more suitable for users who use the local Obsidian software. Secondly, this grammar adds information in the `alt` area of `![img alt](img url)`, and images can still be displayed correctly in vuepress environments or other markdown environments without plugins. However, the default version cannot.
>
> The default version's advantages: The current functionality is slightly stronger.
