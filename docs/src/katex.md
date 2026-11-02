---
title: "@mdit/plugin-katex"
shortTitle: "plugin-katex"
icon: square-root-variable
---

Plugins to render math expressions with KaTeX.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage

```ts
import { katex } from "@mdit/plugin-katex";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(katex);

mdIt.render("$E=mc^2$");
```

We also have a package called `@mdit/plugin-katex-slim` which `katex` is an optional peer.

## Syntax

The syntax depends on the `delimiters` option:

- **Default (`"dollars"`)**: Use `$tex expression$` inline, and `$$tex expression$$` for block.
- **LaTeX style (`"brackets"`)**: Use `\(tex expression\)` inline, and `\[tex expression\]` for block.
- **Both (`"all"`)**: Both dollar and bracket syntaxes are supported.

::: tip Style

You should import `katex/dist/katex.min.css` from `katex` package or CDN yourself.

:::

::: tip Escaping

- You can use `\` to escape `$` `\(` and `\[`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  will be

  Euler’s identity \$e^{i\pi}+1=0$

:::

## Options

This plugin extends KaTeX options. Available options include:

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

Error logger function.

@`transformer` type=`(content: string, displayMode: boolean) => string`

Transformer function on output content.

:::

## Demo

::: preview

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$

:::

## mhchem extension

If you want to load the `mhchem` extension, you should import `@mdit/plugin-katex/mhchem`:

```ts
import { katex } from "@mdit/plugin-katex";
import "@mdit/plugin-katex/mhchem";
```

## Support List

- [KaTeX Support Features](https://katex.org/docs/supported.html)
- [KaTeX Support List](https://katex.org/docs/support_table.html)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-tutorial)

<!-- comparison:start -->

## Comparison

The tables below compare each package with its upstream reference implementation.

### @mdit/plugin-katex

Compared against the upstream [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) package `2.0.3`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

#### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |    11 |          8 |                6 |

The following cases are documented differences:

- `word-boundary-close` — The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text and nothing is rendered; the reference parses and renders `a`.
- `word-boundary-open` — The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses and renders `x`.
- `adjacent-dollar-inline` — The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the line stays literal; the reference renders `$a$` and `$b$` as two formulas.
- `literal-gap-inline` — The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter, then renders the formula; the reference gives up at the first `$` that cannot close and emits literal text.
- `block-trailing-content` — A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the line stays a paragraph); the reference renders the whole line as one display formula and KaTeX reports an error for the trailing text.
- `macro-scope` — Macros defined with the `gdef` command are shared between the formulas of one document by the current package, so the second formula renders `x`; the reference creates fresh KaTeX settings per formula, so the macro is undefined there and renders as a KaTeX error.

#### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          17,455 |            17,945 | 0.97× |
| normal/medium |           4,618 |             4,753 | 0.97× |
| normal/large  |           1,568 |             1,603 | 0.98× |
| heavy/small   |           7,506 |             7,702 | 0.97× |
| heavy/medium  |           3,802 |             3,917 | 0.97× |
| heavy/large   |           1,862 |             1,885 | 0.99× |

Geometric mean throughput ratio: 0.98× across 6 cases; above 1× means the current package is faster.

#### Scaling

| Series           | Sizes                | Current exponent | Reference exponent |
| ---------------- | -------------------- | ---------------: | -----------------: |
| display-formulas | 16 / 32 / 64 / 128   |            ~1.00 |              ~1.01 |
| inline-formulas  | 32 / 64 / 128 / 256  |            ~1.01 |              ~1.00 |
| long-formula     | 64 / 128 / 256 / 512 |            ~0.98 |              ~0.98 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

#### Package size

| Package                             | Unpacked size | Entry gzip |
| ----------------------------------- | ------------: | ---------: |
| @mdit/plugin-katex (current)        |       35.3 kB |      612 B |
| markdown-it-katex@2.0.3 (reference) |       29.9 kB |     2.0 kB |

### @mdit/plugin-katex-slim

Compared against the upstream [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) package `2.0.3`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

#### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |    11 |          8 |                6 |

The following cases are documented differences:

- `word-boundary-close` — The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text and nothing is rendered; the reference parses and renders `a`.
- `word-boundary-open` — The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses and renders `x`.
- `adjacent-dollar-inline` — The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the line stays literal; the reference renders `$a$` and `$b$` as two formulas.
- `literal-gap-inline` — The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter, then renders the formula; the reference gives up at the first `$` that cannot close and emits literal text.
- `block-trailing-content` — A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the line stays a paragraph); the reference renders the whole line as one display formula and KaTeX reports an error for the trailing text.
- `macro-scope` — Macros defined with the `gdef` command are shared between the formulas of one document by the current package, so the second formula renders `x`; the reference creates fresh KaTeX settings per formula, so the macro is undefined there and renders as a KaTeX error.

#### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |          15,060 |            16,655 | 0.90× |
| normal/medium |           4,530 |             4,582 | 0.99× |
| normal/large  |           1,433 |             1,483 | 0.97× |
| heavy/small   |           7,019 |             7,205 | 0.97× |
| heavy/medium  |           3,461 |             3,622 | 0.96× |
| heavy/large   |           1,809 |             1,850 | 0.98× |

Geometric mean throughput ratio: 0.96× across 6 cases; above 1× means the current package is faster.

#### Scaling

| Series           | Sizes                | Current exponent | Reference exponent |
| ---------------- | -------------------- | ---------------: | -----------------: |
| display-formulas | 16 / 32 / 64 / 128   |            ~0.98 |              ~1.00 |
| inline-formulas  | 32 / 64 / 128 / 256  |            ~1.10 |              ~1.16 |
| long-formula     | 64 / 128 / 256 / 512 |            ~0.97 |              ~0.90 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

#### Package size

| Package                             | Unpacked size | Entry gzip |
| ----------------------------------- | ------------: | ---------: |
| @mdit/plugin-katex-slim (current)   |       12.9 kB |      681 B |
| markdown-it-katex@2.0.3 (reference) |       29.9 kB |     2.0 kB |

### Notes

- **@mdit/plugin-katex**: This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.
- **@mdit/plugin-katex**: Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it (the MathML `annotation` echoes the input formula, so its edge whitespace differs). The visible KaTeX HTML is unchanged by either normalization, and both are documented here rather than hidden.
- **@mdit/plugin-katex**: `throwOnError: false` is set on both sides so that invalid LaTeX is handled the same way. This is already the default of the current package; with the reference's defaults the reference instead emits the raw LaTeX from its own `catch` block, which is a documented default difference and not compared.
- **@mdit/plugin-katex**: Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), and a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`).
- **@mdit/plugin-katex**: One difference is a feature, not a regression: macros defined with `\gdef` are shared between the formulas of one document by the current package (`macros` is a single object per render), while the reference creates fresh KaTeX settings for every formula, so a later formula cannot use an earlier `\gdef`. The case documents this.
- **@mdit/plugin-katex**: Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\(...\)` / `\[...\]`), `mathFence` (` ```math `), `allowInlineWithSpace`, `transformer`, and the `logger` callback.
- **@mdit/plugin-katex**: Benchmarks render real KaTeX on both sides (display and inline) with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.
- **@mdit/plugin-katex**: Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.
- **@mdit/plugin-katex-slim**: This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.
- **@mdit/plugin-katex-slim**: `@mdit/plugin-katex-slim` is the same tex + KaTeX composition as `@mdit/plugin-katex`; the only difference is that it loads KaTeX with a dynamic `import("katex")` at module initialization and throws when KaTeX is not installed. The comparison therefore uses the same cases and the results should match `plugin-katex`.
- **@mdit/plugin-katex-slim**: Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it (the MathML `annotation` echoes the input formula, so its edge whitespace differs). The visible KaTeX HTML is unchanged by either normalization, and both are documented here rather than hidden.
- **@mdit/plugin-katex-slim**: `throwOnError: false` is set on both sides so that invalid LaTeX is handled the same way. This is already the default of the current package; with the reference's defaults the reference instead emits the raw LaTeX from its own `catch` block, which is a documented default difference and not compared.
- **@mdit/plugin-katex-slim**: Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), and a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`).
- **@mdit/plugin-katex-slim**: One difference is a feature, not a regression: macros defined with `\gdef` are shared between the formulas of one document by the current package (`macros` is a single object per render), while the reference creates fresh KaTeX settings for every formula, so a later formula cannot use an earlier `\gdef`. The case documents this.
- **@mdit/plugin-katex-slim**: Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\(...\)` / `\[...\]`), `mathFence` (` ```math `), `allowInlineWithSpace`, `transformer`, and the `logger` callback.
- **@mdit/plugin-katex-slim**: Benchmarks render real KaTeX on both sides with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.
- **@mdit/plugin-katex-slim**: Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
