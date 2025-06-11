---
title: "@mdit/plugin-mathjax"
icon: square-root-variable
---

使用 Mathjax 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

:::

<!-- more -->

## 使用 <Badge text="仅限 Node.js 环境" />

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

这个插件与其他插件有点不同。 它要求你先创建通过选项一个 Mathjax 实例，然后将其传递给插件。

你可以设置如下选项:

```ts
interface MarkdownItMathjaxOptions {
  /**
   * 输出格式
   *
   * @default 'svg'
   */

  output?: "chtml" | "svg";

  /**
   * 启用的数学分隔符语法
   *
   * - `"brackets"`: 使用 `\(...\)` 表示内联数学，使用 `\[...\]` 表示显示模式数学（LaTeX 风格）
   * - `"dollars"`: 使用 `$...$` 表示内联数学，使用 `$$...$$` 表示显示模式数学（常见 Markdown 风格）
   * - `"all"`: 启用括号和美元符号两种语法
   *
   * @default "dollars"
   */
  delimiters?: "brackets" | "dollars" | "all";

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
   * 是否启用无障碍
   *
   * @default true
   */
  a11y?: boolean;

  /**
   * TeX 输入选项
   */
  tex?: MathJaxTexInputOptions;

  /**
   * 通用 HTML 输出选项
   */
  chtml?: MathjaxCommonHTMLOutputOptions;

  /**
   * SVG 输出选项
   */
  svg?: MathjaxSVGOutputOptions;
}
```

该实例包含每个调用的渲染内容，因此你应该：

- 在不同页面中的每次渲染之前调用 `mathjaxInstance.reset()`，这确保标签之类的项目被重置。
- 在所有渲染完成后调用 `mathjaxInstance.outputStyle()`，以获得最终的 CSS 内容。
- 如有必要，调用 `mathjaxInstance.clearStyle()` 清除现有样式缓存。

我们也有一个 `@mdit/plugin-mathjax-slim` 包，其中 `mathjax-full` 是可选对等依赖。

## 格式

语法取决于 `delimiters` 选项：

- **默认 (`"dollars"`)**: 内联使用 `$tex expression$`，块级使用 `$$tex expression$$`。
- **LaTeX 风格 (`"brackets"`)**: 内联使用 `\(tex expression\)`，块级使用 `\[tex expression\]`。
- **两种语法 (`"all"`)**: 同时支持美元符号和括号语法。

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

## 支持列表

- [受支持的 TeX/LaTeX 指令](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-教程)
