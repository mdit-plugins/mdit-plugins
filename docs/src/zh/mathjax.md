---
title: "@mdit/plugin-mathjax"
icon: tex
---

使用 Mathjax 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

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

这个插件与其他插件有点不同。 它要求您先创建一个 Mathjax 实例，然后将其传递给插件。

该实例保存每次调用的渲染内容，因此您在所有渲染完成后调用 `generateMathjaxStyle` 获取使用过的样式。

如果你正在构建一个网站，你可以在页面之间共享相同的实例，并在所有页面呈现后调用 `generateMathjaxStyle` 以获得最终的 CSS，但是如果你正在为单个页面创建预览，你应该为每个页面创建一个新实例以防止样式包含其他页面内容。

## 语法

你应该在行内使用 `$tex expression$`，在块中使用 `$$tex expression$$`。

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

- [受支持的 TeX/LaTeX 指令](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
