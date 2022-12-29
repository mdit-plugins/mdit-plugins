---
title: "@mdit/plugin-mark"
icon: write
---

Plugins to mark and highlight contents.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { mark } from "@mdit/plugin-mark";

const mdIt = MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { mark } = require("@mdit/plugin-mark");

const mdIt = MarkdownIt().use(mark);

mdIt.render("VuePress Theme Hope is ==powerful==.");
```

:::

## Syntax

Use `== ==` to mark.

## Demo

VuePress Theme Hope is ==powerful==.

```md
VuePress Theme Hope is ==powerful==.
```
