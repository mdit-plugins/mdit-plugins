---
title: "@mdit/plugin-abbr"
icon: book
---

Plugin to support abbreviation tag `<abbr>`.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { abbr } from "@mdit/plugin-abbr";

const mdIt = MarkdownIt().use(abbr);

mdIt.render(`
*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
The HTML specification is maintained by the W3C.
`);
```

<!-- markdownlint-disable MD028 -->

## Syntax

With this plugin you can declare abbreviations using reference beginning with an extra `*`:

<!-- prettier-ignore-start -->

```md
*[Abbr word]: Abbr content
```

<!-- prettier-ignore-end -->

::: tip Escaping

Escaping can be done by adding `\` to escape the `*` `[` or `]` marker:

```md
\*[text]: content
```

will be

\*[text]: content

:::

## Demo

<!-- prettier-ignore-start -->

::: preview Demo

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

The HTML specificationis maintained by the W3C.

:::

<!-- prettier-ignore-end -->
