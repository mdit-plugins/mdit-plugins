---
title: "@mdit/plugin-abbr"
icon: book
---

支持缩写词 `<abbr>` 标签的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

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

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { abbr } = require("@mdit/plugin-abbr");

const mdIt = MarkdownIt().use(abbr);

mdIt.render(`
*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
The HTML specification is maintained by the W3C.
`);
```

:::

<!-- markdownlint-disable MD028 -->

## 语法

通过此插件，你可以通过以额外 `*` 开头的链接声明来声明缩略词。

<!-- prettier-ignore-start -->

```md
*[缩略词]: 内容
```

<!-- prettier-ignore-end -->

::: tip 转移

转义可以通过添加额外的 `\` 以转义 `*` `[` 或 `]` 字符:

```md
\*[文字]: 内容
```

will be

\*[文字]: 内容

:::

## 示例

<!-- prettier-ignore-start -->

::: md-demo 示例

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

The HTML specificationis maintained by the W3C.

:::

<!-- prettier-ignore-end -->
