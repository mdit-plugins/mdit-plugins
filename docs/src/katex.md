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

```ts
import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";

const mdIt = MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

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

If you want to load the `mhchem` extension, you should import `@mdit/plugin-katex/mhchem`:

```ts
import { katex } from "@mdit/plugin-katex";
import "@mdit/plugin-katex/mhchem";
```

## Options

This plugin extends KaTeX options. Available options include:

<!-- @include: ./tex.md#options -->

### logger

- Type: `KatexLogger`

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
```

- Details: Error logger function.

### transformer

- Type: `(content: string, displayMode: boolean) => string`
- Details: Transformer function on output content.

## Support List

- [KaTeX Support Features](https://katex.org/docs/supported.html)
- [KaTeX Support List](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-tutorial)
