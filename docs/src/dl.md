---
title: "@mdit/plugin-dl"
icon: list-check
---

Plugin to support definition list.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { dl } from "@mdit/plugin-dl";

const mdIt = MarkdownIt().use(dl);

mdIt.render(`\
Apple
: Pomaceous fruit of plants of the genus Malus in the family Rosaceae.

Orange
: The fruit of an evergreen tree of the genus Citrus.
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { dl } = require("@mdit/plugin-dl");

const mdIt = MarkdownIt().use(dl);

mdIt.render(`\
Apple
: Pomaceous fruit of plants of the genus Malus in the family Rosaceae.

Orange
: The fruit of an evergreen tree of the genus Citrus.
`);
```

:::

## Syntax

The grammar is based on [PanDoc Definition lists](https://pandoc.org/MANUAL.html#definition-lists)

Each term must be on one line, optionally followed by a blank line. After a term, it must be followed by one or more definitions.

Each definition needs to start with `:` or `~` and be followed by one or more definition paragraphs. When multiple block elements are defined, subsequent block elements should be indented by four spaces.

If there is a blank line after the term, the definition text will be treated as a paragraph, otherwise a compact list will be displayed.

## Demo

::: md-demo Demo

Term 1

: Definition 1

Term 2 with _inline markup_

: Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

Term 3

: Definition
with lazy continuation.

    Second paragraph of the definition.

---

Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b

:::
