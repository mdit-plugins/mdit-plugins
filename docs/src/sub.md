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
import MarkdownIt from "markdown-it";
import { sub } from "@mdit/plugin-sub";

const mdIt = MarkdownIt().use(sub);

mdIt.render("H~2~O");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { sub } = require("@mdit/plugin-sub");

const mdIt = MarkdownIt().use(sub);

mdIt.render("H~2~O");
```

:::

## Syntax

Use `~ ~` to mark the subscript.

::: tip Escaping

- You can use `\` to escape `~`:

  ```md
  H\~2~O
  ```

  will be

  H\~2~O

:::

## Demo

`H~2~O`: H~2~O
