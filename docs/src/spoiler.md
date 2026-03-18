---
title: "@mdit/plugin-spoiler"
icon: eraser
---

Plugins to hide content.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { spoiler } from "@mdit/plugin-spoiler";

const mdIt = MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope is !!powerful!!.");
```

With the default options, you can import `@mdit/plugin-spoiler/style` to apply styles.

## Syntax

Use `!! !!` hide contents.

## Demo

::: preview Demo

VuePress Theme Hope is !!powerful!!.

:::

## Options

### tag

- Type: `string`
- Default: `"span"`
- Details: HTML tag name for the spoiler element.

### attrs

- Type: `[attr: string, value: string][]`
- Default: `[["class", "spoiler"], ["tabindex","-1"]]`
- Details: Custom HTML attributes for the spoiler element.
