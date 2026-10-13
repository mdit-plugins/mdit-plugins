---
title: "@mdit/plugin-sup"
shortTitle: "plugin-sup"
icon: superscript
---

Plugin to support superscript.

<!-- more -->

## Usage

```ts
import { sup } from "@mdit/plugin-sup";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(sup);

mdIt.render("19^th^");
```

## Syntax

Use `^ ^` to mark the superscript.

::: tip Escaping

- You can use `\` to escape `^`:

  ```md
  19\^th^
  ```

  will be

  19\^th^

:::

## Demo

`19^th^`: 19^th^
