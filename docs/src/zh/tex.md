---
title: "@mdit/plugin-tex"
shortTitle: "plugin-tex"
icon: square-root-variable
---

提供 $\TeX$ 语法支持的插件。

重复安装插件不会产生效果：首次安装的选项、解析规则与渲染器会继续生效。内部安装该插件的插件（KaTeX 与 MathJax）也遵循此行为。

::: note

此插件面向开发者，如果你正在寻找一个开箱即用的方案，请尝试 [@mdit/plugin-katex](katex.md) 和 [@mdit/plugin-mathjax](mathjax.md) ，它们基于此插件构建。

:::

<!-- more -->

## 使用

```ts
import { tex } from "@mdit/plugin-tex";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(tex, {
  render: (content, displayMode) => {
    // 在此渲染 tex 并返回
  },
});

mdIt.render("$E=mc^2$");
```

这个插件为 $\TeX$ 注册 Markdown 规则。 它将用 `render` 函数的结果替换 $\TeX$ 标记。

## 语法

插件根据 `delimiters` 选项支持不同的分隔符语法：

### 默认语法 (dollars)

- 内联模式：`$xxx$`

- 显示模式：

  ```md
  $$xxx$$

  $$
  xxx
  $$
  ```

### LaTeX 风格 (brackets)

- 内联模式：`\(xxx\)`

- 显示模式：

  ```md
  \[xxx\]

  \[
  xxx
  \]
  ```

### 混合语法 (all)

当 `delimiters` 设置为 `"all"` 时，同时支持美元符号和括号语法。

::: tip 转义

可以通过在 `$` 字符之前使用 `\` 或在 `$` 字符前后添加空格来完成转义：

- $a=1$ 是一个 TeX 方程，而 $ a=1 $ 和 \$a=1$ 不是。

```MD
- $a=1$ 是一个 TeX 方程，而 $ a=1 $ 和 \$a=1$ 不是。
```

:::

## 选项

::: fields
<!-- #region options -->

@`delimiters` type=`"brackets" | "dollars" | "all"` default=`"dollars"`

启用的数学分隔符语法。

- `"brackets"`: 使用 `\(...\)` 表示内联数学，使用 `\[...\]` 表示显示模式数学（LaTeX 风格）。

- `"dollars"`: 使用 `$...$` 表示内联数学，使用 `$$...$$` 表示显示模式数学（常见 Markdown 风格）。

- `"all"`: 启用括号和美元符号两种语法。

@`mathFence` type=boolean default=`false`

是否将解析的数学语言 fence 块转换为显示模式数学。

<!-- #endregion options -->

@`render` type=TexRender required

```ts
/**
 * Tex 渲染函数
 *
 * @param content 文本内容
 * @param displayMode 是否为显示模式
 * @param env MarkdownIt 环境
 * @returns 渲染结果
 */
type TexRender = (content: string, displayMode: boolean, env: MarkdownItEnv) => string;
```

Tex 渲染函数。接收内容、显示模式和环境变量，返回渲染后的字符串。

<!-- #region options-inline -->

@`allowInlineWithSpace` type=boolean default=`false`

是否允许两端带空格的内联数学。不建议将此设置为 true，因为它很可能会破坏 `$` 的默认使用。注意：内容中带空格的字面 `$`（如 `$\text{a $ b}$`）此时会被当作闭合 `$`，从而提前结束表达式。

<!-- #endregion options-inline -->

:::

## 示例

欧拉公式 $e^{i\pi}+1=0$ 是 $\mathbb{R}^2$ 中一个美丽的公式。

```md
欧拉公式 $e^{i\pi}+1=0$ 是 $\mathbb{R}^2$ 中一个美丽的公式。
```

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$

```md
$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$
```

## TeX 教程

### 运算符

- 一些运算符，可以在数学模式下直接输入；另一些需要用控制序列生成:
  - `+`: $+$
  - `-`: $-$
  - `\times`: $\times$
  - `\div`: $\div$
  - `=`: $=$
  - `\pm`: $\pm$
  - `\cdot`: $\cdot$
  - `\cup`: $\cup$
  - `\geq`: $\geq$
  - `\leq`: $\leq$
  - `\neq`: $\neq$
  - `\approx`: $\approx$
  - `\equiv`: $\equiv$
  - `\quad`: $\quad$ (空白分隔符)

- 根式: `\sqrt{xxx}` $\sqrt{xxx}$

- 分式 `\frac{aaa}{bbb}` $\frac{aaa}{bbb}$ (第一个参数为分子，第二个为分母) 。

- 连加: `\sum` $\sum$
- 连乘: `\prod` $\prod$
- 极限: `\lim` $\lim$
- 积分: `\int` $\int$
- 多重积分:
  - `\iint`: $\iint$
  - `\iiint`: $\iiint$
  - `\iiiint`: $\iiiint$
  - `\idotsint` $\idotsint$

::: tip

连加、连乘、极限、积分等大型运算符可以用 `\limits` 和 `\nolimits` 来强制显式地指定是否压缩这些上下标。

`\varoiint`, `\sqint`, `\sqiint`, `\ointctrclockwise`, `\ointclockwise`, `\varointclockwise`, `\varointctrclockwise`, `\fint`, `\landupint`, `\landdownint` 目前不被支持。

:::

::: tip 示例

$\sqrt{x}$, $\frac{1}{2}$.

$\sum_{i=1}^n i\; \prod_{i=1}^n$

$\sum\limits _{i=1}^n i\; \prod\limits_{i=1}^n$

$\iint_1^2 x^2\; \iiint_1^2 x^2\; \iiiint_1^2 x^2\; \idotsint_1^2 x^2$

$\iint\limits_1^2 x^2\; \iiint\limits_1^2 x^2\; \iiiint\limits_1^2 x^2\; \idotsint\limits_1^2 x^2$

$$
\iint_1^2 x^2\; \iiint_1^2 x^2\; \iiiint_1^2 x^2\; \idotsint_1^2 x^2
$$

```md
$\sqrt{x}$, $\frac{1}{2}$.

