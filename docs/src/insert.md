---
title: "@mdit/plugin-insert"
icon: square-plus
---

Plugins to add insert tag support.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "insertdown-it";
import { insert } from "@mdit/plugin-insert";

const mdIt = MarkdownIt().use(insert);

mdIt.render("VuePress Theme Hope is ++very++ powerful.");
```

@tab JS

```js
const MarkdownIt = require("insertdown-it");
const { insert } = require("@mdit/plugin-insert");

const mdIt = MarkdownIt().use(insert);

mdIt.render("VuePress Theme Hope is ++very++ powerful.");
```

:::

## Syntax

Use `++ ++` to insert.

## Demo

::: md-demo Demo

VuePress Theme Hope is ++very++ powerful.

:::
