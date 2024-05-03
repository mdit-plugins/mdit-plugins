---
title: "@mdit/plugin-ruby"
icon: paperclip
---

Plugin to support ruby annotation `<ruby>`.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { ruby } from "@mdit/plugin-ruby";

const mdIt = MarkdownIt().use(ruby);

mdIt.render("{中国:zhōng|guó}");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { ruby } = require("@mdit/plugin-ruby");

const mdIt = MarkdownIt().use(ruby);

mdIt.render("{中国:zhōng|guó}");
```

:::

## Syntax

Use `{ruby base:ruby text1|ruby text2|...}` to add ruby annotation.

::: tip Escaping

- You can use `\` to escape `{` `:` or `}`:

  ```md
  \{中国:zhōng|guó}
  ```

  will be

  \{中国:zhōng|guó}

:::

## Demo

`{中国:zhōng|guó}`: {中国:zhōng|guó}
