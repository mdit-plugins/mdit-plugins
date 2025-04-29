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
import { legacyImgSize, imgSize } from "@mdit/plugin-img-size";

// 新语法 (与 obsidian 相似但略有不同)
const mdIt = MarkdownIt().use(imgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");

// 旧语法
const mdIt2 = MarkdownIt().use(legacyImgSize);

mdIt2.render("![image](https://example.com/image.png =300x200)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { legacyImgSize, imgSize } = require("@mdit/plugin-img-size");

// 新语法 (与 obsidian 相似但略有不同)
const mdIt = MarkdownIt().use(imgSize);

mdIt.render("![image|300x200](https://example.com/image.png)");

// 旧语法
const mdIt2 = MarkdownIt().use(legacyImgSize);

mdIt2.render("![image](https://example.com/image.png =300x200)");
```

:::

## 语法

你可以在图片链接末尾使用 `|widthxheight` 来指定图片尺寸。

`width` 和 `height` 都应该为数字并意味着像素单位的尺寸，并且它们两者都是可选的（设置 `0` 来表示忽略）。

如果你想要与 Obsidian 相同的行为，你可以在插件选项中传递 `{ strict: true }`。现在 `width` 和 `height` 都必须被设置（其中一个可以是 `0` 来根据另一个按比例缩放）。

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

### 旧语法

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

::: tip 从两个语法中选择

你应该选择 Obsidian 语法，因为它不会破坏向后兼容性。

旧语法会在不支持的环境中破坏图片渲染，例如 GitHub。

:::

## 示例

::: md-demo 示例

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::
