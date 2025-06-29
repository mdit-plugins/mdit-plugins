---
title: "@mdit/plugin-tex"
icon: square-root-variable
---

提供 $\TeX$ 语法支持的插件。

::: note

此插件面向开发者，如果你正在寻找一个开箱即用的方案，请尝试 [@mdit/plugin-katex](katex.md) 和 [@mdit/plugin-mathjax](mathjax.md) ，它们基于此插件构建。

:::

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { figure } from "@mdit/plugin-figure";

const mdIt = MarkdownIt().use(figure, {
  render: (content, displayMode) => {
    // 在此渲染 tex 并返回
  },
});

mdIt.render("$E=mc^2$");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { figure } = require("@mdit/plugin-figure");

const mdIt = MarkdownIt().use(figure, {
  render: (content, displayMode) => {
    // 在此渲染 tex 并返回
  },
});

mdIt.render("$E=mc^2$");
```

:::

这个插件为 $\TeX$ 注册 Markdown 规则。 它将用 `render` 函数的结果替换 $\TeX$ 标记。

## 选项

```ts
interface MarkdownItTexOptions {
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
   * 是否将解析的数学语言 fence 块转换为显示模式数学
   *
   * @default false
   */
  mathFence?: boolean;

  /**
   * Tex 渲染函数
   *
   * @param content 文本内容
   * @param displayMode 是否是显示模式
   * @param env MarkdownIt 环境变量
   * @returns 渲染结果
   */
  render: (content: string, displayMode: boolean, env: MarkdownItEnv) => string;

  /**
   * 是否允许两端带空格的内联数学
   *
   * @description 不建议将此设置为 true，因为它很可能会破坏 $ 的默认使用
   *
   * @default false
   */
  allowInlineWithSpace?: boolean;
}
```

## 格式

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

## 示例

### 行内语法

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

$\sum\limits _{i=1}^n i\; \prod\limits _{i=1}^n$

$\iint_1^2 x^2\; \iiint_1^2 x^2\; \iiiint_1^2 x^2\; \idotsint_1^2 x^2$

$\iint\limits_1^2 x^2\; \iiint\limits_1^2 x^2\; \iiiint\limits_1^2 x^2\; \idotsint\limits_1^2 x^2$

$$\iint_1^2 x^2\; \iiint_1^2 x^2\; \iiiint_1^2 x^2\; \idotsint_1^2 x^2$$
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

#### 例子

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
  x = a+b+c+{} \\
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

无需对齐的公式组可以使用 `gather` 环境。

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
$\tag{1} x+y^{2x}$

$\tag*{1} x+y^{2x}$
```

### 分段函数

使用 `case` 环境

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
