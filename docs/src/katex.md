---
title: "@mdit/plugin-katex"
icon: square-root-variable
---

Plugins to render math expressions with KaTeX, you should install `katex` as peer dependency.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage <Badge text="Node.js runtime only" />

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

::: tip Escaping

- You can use `\` to escape `$`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  will be

  Euler’s identity \$e^{i\pi}+1=0$

:::

## Demo

::: md-demo

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

:::

## Options

```ts
interface KatexCatcodes {
  [key: string]: number;
}

interface KatexLexerInterFace {
  input: string;
  tokenRegex: RegExp;
  settings: Required<KatexOptions>;
  catcodes: KatexCatcodes;
}

interface KatexSourceLocation {
  start: number;
  end: number;
  lexer: KatexLexerInterFace;
}

interface KatexToken {
  text: string;
  loc: KatexSourceLocation;
  noexpand: boolean | undefined;
  treatAsRelax: boolean | undefined;
}

type KatexLogger<MarkdownItEnv = unknown> = (
  errorCode:
    | "unknownSymbol"
    | "unicodeTextInMathMode"
    | "mathVsTextUnits"
    | "commentAtEnd"
    | "htmlExtension"
    | "newLineInDisplayMode",
  errorMsg: string,
  token: KatexToken,
  env: MarkdownItEnv,
) => "error" | "warn" | "ignore" | void;

interface MarkdownItKatexOptions<MarkdownItEnv = unknown> extends KatexOptions {
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
   * Whether enable mhchem extension
   *
   * @default false
   */
  mhchem?: boolean;

  /**
   * Error logger
   */
  logger?: KatexLogger<MarkdownItEnv>;
}
```

## Support List

- [KaTeX Support Features](https://katex.org/docs/supported.html)
- [KaTeX Support List](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
