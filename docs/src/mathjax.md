---
title: "@mdit/plugin-mathjax"
icon: square-root-variable
---

Plugins to render math expressions with Mathjax.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage <Badge text="Node.js runtime only" />

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax";

const mathjaxInstance = createMathjaxInstance(options);
const mdIt = MarkdownIt().use(mathjax, mathjaxInstance);

const html = mdIt.render("$E=mc^2$");
const style = mathjaxInstance.outputStyle();
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { createMathjaxInstance, mathjax } = require("@mdit/plugin-mathjax");

const mathjaxInstance = createMathjaxInstance(options);
const mdIt = MarkdownIt().use(mathjax, mathjaxInstance);

const html = mdIt.render("$E=mc^2$");
const style = mathjaxInstance.outputStyle();
```

:::

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
   * Math delimiter syntax to enable
   *
   * - `"brackets"`: Use `\(...\)` for inline math and `\[...\]` for display math (LaTeX style)
   * - `"dollars"`: Use `$...$` for inline math and `$$...$$` for display math (common Markdown style)
   * - `"all"`: Enable both bracket and dollar syntaxes
   *
   * @default "dollars"
   */
  delimiters?: "brackets" | "dollars" | "all";

  /**
   * Whether to allow inline math with spaces on ends
   *
   * @description NOT recommended to set this to true, because it will likely break the default usage of $
   *
   * @default false
   */
  allowInlineWithSpace?: boolean;

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

We also have a package called `@mdit/plugin-mathjax-slim` which `mathjax-full` is an optional peer dep.

## Syntax

The syntax depends on the `delimiters` option:

- **Default (`"dollars"`)**: Use `$tex expression$` inline, and `$$tex expression$$` for block.
- **LaTeX style (`"brackets"`)**: Use `\(tex expression\)` inline, and `\[tex expression\]` for block.
- **Both (`"all"`)**: Both dollar and bracket syntaxes are supported.

::: tip Escaping

- You can use `\` to escape `$` `\(` and `\[`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  will be

  Euler’s identity \$e^{i\pi}+1=0$

:::

## Demo

::: preview Demo

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

:::

## Support List

- [Supported TeX/LaTeX commands](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-tutorial)