$\sum_{i=1}^n i\; \prod_{i=1}^n$

$\sum\limits _{i=1}^n i\; \prod\limits_{i=1}^n$

$\iint_1^2 x^2\; \iiint_1^2 x^2\; \iiiint_1^2 x^2\; \idotsint_1^2 x^2$

$\iint\limits_1^2 x^2\; \iiint\limits_1^2 x^2\; \iiiint\limits_1^2 x^2\; \idotsint\limits_1^2 x^2$

$$
\iint_1^2 x^2\; \iiint_1^2 x^2\; \iiiint_1^2 x^2\; \idotsint_1^2 x^2
$$
```

:::

### 符号

- 英文字母可以直接输入

  $a \quad b \quad c \quad x \quad y \quad z \quad A \quad B \quad C$

  ```md
  $a \quad b \quad c \quad x \quad y \quad z \quad A \quad B \quad C$
  ```

- 希腊字母使用 `\characterName` 来输入符号，首字母大写时输出大写字母。

  $\alpha \quad \beta \quad \gamma \quad \Omega \quad \Delta \quad \Gamma$

  ```md
  $\alpha \quad \beta \quad \gamma \quad \Omega \quad \Delta \quad \Gamma$
  ```

- 其他数学表达式可以对应使用

  $\log_{a}{b} \quad \partial x$

  ```md
  $\log_{a}{b} \quad \partial x$
  ```

### 上下标

- 上标，使用 `^` 来实现
- 下标，使用 `_` 来实现
- 上下标默认只作用于之后的一个字符，如果想对连续的几个字符起作用，请将这些字符用花括号 `{}` 括起来。

Einstein ’s $E=mc^2$.

$2^{10} > 1000$

```md
Einstein ’s $E=mc^2$.

