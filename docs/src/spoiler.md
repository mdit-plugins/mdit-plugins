---
title: "@mdit/plugin-spoiler"
shortTitle: "plugin-spoiler"
icon: eraser
---

Plugins to hide content.

<!-- more -->

## Usage

```ts
import { spoiler } from "@mdit/plugin-spoiler";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope is !!powerful!!.");
```

With the default options, you can import `@mdit/plugin-spoiler/style` to apply styles.

## Syntax

Use `!! !!` hide contents.

## Options

::: fields
@`tag` type=string default=`"span"`

HTML tag name for the spoiler element.

@`attrs` type=`[attr: string, value: string][] | (() => [attr: string, value: string][])` default=`() => [["class", "spoiler"], ["tabindex","-1"]]`

Custom HTML attributes for the spoiler element. A static array is cloned for every token; a factory function is called once per token and must return a new array (recommended for dynamic attributes).

:::

## Demo

::: preview Demo

VuePress Theme Hope is !!powerful!!.

:::
