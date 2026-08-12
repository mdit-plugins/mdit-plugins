---
title: "@mdit/plugin-figure"
icon: image
---

Plugin for generating figures with captions from images.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { figure } from "@mdit/plugin-figure";

const mdIt = new MarkdownIt().use(figure, {
  // your options, optional
});

mdIt.render("![image](https://example.com/image.png)");
```

## Syntax

Sometimes, you may want to add a description with image and place it between contents, so here is this plugin.

If a image is standalone in a line, wrapped or not wrapped by link, it will be displayed as `<figure>` and title (or alt) will be displayed as `<figcaption>`.

## Options

### focusable

- Type: `boolean`
- Default: `true`
- Details: Whether the figure is focusable.

### linkImage

- Type: `boolean`
- Default: `true`
- Details: Whether to convert linked images (`[![image](url)](link)`) to figures.

### moveAttrs

- Type: `boolean | (string | RegExp)[]`
- Details:

  Copy or move image attributes to `<figure>`.

  - `true`: **copy** all attributes except native img ones (src, alt, srcset, width, height, loading, etc.) to `<figure>`. Image keeps them.
  - `(string | RegExp)[]`: **move** only matching attributes to `<figure>`. Image loses them.

  Native img attributes (src, alt, title, width, height, etc.) are never moved or copied to `<figure>`, and `title` is always used as the `<figcaption>` content.

  ```ts
  // Copy all non-native attrs to figure (img keeps them)
  moveAttrs: true;

  // Move class and data-* attrs to figure (img loses them)
  moveAttrs: ["class", /^data-/];
  ```

## Demo

::: preview Demo

![Logo](/favicon.ico)

[![Logo](/favicon.ico)](https://commonmark.org/)

![Logo](/favicon.ico "Markdown")

[![Logo](/favicon.ico "Markdown")](https://commonmark.org/)

:::