$2^{10} > 1000$
```

### 定界符 (括号等)

各种括号用 `()`, `[]`, `\{\}`, `\langle\rangle` 等命令表示。

::: tip

注意花括号通常用来输入命令和环境的参数，所以在数学公式中它们前面要加 `\`。

因为 LaTeX 中 `|` 和 `\|` 的应用过于随意，推荐用 `\lvert\rvert` 和 `\lVert\rVert` 取而代之。

:::

为了调整这些定界符的大小，推荐使用 `\big`, `\Big`, `\bigg`, `\Bigg` 等一系列命令放在上述括号前面调整大小。

$\Biggl(\biggl(\Bigl(\bigl((x)\bigr)\Bigr)\biggr)\Biggr)$
$\Biggl[\biggl[\Bigl[\bigl[[x]\bigr]\Bigr]\biggr]\Biggr]$
$\Biggl \{\biggl \{\Bigl \{\bigl \{\{x\}\bigr \}\Bigr \}\biggr \}\Biggr\}$
$\Biggl\langle\biggl\langle\Bigl\langle\bigl\langle\langle x
\rangle\bigr\rangle\Bigr\rangle\biggr\rangle\Biggr\rangle$
$\Biggl\lvert\biggl\lvert\Bigl\lvert\bigl\lvert\lvert x
\rvert\bigr\rvert\Bigr\rvert\biggr\rvert\Biggr\rvert$
$\Biggl\lVert\biggl\lVert\Bigl\lVert\bigl\lVert\lVert x
\rVert\bigr\rVert\Bigr\rVert\biggr\rVert\Biggr\rVert$

```md
$\Biggl(\biggl(\Bigl(\bigl((x)\bigr)\Bigr)\biggr)\Biggr)$
$\Biggl[\biggl[\Bigl[\bigl[[x]\bigr]\Bigr]\biggr]\Biggr]$
$\Biggl \{\biggl \{\Bigl \{\bigl \{\{x\}\bigr \}\Bigr \}\biggr \}\Biggr\}$
$\Biggl\langle\biggl\langle\Bigl\langle\bigl\langle\langle x
\rangle\bigr\rangle\Bigr\rangle\biggr\rangle\Biggr\rangle$
$\Biggl\lvert\biggl\lvert\Bigl\lvert\bigl\lvert\lvert x
\rvert\bigr\rvert\Bigr\rvert\biggr\rvert\Biggr\rvert$
$\Biggl\lVert\biggl\lVert\Bigl\lVert\bigl\lVert\lVert x
\rVert\bigr\rVert\Bigr\rVert\biggr\rVert\Biggr\rVert$
```

### 省略号

省略号用 `\dots`, `\cdots`, `\vdots`, `\ddots` 等命令表示。

::: tip

`\dots` 和 `\cdots` 的纵向位置不同，前者一般用于有下标的序列。

:::

$x_1,x_2,\dots ,x_n \quad 1,2,\cdots ,n \quad \vdots\quad \ddots$

```md
$x_1,x_2,\dots ,x_n \quad 1,2,\cdots ,n \quad \vdots\quad \ddots$
```

### 矩阵

`pmatrix`, `bmatrix`, `Bmatrix`, `vmatrix`, `Vmatrix` 等环境可以在矩阵两边加上各种分隔符。

$$
\begin{pmatrix} a&b\\c&d \end{pmatrix} \quad
\begin{bmatrix} a&b\\c&d \end{bmatrix} \quad
\begin{Bmatrix} a&b\\c&d \end{Bmatrix} \quad
\begin{vmatrix} a&b\\c&d \end{vmatrix} \quad
\begin{Vmatrix} a&b\\c&d \end{Vmatrix}
$$

```md
$$
\begin{pmatrix} a&b\\c&d \end{pmatrix} \quad
\begin{bmatrix} a&b\\c&d \end{bmatrix} \quad
\begin{Bmatrix} a&b\\c&d \end{Bmatrix} \quad
\begin{vmatrix} a&b\\c&d \end{vmatrix} \quad
\begin{Vmatrix} a&b\\c&d \end{Vmatrix}
$$
```

使用 `smallmatrix` 环境，可以生成行内公式的小矩阵。

一个小矩阵: $( \begin{smallmatrix} a&b\\c&d \end{smallmatrix} )$.

```md
一个小矩阵: $( \begin{smallmatrix} a&b\\c&d \end{smallmatrix} )$.
```

### 多行公式

- **换行**

  使用 `\\` 或 `\newline` 进行换行

  $$
  x = a+b+c+ \\
  d+e+f+g
  $$

  $$
  x = a+b+c+ \newline
  d+e+f+g
  $$

  ```md
  $$
  x = a+b+c+ \\
  d+e+f+g
  $$

  $$
  x = a+b+c+ \newline
  d+e+f+g
  $$
  ```

- **对齐**

  可以使用 `aligned` 环境来实现对齐，使用 `&` 标识固定锚点

  $$
  \begin{aligned}
  x ={}& a+b+c+{} \\
  &d+e+f+g
  \end{aligned}
  $$

  $$
  \begin{alignedat}{2}
     10&x+ &3&y = 2 \\
     3&x+&13&y = 4
  \end{alignedat}
  $$

  ```md
  $$
  \begin{aligned}
  x ={}& a+b+c+{} \\
  &d+e+f+g
  \end{aligned}
  $$

  $$
  \begin{alignedat}{2}
     10&x+ &3&y = 2 \\
     3&x+&13&y = 4
  \end{alignedat}
  $$
  ```

### 公式组

无需对齐的公式组可以使用 `gathered` 环境。

$$
\begin{gathered}
a = b+c+d \\
x = y+z
\end{gathered}
$$

```md
$$
\begin{gathered}
a = b+c+d \\
x = y+z
\end{gathered}
$$
```

### 编号

$$
\tag{1} x+y^{2x}
$$

$$
\tag*{1} x+y^{2x}
$$

```md
$$
\tag{1} x+y^{2x}
$$

