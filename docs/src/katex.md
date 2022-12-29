---
title: "@mdit/plugin-katex"
icon: tex
---

Plugins to render math expressions with KaTeX.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";

const mdIt = MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { katex } = require("@mdit/plugin-katex");

const mdIt = MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

::::

## Syntax

You should use `$tex expression$` inline, and use `$$tex expression$$` for block.

::: tip Style

You should import `katex/dist/katex.min.css` from `katex` package or CDN yourself.

:::

## Demo

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

```md
Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.
```

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

```md
$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$
```

## Support List

- [KaTeX Support Features](https://katex.org/docs/supported.html)
- [KaTeX Support List](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
