---
title: "@mdit/plugin-img-lazyload"
icon: spinner
---

Plugin to add lazy loading for images.

<!-- more -->

## Usage

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { imgLazyload } from "@mdit/plugin-img-lazyload";

const mdIt = MarkdownIt().use(imgLazyload);

mdIt.render("![Image](https://example.com/image.png)");
```

## Description

The plugin automatically add `loading="lazy"` to all images to let them being lazy loaded.

::: note

This is a native HTML5 feature, so your browser must support [loading=lazy attribute](https://caniuse.com/loading-lazy-attr).

:::
