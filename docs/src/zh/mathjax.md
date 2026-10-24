---
title: "@mdit/plugin-mathjax"
shortTitle: "plugin-mathjax"
icon: square-root-variable
---

使用 MathJax 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

:::

<!-- more -->

## 使用 <Badge text="没有 CDN 脚本" />

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, { output: "svg" });

const html = md.render("$e^{i\\pi}+1=0$"); // 完全同步

const { outputStyle, reset, clearStyle, dispose, warmup } = getMathjax(md);

const css = outputStyle(); // 完全同步
```

`mathjax` 与普通 markdown-it 插件一致：第二个参数是选项对象，`md.render()` 会直接返回渲染后的 HTML。MathJax 官方的异步流程在 worker 线程中执行，主线程会同步等待结果，因此不再需要 `await createMathjaxInstance()`。

`getMathjax(md)` 会返回 markdown-it 实例上的 MathJax 方法；如果该实例尚未安装插件，它会抛出错误。相比 `md.mathjax` 属性，使用 helper 可以避免给所有用户的全局 `MarkdownIt` 类型凭空增加一个可选成员。

::: tip

同步主入口依赖 `worker_threads`，因此需要 Node.js。浏览器或不支持 worker 线程的运行时请改用 `@mdit/plugin-mathjax/async`。

:::

### 浏览器 / 高级用法

```ts
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax/async";
import MarkdownIt from "markdown-it";

const mathjaxInstance = await createMathjaxInstance({ output: "svg" });
const md = new MarkdownIt().use(mathjax, mathjaxInstance);

const html = md.render("$e^{i\\pi}+1=0$");
const css = await mathjaxInstance.outputStyle();
```

`./async` 保留 v1 的实例 API：`createMathjaxInstance(options)` 会 resolve 出 MathJax 实例，`mathjax(md, instance)` 将其安装到 markdown-it 实例上。在浏览器、没有 `worker_threads` 的运行时，或需要使用无法传入同步 worker 的函数类选项时，请使用该入口。字体与 TeX 包仍通过 MathJax 官方异步 API 按需加载。

## 破坏性变更

::: warning v2 是破坏性的大版本

`@mdit/plugin-mathjax` v2 将主入口从基于实例的插件改为普通的同步 markdown-it 插件。升级前请先了解以下变化：

- `mathjax` 的第二个参数现在是选项：`mathjax(md, options)`，不再是 `mathjax(md, instance)`，且 `md.render()` 恢复为同步调用。
- `createMathjaxInstance` 已移动到 `@mdit/plugin-mathjax/async`，主入口不再导出它。
- `@mdit/plugin-mathjax/sync` 已被移除；在 Node.js 下主入口本身就是同步的。
- 不再需要创建、传递或 await 实例。请通过 `getMathjax(md)` 获取 `outputStyle`、`reset`、`clearStyle` 与 `dispose`。
- 同步主入口依赖 Node.js（`worker_threads`）。浏览器或不支持 worker 线程的运行时请使用 `./async`。
- 选项必须可结构化克隆。函数类选项会被明确拒绝并提示改用异步入口，详见[选项](#选项)。

:::

### 迁移

迁移前（v1 / 异步入口）：

```ts
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const mathjaxInstance = await createMathjaxInstance(options);
const md = new MarkdownIt().use(mathjax, mathjaxInstance);

const html = md.render("$E=mc^2$");
const style = await mathjaxInstance.outputStyle();
```

迁移后（v2 主入口，完全同步）：

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, options);

const html = md.render("$E=mc^2$");
const style = getMathjax(md).outputStyle();
```

`@mdit/plugin-mathjax-slim` 包也同步发生了变化：主入口使用新的同步 API（`@mathjax/src` 与 `@mathjax/mathjax-newcm-font` 仍为可选对等依赖），`./async` 保留实例 API，`./sync` 被移除；除此之外用法与 `@mdit/plugin-mathjax` 相同。

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

`mathjax(md, options)` 支持以下选项：

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

输出内容的转换器。在 worker 返回渲染后的 HTML 后，于主线程执行。

@`debug` type=boolean default=`false`

启用调试模式。

@`renderStrategy` type=`"batch" | "immediate"` default=`"batch"`

文档中公式的转换方式。`"batch"` 会收集整篇文档的公式，在最外层 render 结束时用一次 worker 往返转换；嵌套的 `md.render()` / `md.renderInline()` 在 flush 前返回内部占位符。`"immediate"` 会在遇到公式时立即转换，嵌套 render 会立即返回最终 HTML，代价是每个公式一次 worker 往返。

@`workerTimeout` type=number default=`30000`

单次同步 worker 调用的超时时间（毫秒）。仅同步主入口使用。

:::

::: warning 函数类选项需要使用异步入口

同步主入口会将选项发送到 worker 线程，因此所有选项都必须可结构化克隆。以下选项会被明确拒绝并抛出错误：

- `tex.formatError`
- `chtml` / `svg` 中的 `preFilters` 与 `postFilters`
- `chtml` / `svg` 中的 `fontData`、`wrapperFactory` 与 `cssStyles`（自定义字体、包装器与样式）
- `chtml` / `svg` 中的 `linebreaks.LinebreakVisitor`

需要上述任意选项时，请从 `@mdit/plugin-mathjax/async` 导入。`transformer` 是同步主入口唯一支持的函数类选项。其他不可克隆的值（例如 `tex.macros` 中的函数）同样会被拒绝。

:::

## MathJax 方法

`getMathjax(md)` 会返回 markdown-it 实例的 `MathjaxMethods` 对象。如果该实例上尚未安装 `mathjax` 插件，它会抛出错误。

::: fields
@`outputStyle` type=`() => string`

同步返回汇总所有已渲染公式的 CSS 内容，返回类型为 `string`。

生成样式表前会按需加载字体文件，并会在返回后清空样式缓存，因此请在全部渲染完成后再调用。

@`reset` type=`() => void`

重置 $TeX$ 输入，清除用户定义的宏、环境与标签。

插件会在每篇文档渲染后自动调用它，避免状态跨渲染泄漏。如需在所有文档中持续使用某个宏，请改用 `tex.macros` 选项定义。

@`clearStyle` type=`() => void`

清除样式缓存并重置输入与输出 jax。输出 jax 尚未初始化时不会做任何事。

@`dispose` type=`() => void`

终止 worker 侧的 session 并释放其 MathJax 状态。

调用后，该 markdown-it 实例将无法继续渲染数学公式，`getMathjax(md)` 也会抛出错误；如需继续渲染，请创建新的 `MarkdownIt` 实例。

:::

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, { output: "svg" });

// 先渲染，再获取已渲染公式的 CSS。
md.render("$e^{i\\pi}+1=0$");

const { outputStyle, reset, clearStyle, dispose, warmup } = getMathjax(md);

const css = outputStyle();

// 重置 TeX 状态（宏 / 标签）；每次渲染后插件已自动执行。
reset();

// 清除样式缓存与数学 jax 状态。
clearStyle();

// 不再使用该 MarkdownIt 实例时，释放 worker session。
dispose();
```

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
