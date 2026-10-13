---
title: "@mdit/plugin-sub"
shortTitle: "plugin-sub"
icon: subscript
---

Plugin to support subscript.

<!-- more -->

## Usage

```ts
import { sub } from "@mdit/plugin-sub";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(sub);

mdIt.render("H~2~O");
```

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

<!-- prettier-ignore -->
`H~2~O`: H~2~O
