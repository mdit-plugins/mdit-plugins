---
title: "@mdit/plugin-katex"
icon: square-root-variable
---

Plugins to render math expressions with KaTeX.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage

::: code-tabs#language

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

:::

We also have a package called `@mdit/plugin-katex-slim` which `katex` is an optional peer.

## Syntax

The syntax depends on the `delimiters` option:

- **Default (`"dollars"`)**: Use `$tex expression$` inline, and `$$tex expression$$` for block.
- **LaTeX style (`"brackets"`)**: Use `\(tex expression\)` inline, and `\[tex expression\]` for block.
- **Both (`"all"`)**: Both dollar and bracket syntaxes are supported.

::: tip Style

You should import `katex/dist/katex.min.css` from `katex` package or CDN yourself.

:::

::: tip Escaping

- You can use `\` to escape `$` `\(` and `\[`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  will be

  Euler’s identity \$e^{i\pi}+1=0$

:::

## Demo

::: preview

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

:::

## mhchem extension

If you want to load the `mhchem` extension, you should import `loadMhchem` from `@mdit/plugin-katex`:

```ts
import { loadMhchem } from "@mdit/plugin-katex";

await loadMhchem();
```

Since it's async, you should call it in prepare stage as markdown-it rendering is sync.

## Options

```ts
type KatexLogger<MarkdownItEnv = unknown> = (
  errorCode:
    | "unknownSymbol"
    | "unicodeTextInMathMode"
    | "mathVsTextUnits"
    | "commentAtEnd"
    | "htmlExtension"
    | "newLineInDisplayMode",
  errorMsg: string,
  token: Token,
  env: MarkdownItEnv,
) => "error" | "warn" | "ignore" | boolean | undefined | void;

type TeXTransformer = (content: string, displayMode: boolean) => string;

interface MarkdownItKatexOptions<MarkdownItEnv = unknown> extends KatexOptions {
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
   * Error logger
   */
  logger?: KatexLogger<MarkdownItEnv>;

  /**
   * transformer on output content
   */
  transformer?: TeXTransformer;
}
```

## Support List

- [KaTeX Support Features](https://katex.org/docs/supported.html)
- [KaTeX Support List](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
