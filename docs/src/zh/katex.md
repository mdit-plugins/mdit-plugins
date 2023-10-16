---
title: "@mdit/plugin-katex"
icon: tex
---

使用 KaTeX 呈现数学表达式的插件，你应该将 `katex` 安装为 peer 依赖。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

::::

<!-- more -->

## 使用 <Badge text="仅限 Node.js 环境" />

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

## 格式

你应该在行内使用 `$tex expression$`，在块中使用 `$$tex expression$$`。

::: tip 样式

你应该自己从 `katex` 包或 CDN 导入 `katex/dist/katex.min.css`。

:::

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

## 选项

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
   * 是否将解析的数学语言 fence 块转换为显示模式数学
   *
   * @default false
   */
  mathFence?: boolean;

  /**
   * 是否启用 mhchem 扩展
   *
   * @default false
   */
  mhchem?: boolean;

  /**
   * 错误日志记录器
   */
  logger?: KatexLogger<MarkdownItEnv>;
}
```

## 支持列表

- [KaTeX 支持功能](https://katex.org/docs/supported.html)
- [KaTeX 支持列表](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
