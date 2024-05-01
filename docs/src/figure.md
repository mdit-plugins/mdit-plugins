---
title: "@mdit/plugin-figure"
icon: image
---

Plugin for generating figures with captions from images.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { figure } from "@mdit/plugin-figure";

const mdIt = MarkdownIt().use(figure, {
  // your options, optional
});

mdIt.render("![image](https://example.com/image.png)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { figure } = require("@mdit/plugin-figure");

const mdIt = MarkdownIt().use(figure, {
  // your options, optional
});

mdIt.render("![image](https://example.com/image.png)");
```

:::

## Syntax

Sometimes, you may want to add a description with image and place it between contents, so here is this plugin.

If a image is standalone in a line, wrapped or not wrapped by link, it will be displayed as `<figure>` and title (or alt) will be displayed as `<figcaption>`.

## Options

```ts
interface MarkdownItFigureOptions {
  /**
   * Whether the figure is focusable
   *
   * @default true
   */
  focusable?: boolean;
}
```

## Demo

::: md-demo Demo

![Logo](/favicon.ico)

[![Logo](/favicon.ico)](https://commonmark.org/)

![Logo](/favicon.ico "Markdown")

[![Logo](/favicon.ico "Markdown")](https://commonmark.org/)

:::
