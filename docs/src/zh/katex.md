---
title: "@mdit/plugin-katex"
shortTitle: "plugin-katex"
icon: square-root-variable
---

使用 KaTeX 呈现数学表达式的插件。

::: note

这个插件基于 [@mdit/plugin-tex](tex.md)。

:::

<!-- more -->

## 使用

```ts
import { katex } from "@mdit/plugin-katex";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

我们也有一个 `@mdit/plugin-katex-slim` 包，其中 `katex` 是可选对等依赖。

## 语法

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

## 选项

此插件扩展了 KaTeX 选项。可用选项包括：

::: fields
<!-- @include: ./tex.md#options -->
<!-- @include: ./tex.md#options-inline -->

@`logger` type=KatexLogger

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
  token: Token | undefined,
  env: MarkdownItEnv,
) => "error" | "warn" | "ignore" | boolean | undefined;
```

错误日志记录器函数。

@`transformer` type=`(content: string, displayMode: boolean) => string`

输出内容的转换器函数。

:::

## 示例

::: preview 示例

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$

:::

## mhchem 扩展

如果你想加载 `mhchem` 扩展，你应该导入 `@mdit/plugin-katex/mhchem`:

```ts
import { katex } from "@mdit/plugin-katex";
import "@mdit/plugin-katex/mhchem";
```

## 支持列表

- [KaTeX 支持功能](https://katex.org/docs/supported.html)
- [KaTeX 支持列表](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-教程)

<!-- comparison:start -->

## 对比

下表将每个包与其上游参考实现进行对比。

### @mdit/plugin-katex

与上游 [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) `2.0.3` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

#### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |       11 |            8 |          6 |

以下用例是已记录的差异：

- `word-boundary-close` — The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text and nothing is rendered; the reference parses and renders `a`.
- `word-boundary-open` — The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses and renders `x`.
- `adjacent-dollar-inline` — The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the line stays literal; the reference renders `$a$` and `$b$` as two formulas.
- `literal-gap-inline` — The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter, then renders the formula; the reference gives up at the first `$` that cannot close and emits literal text.
- `block-trailing-content` — A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the line stays a paragraph); the reference renders the whole line as one display formula and KaTeX reports an error for the trailing text.
- `macro-scope` — Macros defined with the `gdef` command are shared between the formulas of one document by the current package, so the second formula renders `x`; the reference creates fresh KaTeX settings per formula, so the macro is undefined there and renders as a KaTeX error.

#### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       16,112 |       16,238 | 0.99× |
| normal/medium |        4,540 |        4,563 | 1.00× |
| normal/large  |        1,514 |        1,545 | 0.98× |
| heavy/small   |        7,369 |        7,458 | 0.99× |
| heavy/medium  |        3,671 |        3,789 | 0.97× |
| heavy/large   |        1,845 |        1,898 | 0.97× |

几何平均吞吐量比值：0.98×（共 6 个用例）；大于 1× 表示当前包更快。

#### 复杂度缩放

| 系列             | 输入规模             | 当前拟合指数 | 参考拟合指数 |
| ---------------- | -------------------- | -----------: | -----------: |
| display-formulas | 16 / 32 / 64 / 128   |        ~1.00 |        ~1.01 |
| inline-formulas  | 32 / 64 / 128 / 256  |        ~1.01 |        ~1.01 |
| long-formula     | 64 / 128 / 256 / 512 |        ~0.99 |        ~0.95 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

#### 包体积

| 包                              | 解压体积 | 入口 gzip |
| ------------------------------- | -------: | --------: |
| @mdit/plugin-katex（当前）      |  37.2 kB |     605 B |
| markdown-it-katex@2.0.3（参考） |  29.9 kB |    2.0 kB |

### @mdit/plugin-katex-slim

与上游 [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) `2.0.3` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

#### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |       11 |            8 |          6 |

以下用例是已记录的差异：

- `word-boundary-close` — The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text and nothing is rendered; the reference parses and renders `a`.
- `word-boundary-open` — The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses and renders `x`.
- `adjacent-dollar-inline` — The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the line stays literal; the reference renders `$a$` and `$b$` as two formulas.
- `literal-gap-inline` — The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter, then renders the formula; the reference gives up at the first `$` that cannot close and emits literal text.
- `block-trailing-content` — A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the line stays a paragraph); the reference renders the whole line as one display formula and KaTeX reports an error for the trailing text.
- `macro-scope` — Macros defined with the `gdef` command are shared between the formulas of one document by the current package, so the second formula renders `x`; the reference creates fresh KaTeX settings per formula, so the macro is undefined there and renders as a KaTeX error.

#### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       17,180 |       17,580 | 0.98× |
| normal/medium |        4,532 |        4,687 | 0.97× |
| normal/large  |        1,469 |        1,542 | 0.95× |
| heavy/small   |        6,804 |        7,095 | 0.96× |
| heavy/medium  |        3,448 |        3,595 | 0.96× |
| heavy/large   |        1,643 |        1,487 | 1.10× |

几何平均吞吐量比值：0.99×（共 6 个用例）；大于 1× 表示当前包更快。

#### 复杂度缩放

| 系列             | 输入规模             | 当前拟合指数 | 参考拟合指数 |
| ---------------- | -------------------- | -----------: | -----------: |
| display-formulas | 16 / 32 / 64 / 128   |        ~1.00 |        ~1.00 |
| inline-formulas  | 32 / 64 / 128 / 256  |        ~0.94 |        ~0.95 |
| long-formula     | 64 / 128 / 256 / 512 |        ~0.96 |        ~0.95 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

#### 包体积

| 包                              | 解压体积 | 入口 gzip |
| ------------------------------- | -------: | --------: |
| @mdit/plugin-katex-slim（当前） |  13.9 kB |     673 B |
| markdown-it-katex@2.0.3（参考） |  29.9 kB |    2.0 kB |

### 说明

- **@mdit/plugin-katex**: This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.
- **@mdit/plugin-katex**: The benchmark still shows a small gap that is not plugin overhead: this ESM package resolves `katex` through the `import` condition (`dist/katex.mjs`) while the CJS reference resolves `dist/katex.js`. The identical KaTeX 0.19.1 code runs about 4.5% faster as CJS on Node, so with both sides forced onto the same KaTeX build the packages measure at parity; neither package allocates KaTeX options per formula any more.
- **@mdit/plugin-katex**: Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it (the MathML `annotation` echoes the input formula, so its edge whitespace differs). The visible KaTeX HTML is unchanged by either normalization, and both are documented here rather than hidden.
- **@mdit/plugin-katex**: `throwOnError: false` is set on both sides so that invalid LaTeX is handled the same way. This is already the default of the current package; with the reference's defaults the reference instead emits the raw LaTeX from its own `catch` block, which is a documented default difference and not compared.
- **@mdit/plugin-katex**: Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), and a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`).
- **@mdit/plugin-katex**: One difference is a feature, not a regression: macros defined with `\gdef` are shared between the formulas of one document by the current package (`macros` is a single object per render), while the reference creates fresh KaTeX settings for every formula, so a later formula cannot use an earlier `\gdef`. The case documents this.
- **@mdit/plugin-katex**: Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\(...\)` / `\[...\]`), `mathFence` (` ```math `), `allowInlineWithSpace`, `transformer`, and the `logger` callback.
- **@mdit/plugin-katex**: Benchmarks render real KaTeX on both sides (display and inline) with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.
- **@mdit/plugin-katex**: Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.
- **@mdit/plugin-katex-slim**: This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.
- **@mdit/plugin-katex-slim**: The benchmark still shows a small gap that is not plugin overhead: this ESM package resolves `katex` through the `import` condition (`dist/katex.mjs`) while the CJS reference resolves `dist/katex.js`. The identical KaTeX 0.19.1 code runs about 4.5% faster as CJS on Node, so with both sides forced onto the same KaTeX build the packages measure at parity; neither package allocates KaTeX options per formula any more.
- **@mdit/plugin-katex-slim**: `@mdit/plugin-katex-slim` is the same tex + KaTeX composition as `@mdit/plugin-katex`; the only difference is that it loads KaTeX with a dynamic `import("katex")` at module initialization and throws when KaTeX is not installed. The comparison therefore uses the same cases and the results should match `plugin-katex`.
- **@mdit/plugin-katex-slim**: Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it (the MathML `annotation` echoes the input formula, so its edge whitespace differs). The visible KaTeX HTML is unchanged by either normalization, and both are documented here rather than hidden.
- **@mdit/plugin-katex-slim**: `throwOnError: false` is set on both sides so that invalid LaTeX is handled the same way. This is already the default of the current package; with the reference's defaults the reference instead emits the raw LaTeX from its own `catch` block, which is a documented default difference and not compared.
- **@mdit/plugin-katex-slim**: Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), and a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`).
- **@mdit/plugin-katex-slim**: One difference is a feature, not a regression: macros defined with `\gdef` are shared between the formulas of one document by the current package (`macros` is a single object per render), while the reference creates fresh KaTeX settings for every formula, so a later formula cannot use an earlier `\gdef`. The case documents this.
- **@mdit/plugin-katex-slim**: Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\(...\)` / `\[...\]`), `mathFence` (` ```math `), `allowInlineWithSpace`, `transformer`, and the `logger` callback.
- **@mdit/plugin-katex-slim**: Benchmarks render real KaTeX on both sides with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.
- **@mdit/plugin-katex-slim**: Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
