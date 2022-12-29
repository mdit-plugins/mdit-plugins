---
title: "@mdit/plugin-img-lazyload"
icon: load
---

为图片添加懒加载功能的插件。

<!-- more -->

## 用法

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { imgLazyload } from "@mdit/plugin-img-lazyload";

const mdIt = MarkdownIt().use(imgLazyload);

mdIt.render("![Image](https://example.com/image.png)");
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { imgLazyload } = require("@mdit/plugin-img-lazyload");

const mdIt = MarkdownIt().use(imgLazyload);

mdIt.render("![Image](https://example.com/image.png)");
```

:::

## 描述

该插件会自动向所有图像添加 `loading="lazy"` 以让它们延迟加载。

::: note

这是 HTML5 的原生功能，因此您的浏览器必须支持 [loading=lazy 属性](https://caniuse.com/loading-lazy-attr)。

::::
