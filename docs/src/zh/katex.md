---
title: "@mdit/plugin-katex"
icon: square-root-variable
---

使用 KaTeX 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

::::

<!-- more -->

## 使用 <Badge text="仅限 Node.js 环境" />

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

我们也有一个 `@mdit/plugin-katex-slim` 包，其中 `katex` 是可选对等依赖。

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

::: md-demo 示例

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

:::

## mhchem extension

如果你想加载 `mhchem` 扩展，你应该从 `@mdit/plugin-katex` 中导入 `loadMhchem`:

```ts
import { loadMhchem } from "@mdit/plugin-katex";

await loadMhchem();
```

因为它是异步的，你应该在准备阶段调用它，因为 markdown-it 渲染是同步的。

## 选项

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

interface MarkdownItKatexOptions<MarkdownItEnv = unknown> extends KatexOptions {
  /**
   * 是否允许两端带空格的内联数学
   *
   * @description 不建议将此设置为 true，因为它很可能会破坏 $ 的默认使用
   *
   * @default false
   */
  allowInlineWithSpace?: boolean;

  /**
   * 是否将解析的数学语言 fence 块转换为显示模式数学
   *
   * @default false
   */
  mathFence?: boolean;

  /**
   * 错误日志记录器
   */
  logger?: KatexLogger<MarkdownItEnv>;

  /**
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;
}
```

## 支持列表

- [KaTeX 支持功能](https://katex.org/docs/supported.html)
- [KaTeX 支持列表](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#cookbook)
