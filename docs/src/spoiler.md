---
title: "@mdit/plugin-spoiler"
icon: eraser
---

Plugins to hide content.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "spoilerdown-it";
import { spoiler } from "@mdit/plugin-spoiler";

const mdIt = MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope is !!powerful!!.");
```

@tab JS

```js
const MarkdownIt = require("spoilerdown-it");
const { spoiler } = require("@mdit/plugin-spoiler");

const mdIt = MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope is !!powerful!!.");
```

:::

You should also add these styles:

```css
.spoiler {
  background-color: currentColor;
  border-radius: 0.2em;
  transition: background ease 0.5s;
  cursor: help;
}

.spoiler:hover,
.spoiler:focus {
  background-color: transparent;
}
```

## Syntax

Use `!! !!` hide contents.

## Demo

::: md-demo Demo

VuePress Theme Hope is !!powerful!!.

:::

## Options

```ts
export interface MarkdownItSpoilerOptions {
  /**
   * @default "span"
   */
  tag?: string;

  /**
   * @default [["class", "spoiler"], ["tabindex","-1"]]
   */
  attrs?: [string, string][];
}
```
