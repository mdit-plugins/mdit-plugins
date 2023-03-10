---
title: "@mdit/plugin-mathjax"
icon: tex
---

使用 Mathjax 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

:::

<!-- more -->

## 使用

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

```js
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

这个插件与其他插件有点不同。 它要求你先创建一个 Mathjax 实例，然后将其传递给插件。

该实例包含每个调用的渲染内容，因此您应该：

- 在不同页面中的每次渲染之前调用 `mathjaxInstance.reset()`，这确保标签之类的项目被重置。
- 在所有渲染完成后调用 `mathjaxInstance.outputStyle()`，以获得最终的 CSS 内容。
- 如有必要，调用 `mathjaxInstance.clearStyle()` 清除现有样式缓存。

## 语法

你应该在行内使用 `$tex expression$`，在块中使用 `$$tex expression$$`。

::: tip 转义

- 你可以使用 `\` 来转义 `$`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  会被渲染为

  Euler’s identity \$e^{i\pi}+1=0$

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

- [受支持的 TeX/LaTeX 指令](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
