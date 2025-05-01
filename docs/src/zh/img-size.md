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
import { legacyImgSize, imgSize, obsidianImgSize } from "@mdit/plugin-img-size";

// 新格式
const mdNew = MarkdownIt().use(imgSize);
mdNew.render("![image =300x200](https://example.com/image.png =300x200)");

// Obsidian 格式
const mdObsidian = MarkdownIt().use(obsidianImgSize);
mdObsidian.render("![image|300x200](https://example.com/image.png)");

// 旧格式
const mdLegacy = MarkdownIt().use(legacyImgSize);
mdLegacy.render("![image](https://example.com/image.png =300x200)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const {
  legacyImgSize,
  imgSize,
  obsidianImgSize,
} = require("@mdit/plugin-img-size");

// 新格式
const mdNew = MarkdownIt().use(imgSize);
mdNew.render("![image =300x200](https://example.com/image.png =300x200)");

// Obsidian 格式
const mdObsidian = MarkdownIt().use(obsidianImgSize);
mdObsidian.render("![image|300x200](https://example.com/image.png)");

// 旧格式
const mdLegacy = MarkdownIt().use(legacyImgSize);
mdLegacy.render("![image](https://example.com/image.png =300x200)");
```

:::

## 语法

### 新语法

在图片替代文字后面添加 `=widthxheight`，并用空格分隔。

`width` 和 `height` 都应该是数字，单位为像素，并且都是可选的。

```md
![替代文字 =200x300](/example.png)
![替代文字 =200x](/example.jpg "标题")
![替代文字 =x300](/example.bmp)
```

渲染为 ↓

```html
<img src="/example.png" alt="替代文字" width="200" height="300" />
<img src="/example.jpg" alt="替代文字" title="标题" width="200" />
<img src="/example.bmp" alt="替代文字" height="300" />
```

### Obsidian 语法

在图片替代文字后面添加 `widthxheight`，并用 `|` 分隔。

`width` 和 `height` 都应该是数字，单位为像素，并且都是必需的。设置其中一个为 `0` 以按比例缩放另一个。

```md
![Alt|200x200](/example.png)
![Alt|200x0](/example.jpg)
![Alt|0x300](/example.bmp)
```

渲染为 ↓

```html
<img src="/example.png" alt="Alt" width="200" height="300" />
<img src="/example.jpg" alt="Alt" width="200" />
<img src="/example.bmp" alt="Alt" height="300" />
```

::: tip 在三种语法之间选择

- 旧语法在不支持的环境中会导致图片渲染问题（例如：GitHub）
- 新语法和 Obsidian 语法都与 Markdown 标准兼容，但新语法更自然。

:::

### 旧语法 (已废弃)

::: warning 这种语法可能会在 GitHub 等平台上导致渲染问题。

:::

在图片链接部分的末尾添加 `=widthxheight`，并用空格分隔。

`width` 和 `height` 都应该是数字，单位为像素，并且都是可选的。

```md
![替代文字](/example.png =200x300)
![替代文字](/example.jpg "标题" =200x)
![替代文字](/example.bmp =x300)
```

渲染为 ↓

```html
<img src="/example.png" alt="替代文字" width="200" height="300" />
<img src="/example.jpg" alt="替代文字" title="标题" width="200" />
<img src="/example.bmp" alt="替代文字" height="300" />
```

## 示例

::: md-demo 示例

<!-- 新语法 -->

![Logo =200x200](/logo.svg "Markdown")
![Logo =150x](/logo.svg "Markdown")
![Logo =x100](/logo.svg "Markdown")

<!-- 旧语法 -->

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

<!-- Obsidian 语法 -->

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::
