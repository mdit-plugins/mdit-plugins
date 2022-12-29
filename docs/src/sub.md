---
title: "@mdit/plugin-sub"
icon: subscript
---

Plugin to support subscript.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "subdown-it";
import { sub } from "@mdit/plugin-sub";

const mdIt = MarkdownIt().use(sub);

mdIt.render("19^th^");
```

@tab JS

```js
const MarkdownIt = require("subdown-it");
const { sub } = require("@mdit/plugin-sub");

const mdIt = MarkdownIt().use(sub);

mdIt.render("19^th^");
```

:::

## Syntax

Use `^ ^` to mark the subscript.

## Demo

19^th^

```md
19^th^
```
