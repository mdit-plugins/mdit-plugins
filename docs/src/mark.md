---
title: "@mdit/plugin-mark"
icon: highlighter
---

Plugins to mark and highlight contents.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { mark } from "@mdit/plugin-mark";

const mdIt = MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

## Syntax

Use `== ==` to mark.

## Demo

::: preview Demo

VuePress Theme Hope is ==powerful==.

:::
