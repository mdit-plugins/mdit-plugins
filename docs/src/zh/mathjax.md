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
- `createMathjaxInstance` 只保留在 `@mdit/plugin-mathjax/async` 中，主入口不再导出它。
- `@mdit/plugin-mathjax/sync` 已被移除；在 Node.js 下主入口本身就是同步的。
- 不再需要创建、传递或 await 实例。请通过 `getMathjax(md)` 获取 `outputStyle`、`reset`、`clearStyle` 与 `dispose`。
- 同步主入口依赖 Node.js（`worker_threads`）。浏览器或不支持 worker 线程的运行时请使用 `./async`。
- 选项必须可结构化克隆。函数类选项会被明确拒绝并提示改用异步入口，详见[选项](#选项)。
- HTML 相关 TeX 包（`html` 与 `texhtml`）不再默认启用：开启 markdown-it 的 `html` 选项时会加入默认列表，也可以通过 `tex.packages` 显式启用，详见[安全](#安全)。
- 字体扩展 TeX 包（`bbm`、`bboldx` 与 `dsfont`）不再默认启用：内置的 NewCM 字体不包含它们的扩展数据。`\mathbb` 现在使用标准的 double-struck 变体；依赖这些扩展的命令（`\mathbbm`、`\mathds` 等）需通过 `tex.packages` 显式启用对应包，详见下文「字体与 TeX 包限制」。

:::

### 迁移

迁移前（v1）：

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

`@mdit/plugin-mathjax-slim` 包也同步发生了变化：主入口使用新的同步 API（`@mathjax/src` 与 `@mathjax/mathjax-newcm-font` 仍为可选对等依赖），`./async` 保留实例 API，`./sync` 被移除；除此之外用法与 `@mdit/plugin-mathjax` 相同。本仓库通过 pnpm patch 让 VuePress 的 `@vuepress/plugin-markdown-math` 暂时使用 v2 API，待上游发布后移除补丁。

## 语法

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

是否包含供屏幕阅读器使用的辅助 MathML。关闭后数学公式仍会渲染，但不再输出隐藏的 `<mjx-assistive-mml>`。

@`tex` type=MathJaxTexInputOptions

TeX 输入选项。默认包列表不包含 HTML 相关包与字体扩展包，详见下文「字体与 TeX 包限制」。

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

## 安全

`html` TeX 包提供 `\href`、`\class`、`\style`、`\cssId` 等宏，可以生成可点击链接并向输出注入属性；`texhtml` 会注册原始 `<tex-html>` 支持（除非开启 MathJax 的 `allowTexHTML` 选项，否则不生效）。开启它们渲染不可信 TeX 输入时，`\href{javascript:...}` 会变成可点击的脚本链接。

默认包列表不启用它们：使用 `new MarkdownIt()`（关闭原始 HTML）时不会加载 HTML 相关包。仅当 markdown-it 实例开启原始 HTML 时，才会把它们加入默认列表：

```ts
// 默认：不加载 HTML 相关 TeX 包，`\href` 会渲染为红色的宏占位符
const safeMd = new MarkdownIt().use(mathjax);

// 开启 Markdown 中的原始 HTML 后，默认也会启用 HTML 相关 TeX 包
const trustedMd = new MarkdownIt({ html: true }).use(mathjax);
```

显式提供的 `tex.packages` 列表视为可信的开发者配置并原样使用，因此即使关闭 Markdown 中的原始 HTML，也可以启用 HTML 相关包：

```ts
const md = new MarkdownIt().use(mathjax, {
  tex: { packages: ["ams", "html", "texhtml"] },
});
```

仅在 TeX 输入可信时启用它们：显式配置并不会让不可信的 Markdown 变得安全，`\href{javascript:...}` 仍然是脚本链接。

`html` 选项在插件安装（`md.use(...)`）时读取；之后通过 `md.set()` 修改不会生效。

异步入口中，由传给 `md.use(mathjax, instance)` 的 markdown-it 实例的 `html` 选项在安装时决定默认列表。MathJax 实例持有共享的 TeX 状态，因此只能安装到一个 markdown-it 实例上；每个实例（尤其是信任级别不同的实例）都应使用单独的 `createMathjaxInstance()` 结果。

## 字体与 TeX 包限制

插件内置 MathJax 的 NewCM 字体（`@mathjax/mathjax-newcm-font`）。标准数学变体可以直接使用：`\mathbb` 渲染为 double-struck（双线体）、`\mathcal` 为书法体、`\mathfrak` 为哥特体等；字体文件通过 MathJax 的动态字体加载器按需加载。

内置字体不包含 `bbm`、`bboldx`、`dsfont` 这三个 TeX 包所需的字体扩展数据，因此这些包默认不启用：加载它们会用缺失的字体变体替换标准宏（如 `\mathbb`），在 `Invalid variant` 警告后回退为普通字形。即使通过 `tex.packages` 显式启用，`\mathbbm`、`\mathds` 等命令仍会因扩展数据缺失而告警并回退。

同步主入口会把选项发送到 worker，因此无法使用自定义 `fontData`；如需带额外扩展的自定义字体，请使用 `@mdit/plugin-mathjax/async`。

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

@`warmup` type=`(options?: WarmupOptions) => void`

同步初始化 worker 与 MathJax session，使首篇文档不必承担一次性初始化开销（约 100ms）。`warmup({ preloadFonts: true })` 还会加载全部动态字体文件，首次调用时 SVG 约需额外 73ms，CHTML 约需额外 35ms。由于该调用会阻塞，若你需要可预期的耗时，请在一批渲染开始前调用。

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

// 现在初始化，而不是等到首篇文档渲染时。
warmup();

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

<!-- comparison:start -->

## 对比

下表将每个包与其上游参考实现进行对比。

### @mdit/plugin-mathjax

与上游 [`markdown-it-mathjax3`](https://www.npmjs.com/package/markdown-it-mathjax3) `5.2.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

#### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |        8 |           11 |          6 |

以下用例是已记录的差异：

- `tag-numbered` — `\tag{1}` is laid out identically, but MathJax 4 splits the tag into `<mtext>(</mtext><mtext>1</mtext><mtext>)</mtext>` while MathJax 3 emits a single `<mtext>(1)</mtext>` in the assistive MathML.
- `inline-adjacent-word` — The reference delimiter check has no word-boundary rule, so it parses `a$x$b` as inline math; the current package requires a word boundary around `$` so that currency amounts stay literal (see `plain-dollar-currency`).
- `block-unclosed` — An unclosed `$$` block is still emitted as display math by the reference: its `math_block` rule scans to the end of the document and then pushes the token anyway. The current package only starts a block when the closing `$$` exists and otherwise falls back to a paragraph.
- `block-trailing-inline` — The reference parses `$$a=1$$ and $b=2$` as one display-math block that swallows the trailing inline expression; the current package keeps the line as a paragraph and renders `$b=2$` as inline math.
- `escaped-backslash-dollar` — `$a\\$b`: the reference counts the preceding backslash run differently and closes the math after the escaped backslash (`\\` then `$`), while the current package treats a `$` preceded by an even number of backslashes as escaped and keeps the line literal.
- `text-with-dollar` — The reference stops scanning at the whitespace-surrounded `$` inside `\text{…}` and leaves the whole line literal; the current package treats that `$` as literal TeX content, keeps scanning to the final `$` and renders an error node.

#### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |        1,650 |        1,785 | 0.92× |
| normal/medium |          626 |          608 | 1.03× |
| normal/large  |          308 |          263 | 1.17× |
| heavy/small   |          699 |          609 | 1.15× |
| heavy/medium  |          255 |          239 | 1.07× |
| heavy/large   |          122 |          109 | 1.13× |

几何平均吞吐量比值：1.07×（共 6 个用例）；大于 1× 表示当前包更快。

#### 复杂度缩放

| 系列              | 输入规模                  | 当前拟合指数 | 参考拟合指数 |
| ----------------- | ------------------------- | -----------: | -----------: |
| block-fences      | 32 / 64 / 128 / 256       |        ~0.99 |        ~1.01 |
| inline-formulas   | 32 / 64 / 128 / 256       |        ~1.01 |        ~1.00 |
| unclosed-block    | 256 / 512 / 1024 / 2048   |        ~0.99 |        ~1.46 |
| unmatched-dollars | 1024 / 2048 / 4096 / 8192 |        ~0.97 |        ~0.99 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

#### 包体积

| 包                                 | 解压体积 | 入口 gzip |
| ---------------------------------- | -------: | --------: |
| @mdit/plugin-mathjax（当前）       | 117.4 kB |    1.7 kB |
| markdown-it-mathjax3@5.2.0（参考） |  14.6 kB |    1.7 kB |

### @mdit/plugin-mathjax-slim

与上游 [`markdown-it-mathjax3`](https://www.npmjs.com/package/markdown-it-mathjax3) `5.2.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

#### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |        8 |           11 |          6 |

以下用例是已记录的差异：

- `tag-numbered` — `\tag{1}` is laid out identically, but MathJax 4 splits the tag into `<mtext>(</mtext><mtext>1</mtext><mtext>)</mtext>` while MathJax 3 emits a single `<mtext>(1)</mtext>` in the assistive MathML.
- `inline-adjacent-word` — The reference delimiter check has no word-boundary rule, so it parses `a$x$b` as inline math; the current package requires a word boundary around `$` so that currency amounts stay literal (see `plain-dollar-currency`).
- `block-unclosed` — An unclosed `$$` block is still emitted as display math by the reference: its `math_block` rule scans to the end of the document and then pushes the token anyway. The current package only starts a block when the closing `$$` exists and otherwise falls back to a paragraph.
- `block-trailing-inline` — The reference parses `$$a=1$$ and $b=2$` as one display-math block that swallows the trailing inline expression; the current package keeps the line as a paragraph and renders `$b=2$` as inline math.
- `escaped-backslash-dollar` — `$a\\$b`: the reference counts the preceding backslash run differently and closes the math after the escaped backslash (`\\` then `$`), while the current package treats a `$` preceded by an even number of backslashes as escaped and keeps the line literal.
- `text-with-dollar` — The reference stops scanning at the whitespace-surrounded `$` inside `\text{…}` and leaves the whole line literal; the current package treats that `$` as literal TeX content, keeps scanning to the final `$` and renders an error node.

#### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |        1,723 |        1,731 | 1.00× |
| normal/medium |          742 |          684 | 1.08× |
| normal/large  |          295 |          257 | 1.15× |
| heavy/small   |          703 |          630 | 1.12× |
| heavy/medium  |          304 |          258 | 1.18× |
| heavy/large   |          134 |          110 | 1.22× |

几何平均吞吐量比值：1.12×（共 6 个用例）；大于 1× 表示当前包更快。

#### 复杂度缩放

| 系列              | 输入规模                  | 当前拟合指数 | 参考拟合指数 |
| ----------------- | ------------------------- | -----------: | -----------: |
| block-fences      | 32 / 64 / 128 / 256       |        ~0.90 |        ~0.91 |
| inline-formulas   | 32 / 64 / 128 / 256       |        ~1.02 |        ~0.99 |
| unclosed-block    | 256 / 512 / 1024 / 2048   |        ~0.99 |        ~1.75 |
| unmatched-dollars | 1024 / 2048 / 4096 / 8192 |        ~1.04 |        ~1.05 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

#### 包体积

| 包                                 | 解压体积 | 入口 gzip |
| ---------------------------------- | -------: | --------: |
| @mdit/plugin-mathjax-slim（当前）  | 125.7 kB |    1.7 kB |
| markdown-it-mathjax3@5.2.0（参考） |  14.6 kB |    1.7 kB |

### 说明

- **@mdit/plugin-mathjax**: The synchronous entry is compared (`installSyncMathjax`, also exported as `mathjax`): the reference renders synchronously and the async entry of the current package exposes a different API (it takes a MathJax instance instead of plugin options). The sync entry renders MathJax in a worker thread and blocks on one IPC round-trip per document (plus one reset round-trip); the reference typesets in-process through `deasync`.
- **@mdit/plugin-mathjax**: Equivalent options: `{ output: "svg" }` (the current default) matches the reference, which only produces SVG. Both sides use `$` / `$$` delimiters only (`delimiters: "dollars"`, `mathFence: false`, `allowInlineWithSpace: false`) and render assistive MathML by default (`a11y: true`). The default `renderStrategy: "batch"` converts every formula of a document (one worker batch), the same number of MathJax conversions as the reference performs per formula.
- **@mdit/plugin-mathjax**: Normalization: the reference wraps every formula in `<span id="mjx-<hash>"><style>…full MathJax stylesheet…</style> formula </span>`. The id and the inlined CSS are generated per formula (the current package returns the stylesheet once through `getMathjax(md).outputStyle()`), so the wrapper and its template whitespace are normalized away.
- **@mdit/plugin-mathjax**: Normalization: formulas are compared by their assistive MathML instead of the SVG, because the current package renders with MathJax 4 (`@mathjax/src` + the newcm font) while the reference bundles MathJax 3 (`mathxyjax3`'s `tex-svg-full`). SVG paths, widths and `viewBox` values therefore differ by font version by design. Generated `data-*` metadata attributes and presentational `<mstyle>` wrappers are dropped; the MathML tree, its text and MathJax error content stay visible.
- **@mdit/plugin-mathjax**: The reference duplicates its whole stylesheet inside every formula (about 4 KiB per formula), which is why its raw output is much larger per formula; that is a known output-size difference of the reference wrapper, not a rendering difference.
- **@mdit/plugin-mathjax**: Scaling series: `inline-formulas`, `unmatched-dollars` and `block-fences` check the delimiter scans of the reference (its `math_inline` rescan of `$` candidates and the block loop over `$$` fences); all three fit an exponent near 1 on both sides. `unclosed-block` targets the reference's `math_block` rule: without a closing `$$` it still pushes a display-math token that swallows the rest of the document, so MathJax lays out the whole remaining file as one formula and the measured cost grows superlinearly (fitted exponent ~1.4-1.5), while the current package falls back to a paragraph and stays linear.
- **@mdit/plugin-mathjax-slim**: The synchronous entry is compared (`installSyncMathjax`, also exported as `mathjax`): the reference renders synchronously and the async entry of the current package exposes a different API (it takes a MathJax instance instead of plugin options). The sync entry renders MathJax in a worker thread and blocks on one IPC round-trip per document (plus one reset round-trip); the reference typesets in-process through `deasync`.
- **@mdit/plugin-mathjax-slim**: `@mdit/plugin-mathjax-slim` keeps `@mathjax/src` and `@mathjax/mathjax-newcm-font` as optional peer dependencies and imports them dynamically inside the worker; the session code, options and rendered output are identical to `@mdit/plugin-mathjax`, so the same cases, options and normalization are used for both packages.
- **@mdit/plugin-mathjax-slim**: Equivalent options: `{ output: "svg" }` (the current default) matches the reference, which only produces SVG. Both sides use `$` / `$$` delimiters only (`delimiters: "dollars"`, `mathFence: false`, `allowInlineWithSpace: false`) and render assistive MathML by default (`a11y: true`). The default `renderStrategy: "batch"` converts every formula of a document (one worker batch), the same number of MathJax conversions as the reference performs per formula.
- **@mdit/plugin-mathjax-slim**: Normalization: the reference wraps every formula in `<span id="mjx-<hash>"><style>…full MathJax stylesheet…</style> formula </span>`. The id and the inlined CSS are generated per formula (the current package returns the stylesheet once through `getMathjax(md).outputStyle()`), so the wrapper and its template whitespace are normalized away.
- **@mdit/plugin-mathjax-slim**: Normalization: formulas are compared by their assistive MathML instead of the SVG, because the current package renders with MathJax 4 (`@mathjax/src` + the newcm font) while the reference bundles MathJax 3 (`mathxyjax3`'s `tex-svg-full`). SVG paths, widths and `viewBox` values therefore differ by font version by design. Generated `data-*` metadata attributes and presentational `<mstyle>` wrappers are dropped; the MathML tree, its text and MathJax error content stay visible.
- **@mdit/plugin-mathjax-slim**: The reference duplicates its whole stylesheet inside every formula (about 4 KiB per formula), which is why its raw output is much larger per formula; that is a known output-size difference of the reference wrapper, not a rendering difference.
- **@mdit/plugin-mathjax-slim**: Scaling series: `inline-formulas`, `unmatched-dollars` and `block-fences` check the delimiter scans of the reference (its `math_inline` rescan of `$` candidates and the block loop over `$$` fences); all three fit an exponent near 1 on both sides. `unclosed-block` targets the reference's `math_block` rule: without a closing `$$` it still pushes a display-math token that swallows the rest of the document, so MathJax lays out the whole remaining file as one formula and the measured cost grows superlinearly (fitted exponent ~1.4-1.5), while the current package falls back to a paragraph and stays linear.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
