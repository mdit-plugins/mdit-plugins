---
title: "@mdit/plugin-mathjax"
icon: tex
---

Plugins to render math expressions with Mathjax.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import {
  createMathjaxInstance,
  mathjax,
  generateMathjaxStyle,
} from "@mdit/plugin-mathjax";

const mathjaxInstance = createMathjaxInstance(options);
const mdIt = MarkdownIt().use(mathjax, mathjaxInstance);

const html = mdIt.render("$E=mc^2$");
const style = generateMathjaxStyle(mathjaxInstance);
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const {
  createMathjaxInstance,
  mathjax,
  generateMathjaxStyle,
} = require("@mdit/plugin-mathjax");

const mathjaxInstance = createMathjaxInstance(options);
const mdIt = MarkdownIt().use(mathjax, mathjaxInstance);

const html = mdIt.render("$E=mc^2$");
const style = generateMathjaxStyle(mathjaxInstance);
```

::::

This plugin is a bit different from other plugins. It requires you to create a Mathjax instance first, and then pass it to the plugin.

The instance holds render content of each calls, so you can get used styles when calling `generateMathjaxStyle` after all rendering is done.

If you are building a website, you can share same instance between pages, and call `generateMathjaxStyle` after all pages are rendered to get a final CSS, but if you are creating preview for a single page, you should create a new instance for each page to prevent generating styles for other page content.

## Syntax

You should use `$tex expression$` inline, and use `$$tex expression$$` for block.

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

- [Supported TeX/LaTeX commands](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
