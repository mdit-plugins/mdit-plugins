---
title: "@mdit/plugin-ins"
shortTitle: "plugin-ins"
icon: underline
---

Plugins to add insert tag support.

<!-- more -->

## Usage

```ts
import { ins } from "@mdit/plugin-ins";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(ins);

mdIt.render("VuePress Theme Hope is ++very++ powerful.");
```

## Syntax

Use `++ ++` to add `<ins>` tag.

## Demo

::: preview Demo

VuePress Theme Hope is ++very++ powerful.

:::
