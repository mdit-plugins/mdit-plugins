---
title: "@mdit/plugin-footnote"
icon: quote-left
---

Plugin to support footnotes.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { footnote } from "@mdit/plugin-footnote";

const mdIt = MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { footnote } = require("@mdit/plugin-footnote");

const mdIt = MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

:::

## Syntax

- Use `[^Anchor text]` in Markdown to define a footnote

- Use block starting with `[^Anchor text]: ...` to describe footnote content

- If there are multiple paragraph in footnote, the paragraph show be double indented.

::: tip Nesting and escaping

- Nestings are supported:

  ```md
  Footnote 1 link[^first].

  [^first]: Footnote can reference [^second].

  [^second]: Other footnote.
  ```

- Escaping can be done by adding `\`:

  ```md
  The following \[^first] is not a footnote.
  ```

  will be

  The following \[^first] is not a footnote.

:::

## Demo

::: preview Demo

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference.

[^first]: Footnote **can have markup**

    and multiple paragraphs[^second].

[^second]: Footnote text.

:::
