---
title: "@mdit/plugin-img-size"
icon: up-right-and-down-left-from-center
---

Plugins to support setting size for images.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { legacyImgSize, imgSize, obsidianImgSize } from "@mdit/plugin-img-size";

// New syntax
const mdNew = MarkdownIt().use(imgSize);
mdNew.render("![image =300x200](https://example.com/image.png =300x200)");

// Obsidian syntax
const mdObsidian = MarkdownIt().use(obsidianImgSize);
mdObsidian.render("![image|300x200](https://example.com/image.png)");

// Legacy syntax
const mdLegacy = MarkdownIt().use(legacyImgSize);
mdLegacy.render("![image](https://example.com/image.png =300x200)");
```

## Syntax

### New Syntax

Append `=widthxheight` to image alt text with spaces as separator.

Both `width` and `height` should be numbers as pixels and are optional.

```md
![Alt =200x300](/example.png)
![Alt =200x](/example.jpg "Title")
![Alt =x300](/example.bmp)
```

Renders as ↓

```html
<img src="/example.png" alt="Alt" width="200" height="300" />
<img src="/example.jpg" alt="Alt" title="Title" width="200" />
<img src="/example.bmp" alt="Alt" height="300" />
```

### Obsidian Syntax

Append `widthxheight` after image alt text and use `|` to separate.

Both `width` and `height` should be numbers as pixels and are required. Setting one of them with `0` to scale by ratio with the other.

```md
![Alt|200x200](/example.png)
![Alt|200x0](/example.jpg)
![Alt|0x300](/example.bmp)
```

Renders as ↓

```html
<img src="/example.png" alt="Alt" width="200" height="300" />
<img src="/example.jpg" alt="Alt" width="200" />
<img src="/example.bmp" alt="Alt" height="300" />
```

### Legacy Syntax (Deprecated)

::: warning This may cause rendering issues on platforms like GitHub.
:::

Append `=widthxheight` at the end of image link section with spaces as separator.

Both `width` and `height` should be numbers as pixels and are optional.

```md
![Alt](/example.png =200x300)
![Alt](/example.jpg "Title" =200x)
![Alt](/example.bmp =x300)
```

Renders as ↓

```html
<img src="/example.png" width="200" height="300" />
<img src="/example.jpg" title="TTitle" width="200" />
<img src="/example.bmp" height="300" />
```

::: tip Choosing between 3 Grammars

- The legacy grammar breaks image rendering in environments that don't support it (e.g.: GitHub)
- Both the new grammar and the Obsidian grammar are compatible with the Markdown standard, but new grammar is more natural.

:::

## Demo

::: preview Demo

<!-- New Syntax -->

![Logo =200x200](/logo.svg "Markdown")
![Logo =150x](/logo.svg "Markdown")
![Logo =x100](/logo.svg "Markdown")

<!-- Legacy Syntax -->

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)

<!-- Obsidian Syntax -->

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::
