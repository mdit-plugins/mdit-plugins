---
title: "@mdit/plugin-tex"
shortTitle: "plugin-tex"
icon: square-root-variable
---

Plugins for $\TeX$ grammar support.

Installing the plugin twice is a no-op: the first installation's options, parser rules and renderers stay in effect. Plugins that install it internally (KaTeX and MathJax) inherit this behavior.

::: note

This plugin is facing developers.

If you are looking for an out of box solution, you should try [@mdit/plugin-katex](katex.md) and [@mdit/plugin-mathjax](mathjax.md), which are based on this plugin.

:::

<!-- more -->

## Usage

```ts
import { tex } from "@mdit/plugin-tex";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(tex, {
  render: (content, displayMode) => {
    // render tex here and return
  },
});

mdIt.render("$E=mc^2$");
```

This plugin registers markdown rules for $\TeX$. It will replace the $\TeX$ tokens with the result of `render` function.

## Syntax

The plugin supports different delimiter syntaxes based on the `delimiters` option:

### Default Syntax (dollars)

- Inline mode: `$xxx$`

- Display mode:

  ```md
  $$xxx$$

  $$
  xxx
  $$
  ```

### LaTeX Style (brackets)

- Inline mode: `\(xxx\)`

- Display mode:

  ```md
  \[xxx\]

  \[
  xxx
  \]
  ```

### Mixed Syntax (all)

When `delimiters` is set to `"all"`, both dollar and bracket syntaxes are supported.

::: tip Escaping

Escaping can be done by using `\` before the `$` character, or adding space both before and after the `$` character:

- The $a=1$ is a TeX equation, while $ a=1 $ and \$a=1$ is not.

```md
- The $a=1$ is a TeX equation, while $ a=1 $ and \$a=1$ is not.
```

:::

## Options

::: fields
<!-- #region options -->

@`delimiters` type=`"brackets" | "dollars" | "all"` default=`"dollars"`

Math delimiter syntax to enable.

- `"brackets"`: Use `\(...\)` for inline math and `\[...\]` for display math (LaTeX style).

- `"dollars"`: Use `$...$` for inline math and `$$...$$` for display math (common Markdown style).

- `"all"`: Enable both bracket and dollar syntaxes.

@`mathFence` type=boolean default=`false`

Whether parsed fence block with math language to display mode math.

<!-- #endregion options -->

@`render` type=TexRender required

```ts
/**
 * Tex Render function
 *
 * @param content Text content
 * @param displayMode Whether is display mode
 * @param env MarkdownIt environment
 * @returns Render result
 */
type TexRender = (content: string, displayMode: boolean, env: MarkdownItEnv) => string;
```

Tex Render function. Takes content, displayMode, and environment, returns rendered string.

<!-- #region options-inline -->

@`allowInlineWithSpace` type=boolean default=`false`

Whether to allow inline math with spaces on ends. NOT recommended to set this to true, because it will likely break the default usage of `$`. Note that a space-padded literal `$` inside the content (e.g. `$\text{a $ b}$`) is then treated as a closing `$`, closing the expression early.

<!-- #endregion options-inline -->

:::

## Demo

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

```md
Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.
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

## Tex Tutorial

### Operator

- Some operators can be entered directly in math mode; others need to be generated using control sequences:
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
  - `\quad`: $\quad$ (blank separator)

- Radical: `\sqrt{xxx}` $\sqrt{xxx}$

- Fraction `\frac{aaa}{bbb}` $\frac{aaa}{bbb}$ (the first parameter is the numerator and the second is the denominator).

- Sum: `\sum` $\sum$

- Tandem: `\prod` $\prod$

- Limit: `\lim` $\lim$

- Points: `\int` $\int$

- Multiple points:
  - `\iint`: $\iint$
  - `\iiint`: $\iiint$
  - `\iiiint`: $\iiiint$
  - `\idotsint` $\idotsint$

::: tip

Large operators such as continuous addition, multiplication, limits, and integrals can use `\limits` and `\nolimits` to force explicitly specify compress these superscripts or not.

`\varoiint`, `\sqint`, `\sqiint`, `\ointctrclockwise`, `\ointclockwise`, `\varointclockwise`, `\varointctrclockwise`, `\fint`, `\landupint`, `\landdownint` are not supported currently.

:::

::: tip Case

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

### Symbol

- English letters can be entered directly

  $a \quad b \quad c \quad x \quad y \quad z \quad A \quad B \quad C$

  ```md
  $a \quad b \quad c \quad x \quad y \quad z \quad A \quad B \quad C$
  ```

- Greek characters use `\characterName` to enter symbols, and output capital letters when the first letter is capitalized.

  $\alpha \quad \beta \quad \gamma \quad \Omega \quad \Delta \quad \Gamma$

  ```md
  $\alpha \quad \beta \quad \gamma \quad \Omega \quad \Delta \quad \Gamma$
  ```

- Other mathematical expressions can be used correspondingly

  $\log_{a}{b} \quad \partial x$

  ```md
  $\log_{a}{b} \quad \partial x$
  ```

### Superscript and Subscript

- Superscript, use `^` to achieve
- Subscript, use `_` to achieve
- By default, superscript and subscript only apply to the next character. To work with multiple consecutive characters, please enclose these characters in curly brackets `{}`.

Einstein ’s $E=mc^2$.

$2^{10} > 1000$

```md
Einstein ’s $E=mc^2$.

$2^{10} > 1000$
```

### Delimiters (parentheses, etc.)

Various parentheses are represented by commands such as `()`, `[]`, `\{\}`, `\langle\rangle`.

::: tip