$$
\tag*{1} x+y^{2x}
$$
```

### 分段函数

使用 `cases` 环境

$$
y= \begin{cases}
-x,\quad x\leq 0 \\
x,\quad x>0
\end{cases}
$$

```md
$$
y= \begin{cases}
-x,\quad x\leq 0 \\
x,\quad x>0
\end{cases}
$$
```

### 文字

如果你需要在公式中插入文字，请使用 `\text{}`。

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) `2.0.3` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |       18 |            0 |          7 |

以下用例是已记录的差异：

- `word-boundary-close` — The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text; the reference closes the formula before `b`.
- `word-boundary-open` — The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses the formula.
- `adjacent-dollar-inline` — The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the whole line stays literal; the reference parses `$a$` and `$b$` as two formulas.
- `literal-gap-inline` — The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter; the reference gives up at the first `$` that cannot close and emits literal text.
- `block-trailing-content` — A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the trailing content stays a paragraph); the reference swallows the entire line into one display formula.
- `block-trailing-inline-math` — Same as `block-trailing-content`: the current fork falls back to a paragraph and parses `$b$` as inline math, while the reference emits one display formula containing the whole line.
- `empty-block-fence` — The current fork only emits a math block when a closing `$$` exists; the reference emits an empty `math_block` token for a lone `$$`.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       67,235 |       67,559 | 1.00× |
| normal/medium |       17,355 |       17,273 | 1.00× |
| normal/large  |        5,794 |        5,811 | 1.00× |
| heavy/small   |      123,580 |      123,114 | 1.00× |
| heavy/medium  |       63,630 |       63,471 | 1.00× |
| heavy/large   |       32,742 |       32,045 | 1.02× |

几何平均吞吐量比值：1.00×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列                   | 输入规模               | 当前拟合指数 | 参考拟合指数 |
| ---------------------- | ---------------------- | -----------: | -----------: |
| inline-formulas        | 64 / 128 / 256 / 512   |        ~0.97 |        ~0.96 |
| multiline-block-fences | 64 / 128 / 256 / 512   |        ~1.00 |        ~1.00 |
| unmatched-block-fence  | 128 / 256 / 512 / 1024 |        ~1.72 |        ~0.97 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                              | 解压体积 | 入口 gzip |
| ------------------------------- | -------: | --------: |
| @mdit/plugin-tex（当前）        |  61.8 kB |    1.5 kB |
| markdown-it-katex@2.0.3（参考） |  29.9 kB |    2.0 kB |

### 说明

- `@mdit/plugin-tex` is a fork of `markdown-it-katex` with a pluggable renderer and a required `render` option, so rendered output is not comparable: the reference always renders KaTeX HTML while this package delegates rendering. Both sides are compared on the parsed token stream instead (token type, markup, content, and text tokens, so differences in literal `$` handling are visible).
- The required `render` option of the current package is set to a deterministic stub (`\(...\)` / `\[...\]`). It is never invoked because the comparison reads the parsed tokens instead of rendering them, so no real KaTeX work happens on either side.
- Math token content is compared after trimming edge whitespace. The reference trims the first line of a block formula and drops the trailing newline, while the current package preserves both; both implementations pass the same formula payload to their renderer, so the edge formatting is not a behavioral difference and the case `block-edge-space` is reported as an exact match.
- Edge formatting aside, the token streams match on inline math, `$$` fences, escaping, unmatched delimiters, an effectively empty document, and markdown constructs that must not be parsed as math (code spans, fences). Labels are not implemented by either plugin, so no `math_block_label` tokens are compared.
- Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`), and `$$` alone is not a math block.
- Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\(...\)` / `\[...\]`), `mathFence` (` ```math `), `allowInlineWithSpace`, and the `render` callback itself.
- Benchmarks measure parsing only on both sides (the stub renderer is never called and the reference renderer is not invoked), so the two sides do the same work. The corpora stay small on purpose: 24 inline formulas for `normal/large` and 24 inline plus 8 display formulas for `heavy/large`.
- Scaling series probe the delimiter scanners: many unmatched `$$` fence lines (the current `math_block` rule scans ahead even in silent mode and the paragraph terminator calls it once per line, so the fitted exponent is well above 1 and approaches 2 asymptotically; the reference short-circuits in silent mode and then consumes the rest of the document as a single block, staying linear), many inline formulas, and many closed multi-line `$$` fences (the reference re-scans the document prefix to find the closing line).
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
