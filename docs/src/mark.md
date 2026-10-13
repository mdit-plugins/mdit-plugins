---
title: "@mdit/plugin-mark"
shortTitle: "plugin-mark"
icon: highlighter
---

Plugins to mark and highlight contents.

<!-- more -->

## Usage

```ts
import { mark } from "@mdit/plugin-mark";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

## Syntax

Use `== ==` to mark.

## Demo

::: preview Demo

VuePress Theme Hope is ==powerful==.

:::
