---
title: "@mdit/plugin-icon"
icon: icons
---

Plugins with icon support.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { icon } from "@mdit/plugin-icon";

const mdIt = MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { icon } = require("@mdit/plugin-icon");

const mdIt = MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
```

:::

## Syntax

Use `::icon classes::` to insert custom icons. By default the plugin will render a `<i>` tag with the given icon class, and you can also render anything you like by passing a custom renderer.

::: tip Why not markdownit-plugin-emoji?

`markdownit-plugin-emoji` only supports converting known emoji codes to icons, while this plugin supports any custom icon classes.

This is useful when you are using it with font icon libraries like Font Awesome, Material Icons, etc.

:::

## Demo

::: md-demo Demo

iPhone is made by ::apple::.

:::
