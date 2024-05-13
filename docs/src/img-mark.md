---
title: "@mdit/plugin-img-mark"
icon: circle-half-stroke
---

Plugins to mark images by ID suffix for theme mode.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { imgMark } from "@mdit/plugin-img-mark";

const mdIt = MarkdownIt().use(imgMark, {
  // your options, optional
});

mdIt.render("![image](https://example.com/image.png#light)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { imgMark } = require("@mdit/plugin-img-mark");

const mdIt = MarkdownIt().use(imgMark, {
  // your options, optional
});

mdIt.render("![image](https://example.com/image.png#light)");
```

:::

## Syntax

GFM supports marking pictures by ID suffix so that pictures are only displayed in a specific mode.

This plugin allows you to add ID suffix to images links, and automatically add `data-mode="lightmode-only|darkmode-only"` to `<img>` tag based on your settings.

::: tip Related Styles

The plugin will not generate styles, because it doesn't know what the style should be, so you need to add related styles yourself.

If you are generating the page and controlling darkmode by dom, you should use:

```css
lightmode-selector {
  img[data-mode="darkmode-only"] {
    display: none !important;
  }
}

darkmode-selector {
  img[data-mode="lightmode-only"] {
    display: none !important;
  }
}
```

If the page theme mode is based on user preference, you should use:

```css
@media (prefers-color-scheme: light) {
  img[data-mode="darkmode-only"] {
    display: none !important;
  }
}

@media (prefers-color-scheme: dark) {
  img[data-mode="lightmode-only"] {
    display: none !important;
  }
}
```

:::

## Options

```ts
interface MarkdownItImgMarkOptions {
  /**
   * lightmode only ids
   *
   * @default ["gh-light-mode-only", "light"]
   */
  light?: string[];

  /**
   * darkmode only ids
   *
   * @default ["gh-dark-mode-only", "dark"]
   */
  dark?: string[];
}
```

## Demo

::: md-demo Demo

![GitHub Light](/github-light.png#gh-dark-mode-only)
![GitHub Dark](/github-dark.png#gh-light-mode-only)

![GitHub Light](/github-light.png#dark)
![GitHub Dark](/github-dark.png#light)

:::

<ColorModeSwitch /> (Try to toggle theme mode)

<script setup lang="ts">
import ColorModeSwitch from "@theme-hope/modules/outlook/components/ColorModeSwitch"
</script>
