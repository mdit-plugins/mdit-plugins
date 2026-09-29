---
title: "@mdit/plugin-mathjax"
shortTitle: "plugin-mathjax"
icon: square-root-variable
---

Plugins to render math expressions with Mathjax.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage <Badge text="No CDN Scripts" />

```ts
import MarkdownIt from "markdown-it";
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax";

const mathjaxInstance = await createMathjaxInstance(options);
const mdIt = new MarkdownIt().use(mathjax, mathjaxInstance);

const html = mdIt.render("$E=mc^2$");
const style = await mathjaxInstance.outputStyle();
```

This plugin is a bit different from other plugins. It requires you to create a Mathjax instance with options first, and then pass it to the plugin.

The instance holds render content of each calls, so you should:

- Call `mathjaxInstance.outputStyle()` after all rendering is done, to get final CSS content.
- Call `mathjaxInstance.clearStyle()` to clear existing style cache if necessary.

The plugin automatically calls `mathjaxInstance.reset()` after each render, clearing user-defined macros, environments and labels so that state does not leak across documents. To keep macros available in every document, define them with the `tex.macros` option instead.

We also have a package called `@mdit/plugin-mathjax-slim`, for which `@mathjax/src` and `@mathjax/mathjax-newcm-font` are optional peer deps.

For better performance and memory, the `createMathjaxInstance` function is asynchronous, allowing you to load only the $TeX$ packages you need dynamically, but if you must call the plugin in a synchronous flow, you can import a synchronous version of the `createMathjaxInstance` function from `@mdit/plugin-mathjax/sync`.

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

## Options

`createMathjaxInstance(options)` accepts the following options:

::: fields
@`output` type=`"chtml" | "svg"` default=`"svg"`

Output syntax.

@`delimiters` type=`"brackets" | "dollars" | "all"` default=`"dollars"`

Math delimiter syntax to enable.

- `"brackets"`: Use `\(...\)` for inline math and `\[...\]` for display math (LaTeX style).
- `"dollars"`: Use `$...$` for inline math and `$$...$$` for display math (common Markdown style).
- `"all"`: Enable both bracket and dollar syntaxes.

@`allowInlineWithSpace` type=boolean default=`false`

Whether to allow inline math with spaces on ends.

NOT recommended to set this to true, because it will likely break the default usage of `$`.

@`mathFence` type=boolean default=`false`

Whether parsed fence block with math language to display mode math.

@`a11y` type=boolean default=`true`

Enable A11y.

@`tex` type=MathJaxTexInputOptions

TeX input options.

@`chtml` type=MathjaxCommonHTMLOutputOptions

Common HTML output options.

@`svg` type=MathjaxSVGOutputOptions

SVG output options.

@`transformer` type=TeXTransformer

Transformer on output content.

@`debug` type=boolean default=`false`

Enable debug mode.

:::

## Demo

::: preview Demo

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$

:::

## Support List

- [Supported TeX/LaTeX commands](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-tutorial)
