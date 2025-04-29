---
title: "@mdit/plugin-img-size"
icon: up-right-and-down-left-from-center
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

## 使用 (Obsidian 版本)

或者使用Obsidian版本的语法:

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

## 语法 (Obsidian 版本)

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

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::

> [!TIP]
>
> 两种可选方案让人选择困难。我应该选用哪种？
>
> Obsidian版本优点：一是更适合使用Obsidian本地软件的用户外。二是该语法在 `![img alt](img url)` 中的 `alt` 区域附加信息，在没有插件的vuepress环境/其他markdown环境下依然能正确显示图片。而默认版本的不能。
>
> 默认版本优点：目前的功能性略强。
