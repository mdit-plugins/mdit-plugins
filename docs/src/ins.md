---
title: "@mdit/plugin-ins"
icon: square-plus
---

Plugins to add insert tag support.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { ins } from "@mdit/plugin-ins";

const mdIt = MarkdownIt().use(ins);

mdIt.render("VuePress Theme Hope is ++very++ powerful.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { ins } = require("@mdit/plugin-ins");

const mdIt = MarkdownIt().use(ins);

mdIt.render("VuePress Theme Hope is ++very++ powerful.");
```

:::

## Syntax

Use `++ ++` to add `<ins>` tag.

## Demo

::: preview Demo

VuePress Theme Hope is ++very++ powerful.

:::
