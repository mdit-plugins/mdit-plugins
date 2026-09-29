---
title: "@mdit/plugin-mathjax"
shortTitle: "plugin-mathjax"
icon: square-root-variable
---

使用 Mathjax 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

:::

<!-- more -->

## 使用 <Badge text="没有 CDN 脚本" />

```ts
import MarkdownIt from "markdown-it";
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax";

const mathjaxInstance = await createMathjaxInstance(options);
const mdIt = new MarkdownIt().use(mathjax, mathjaxInstance);

const html = mdIt.render("$E=mc^2$");
const style = await mathjaxInstance.outputStyle();
```

这个插件与其他插件有点不同。 它要求你先创建通过选项一个 Mathjax 实例，然后将其传递给插件。接受的选项见[选项](#选项)，实例暴露的成员见[实例](#实例)。

我们也有一个 `@mdit/plugin-mathjax-slim` 包，其中 `@mathjax/src` 和 `@mathjax/mathjax-newcm-font` 是可选对等依赖。

为了更好的性能与内存，`createMathjaxInstance` 函数是异步的，允许仅动态加载你需要的 $TeX$ 包，但是如果你必须在一个同步流程中调用插件，你可以从 `@mdit/plugin-mathjax/sync` 导入 `createMathjaxInstance` 函数的同步版本。

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

## 选项

`createMathjaxInstance(options)` 支持以下选项：

::: fields
@`output` type=`"chtml" | "svg"` default=`"svg"`

输出格式。

@`delimiters` type=`"brackets" | "dollars" | "all"` default=`"dollars"`

启用的数学分隔符语法。

- `"brackets"`: 使用 `\(...\)` 表示内联数学，使用 `\[...\]` 表示显示模式数学（LaTeX 风格）。
- `"dollars"`: 使用 `$...$` 表示内联数学，使用 `$$...$$` 表示显示模式数学（常见 Markdown 风格）。
- `"all"`: 启用括号和美元符号两种语法。

@`allowInlineWithSpace` type=boolean default=`false`

是否允许两端带空格的内联数学。

不建议将此设置为 true，因为它很可能会破坏 `$` 的默认使用。

@`mathFence` type=boolean default=`false`

是否将解析的数学语言 fence 块转换为显示模式数学。

@`a11y` type=boolean default=`true`

是否启用无障碍。

@`tex` type=MathJaxTexInputOptions

TeX 输入选项。

@`chtml` type=MathjaxCommonHTMLOutputOptions

通用 HTML 输出选项。

@`svg` type=MathjaxSVGOutputOptions

SVG 输出选项。

@`transformer` type=TeXTransformer

输出内容的转换器。

@`debug` type=boolean default=`false`

启用调试模式。

:::

## 实例

`createMathjaxInstance(options)` 会 resolve 出你传给插件的实例，若无法加载 $TeX$ 输入则为 `null`。除了解析后的选项外，实例还暴露以下成员：

::: fields
@`outputStyle` type=`() => Promise<string>`

返回汇总所有已渲染公式的 CSS 内容。

生成样式表前会按需加载字体文件，并会在返回后清空样式缓存，因此请在全部渲染完成后再调用。使用来自 `@mdit/plugin-mathjax/sync` 的同步版 `createMathjaxInstance` 时，返回类型为 `string` 而非 `Promise<string>`。

@`reset` type=`() => void`

重置 $TeX$ 输入，清除用户定义的宏、环境与标签。

插件会在每次渲染后自动调用它，避免状态跨文档泄漏。如需在所有文档中持续使用某个宏，请改用 `tex.macros` 选项定义。

@`clearStyle` type=`() => void`

清除样式缓存并重置输入与输出 jax。输出 jax 尚未初始化时不会做任何事。

@`adaptor` type=LiteAdaptor

用于构建文档、读取生成样式表的 MathJax lite adaptor。

@`documentOptions` type=DocumentOptions

解析后的 MathJax 文档选项，包含 `InputJax`、`OutputJax` 以及是否启用辅助 MathML。

@`transformer` type=`TeXTransformer | null`

应用于渲染内容的转换器，未设置 `transformer` 选项时为 `null`。

:::

## 示例

::: preview 示例

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$

:::

## 支持列表

- [受支持的 TeX/LaTeX 指令](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-教程)