Note that curly braces are usually used to enter command and environment parameters, so they must be preceded by `\` in mathematical formulas.

Because the application of `|` and `\|` in LaTeX is too casual, we recommend using `\lvert\rvert` and `\lVert\rVert` instead.

:::

To adjust the size of these delimiters, we recommend using `\big`, `\Big`, `\bigg`, `\Bigg` and a series of commands to adjust the size before the above brackets.

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

### Ellipsis

The ellipsis is represented by commands such as `\dots`,`\cdots`, `\vdots`,`\ddots`.

::: tip

`\dots` and`\cdots` have different vertical positions. The former is generally used for subscripted sequences.

:::

$x_1,x_2,\dots ,x_n \quad 1,2,\cdots ,n \quad \vdots\quad \ddots$

```md
$x_1,x_2,\dots ,x_n \quad 1,2,\cdots ,n \quad \vdots\quad \ddots$
```

### Matrix

`pmatrix`, `bmatrix`, `Bmatrix`, `vmatrix`, `Vmatrix` and other environments can add various separators on both sides of the matrix.

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

Using the `smallmatrix` environment, you can generate small matrices of inline formulas.

A small matrix: $( \begin{smallmatrix} a&b\\c&d \end{smallmatrix} )$.

```md
A small matrix: $( \begin{smallmatrix} a&b\\c&d \end{smallmatrix} )$.
```

### Multi-line Formula

- **newline**

  Use `\\` or `\newline` to wrap

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

- **Alignment**

  You can use the `aligned` environment to achieve alignment, and`&`to identify fixed anchor points

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

### Formula Group

Formula groups that do not require alignment can use the `gathered` environment.

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

### Numbering

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

### Segmented Functions

Use `cases` environment

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

### Text

To insert text in TeX, you should use `\text{}` to wrap them.

<!-- comparison:start -->

## Comparison

Compared against the upstream [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) package `2.0.3`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |    18 |          0 |                7 |

The following cases are documented differences:

- `word-boundary-close` — The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text; the reference closes the formula before `b`.
- `word-boundary-open` — The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses the formula.
- `adjacent-dollar-inline` — The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the whole line stays literal; the reference parses `$a$` and `$b$` as two formulas.
- `literal-gap-inline` — The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter; the reference gives up at the first `$` that cannot close and emits literal text.
- `block-trailing-content` — A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the trailing content stays a paragraph); the reference swallows the entire line into one display formula.
- `block-trailing-inline-math` — Same as `block-trailing-content`: the current fork falls back to a paragraph and parses `$b$` as inline math, while the reference emits one display formula containing the whole line.
- `empty-block-fence` — The current fork only emits a math block when a closing `$$` exists; the reference emits an empty `math_block` token for a lone `$$`.

### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          67,235 |            67,559 | 1.00× |
| normal/medium |          17,355 |            17,273 | 1.00× |
| normal/large  |           5,794 |             5,811 | 1.00× |
| heavy/small   |         123,580 |           123,114 | 1.00× |
| heavy/medium  |          63,630 |            63,471 | 1.00× |
| heavy/large   |          32,742 |            32,045 | 1.02× |

Geometric mean throughput ratio: 1.00× across 6 cases; above 1× means the current package is faster.

### Scaling

| Series                 | Sizes                  | Current exponent | Reference exponent |
| ---------------------- | ---------------------- | ---------------: | -----------------: |
| inline-formulas        | 64 / 128 / 256 / 512   |            ~0.97 |              ~0.96 |
| multiline-block-fences | 64 / 128 / 256 / 512   |            ~1.00 |              ~1.00 |
| unmatched-block-fence  | 128 / 256 / 512 / 1024 |            ~1.72 |              ~0.97 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

### Package size

| Package                             | Unpacked size | Entry gzip |
| ----------------------------------- | ------------: | ---------: |
| @mdit/plugin-tex (current)          |       61.8 kB |     1.5 kB |
| markdown-it-katex@2.0.3 (reference) |       29.9 kB |     2.0 kB |

### Notes

- `@mdit/plugin-tex` is a fork of `markdown-it-katex` with a pluggable renderer and a required `render` option, so rendered output is not comparable: the reference always renders KaTeX HTML while this package delegates rendering. Both sides are compared on the parsed token stream instead (token type, markup, content, and text tokens, so differences in literal `$` handling are visible).
- The required `render` option of the current package is set to a deterministic stub (`\(...\)` / `\[...\]`). It is never invoked because the comparison reads the parsed tokens instead of rendering them, so no real KaTeX work happens on either side.
- Math token content is compared after trimming edge whitespace. The reference trims the first line of a block formula and drops the trailing newline, while the current package preserves both; both implementations pass the same formula payload to their renderer, so the edge formatting is not a behavioral difference and the case `block-edge-space` is reported as an exact match.
- Edge formatting aside, the token streams match on inline math, `$$` fences, escaping, unmatched delimiters, an effectively empty document, and markdown constructs that must not be parsed as math (code spans, fences). Labels are not implemented by either plugin, so no `math_block_label` tokens are compared.
- Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`), and `$$` alone is not a math block.
- Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\(...\)` / `\[...\]`), `mathFence` (` ```math `), `allowInlineWithSpace`, and the `render` callback itself.
- Benchmarks measure parsing only on both sides (the stub renderer is never called and the reference renderer is not invoked), so the two sides do the same work. The corpora stay small on purpose: 24 inline formulas for `normal/large` and 24 inline plus 8 display formulas for `heavy/large`.
- Scaling series probe the delimiter scanners: many unmatched `$$` fence lines (the current `math_block` rule scans ahead even in silent mode and the paragraph terminator calls it once per line, so the fitted exponent is well above 1 and approaches 2 asymptotically; the reference short-circuits in silent mode and then consumes the rest of the document as a single block, staying linear), many inline formulas, and many closed multi-line `$$` fences (the reference re-scans the document prefix to find the closing line).
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
