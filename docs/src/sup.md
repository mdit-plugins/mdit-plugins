---
title: "@mdit/plugin-sup"
icon: superscript
---

Plugin to support superscript.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "supdown-it";
import { sup } from "@mdit/plugin-sup";

const mdIt = MarkdownIt().use(sup);

mdIt.render("H~2~O");
```

@tab JS

```js
const MarkdownIt = require("supdown-it");
const { sup } = require("@mdit/plugin-sup");

const mdIt = MarkdownIt().use(sup);

mdIt.render("H~2~O");
```

:::

## Syntax

Use `~ ~` to mark the superscript.

## Demo

H~2~O

```md
H~2~O
```
