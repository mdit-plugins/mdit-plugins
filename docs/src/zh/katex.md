---
title: "@mdit/plugin-katex"
icon: tex
---

使用 KaTeX 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

::::

<!-- more -->

## 使用

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";

const mdIt = MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { katex } = require("@mdit/plugin-katex");

const mdIt = MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

::::

## 语法

你应该在行内使用 `$tex expression$`，在块中使用 `$$tex expression$$`。

::: tip 样式

你应该自己从 `katex` 包或 CDN 导入 `katex/dist/katex.min.css`。

:::

## 示例

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

## 支持列表

- [KaTeX 支持功能](https://katex.org/docs/supported.html)
- [KaTeX 支持列表](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
