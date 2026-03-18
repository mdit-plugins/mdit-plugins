---
title: "@mdit/plugin-katex"
icon: square-root-variable
---

使用 KaTeX 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

::::

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";

const mdIt = MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

我们也有一个 `@mdit/plugin-katex-slim` 包，其中 `katex` 是可选对等依赖。

## 格式

语法取决于 `delimiters` 选项：

- **默认 (`"dollars"`)**: 内联使用 `$tex expression$`，块级使用 `$$tex expression$$`。
- **LaTeX 风格 (`"brackets"`)**: 内联使用 `\(tex expression\)`，块级使用 `\[tex expression\]`。
- **两种语法 (`"all"`)**: 同时支持美元符号和括号语法。

::: tip 样式

你应该自己从 `katex` 包或 CDN 导入 `katex/dist/katex.min.css`。

:::

::: tip 转义

- 你可以使用 `\` 来转义 `$` `\[` 和 `\(`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  会被渲染为

  Euler’s identity \$e^{i\pi}+1=0$

:::

## 示例

::: preview 示例

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

:::

## mhchem 扩展

如果你想加载 `mhchem` 扩展，你应该导入 `@mdit/plugin-katex/mhchem`:

```ts
import { katex } from "@mdit/plugin-katex";
import "@mdit/plugin-katex/mhchem";
```

## 选项

此插件扩展了 KaTeX 选项。可用选项包括：

<!-- @include: ./tex.md#options -->

### logger

- 类型：`KatexLogger`

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

- 详情：错误日志记录器函数。

### transformer

- 类型：`(content: string, displayMode: boolean) => string`
- 详情：输出内容的转换器函数。

## 支持列表

- [KaTeX 支持功能](https://katex.org/docs/supported.html)
- [KaTeX 支持列表](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-教程)
