---
title: "@mdit/plugin-mathjax"
icon: tex
---

Plugins to render math expressions with Mathjax, you should install `mathjax-full` as peer dependency.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage <Badge text="Node.js runtime only" />

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

This plugin is a bit different from other plugins. It requires you to create a Mathjax instance with options first, and then pass it to the plugin.

You can set the following options:

```ts
interface MarkdownItMathjaxOptions {
  /**
   * Output syntax
   *
   * @default 'svg'
   */

  output?: "chtml" | "svg";

  /**
   * Whether parsed fence block with math language to display mode math
   *
   * @default false
   */
  mathFence?: boolean;

  /**
   * Enable A11y
   *
   * @default true
   */
  a11y?: boolean;

  /**
   * TeX input options
   */
  tex?: MathJaxTexInputOptions;

  /**
   * Common HTML output options
   */
  chtml?: MathjaxCommonHTMLOutputOptions;

  /**
   * SVG output options
   */
  svg?: MathjaxSVGOutputOptions;
}
```

The instance holds render content of each calls, so you should:

- Call `mathjaxInstance.reset()` before each render in different pages, this ensure things like label are reset.
- Call `mathjaxInstance.outputStyle()` after all rendering is done, to get final CSS content.
- Call `mathjaxInstance.clearStyle()` to clear existing style cache if necessary.

## Syntax

You should use `$tex expression$` inline, and use `$$tex expression$$` for block.

::: tip Escaping

- You can use `\` to escape `$`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  will be

  Euler’s identity \$e^{i\pi}+1=0$

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

- [Supported TeX/LaTeX commands](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-tutorial)
