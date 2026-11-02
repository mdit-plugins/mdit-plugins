---
title: "@mdit/plugin-mathjax"
shortTitle: "plugin-mathjax"
icon: square-root-variable
---

Plugin to render math expressions with MathJax.

::: note

This plugin is based on [@mdit/plugin-tex](tex.md).

:::

<!-- more -->

## Usage <Badge text="No CDN Scripts" />

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, { output: "svg" });

const html = md.render("$e^{i\\pi}+1=0$"); // Fully synchronous

const { outputStyle, reset, clearStyle, dispose, warmup } = getMathjax(md);

const css = outputStyle(); // Fully synchronous
```

`mathjax` works like any other markdown-it plugin: its second argument is the options object, and `md.render()` returns the rendered HTML immediately. MathJax's official asynchronous flow runs in a worker thread under the hood while the main thread blocks for the result, so `await createMathjaxInstance()` is no longer needed.

`getMathjax(md)` returns the MathJax methods of the markdown-it instance and throws if the plugin has not been installed on it. It is a helper instead of a `md.mathjax` property so that the global `MarkdownIt` type is not polluted with an extra optional member for every user.

::: tip

The synchronous main entry requires Node.js because it relies on `worker_threads`. In browsers or runtimes without worker threads, use `@mdit/plugin-mathjax/async` instead.

:::

### Browser / Advanced Usage

```ts
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax/async";
import MarkdownIt from "markdown-it";

const mathjaxInstance = await createMathjaxInstance({ output: "svg" });
const md = new MarkdownIt().use(mathjax, mathjaxInstance);

const html = md.render("$e^{i\\pi}+1=0$");
const css = await mathjaxInstance.outputStyle();
```

`./async` keeps the v1 instance API: `createMathjaxInstance(options)` resolves to a MathJax instance and `mathjax(md, instance)` installs it on a markdown-it instance. Use it in browsers, in runtimes without `worker_threads`, or when you need function options that cannot be sent to the synchronous worker. Fonts and TeX packages are still loaded lazily through MathJax's official async API.

## Breaking Changes

::: warning v2 is a breaking major release

`@mdit/plugin-mathjax` v2 changes the main entry from an instance-based plugin to a regular synchronous markdown-it plugin. Review the following changes before upgrading:

- `mathjax` now takes options as its second argument: `mathjax(md, options)` instead of `mathjax(md, instance)`, and `md.render()` is synchronous again.
- `createMathjaxInstance` is only available from `@mdit/plugin-mathjax/async` now. The main entry no longer re-exports it.
- `@mdit/plugin-mathjax/sync` has been removed. The main entry itself is synchronous on Node.js.
- The synchronous v2 API needs no instance: use `getMathjax(md)` to access `outputStyle`, `reset`, `clearStyle` and `dispose`.
- The synchronous main entry requires Node.js (`worker_threads`). In browsers or runtimes without worker threads, use `./async`.
- Options must be structured-cloneable. Function options are rejected with a clear error, see [Options](#options).
- The HTML-related TeX packages (`html` and `texhtml`) are no longer enabled by default. They are added to the default list when markdown-it's `html` option is enabled, or can be enabled explicitly with `tex.packages`, see [Security](#security).
- The font-extension TeX packages (`bbm`, `bboldx` and `dsfont`) are no longer enabled by default: the bundled NewCM font does not ship their extension data. `\mathbb` now uses the standard double-struck variant; commands that need those extensions (`\mathbbm`, `\mathds`, ...) are unavailable unless you enable the packages explicitly with `tex.packages`. See [Font and TeX Package Limitations](#font-and-tex-package-limitations).

:::

### Migration

Before (v1):

```ts
import { createMathjaxInstance, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const mathjaxInstance = await createMathjaxInstance(options);
const md = new MarkdownIt().use(mathjax, mathjaxInstance);

const html = md.render("$E=mc^2$");
const style = await mathjaxInstance.outputStyle();
```

After (v2 main entry, fully synchronous):

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, options);

const html = md.render("$E=mc^2$");
const style = getMathjax(md).outputStyle();
```

The `@mdit/plugin-mathjax-slim` package follows the same change: its main entry uses the new synchronous API (with `@mathjax/src` and `@mathjax/mathjax-newcm-font` as optional peer dependencies), `./async` keeps the instance API, and `./sync` is removed. The VuePress `@vuepress/plugin-markdown-math` package is patched in this repository to use the v2 API until it is released upstream. Its usage is otherwise the same as `@mdit/plugin-mathjax`.

## Syntax

The syntax depends on the `delimiters` option:

- **Default (`"dollars"`)**: Use `$tex expression$` inline, and `$$tex expression$$` for block.
- **LaTeX style (`"brackets"`)**: Use `\(tex expression\)` inline, and `\[tex expression\]` for block.
- **Both (`"all"`)**: Both dollar and bracket syntaxes are supported.

::: tip Escaping

- You can use `\` to escape `$` `\(` and `\[`:

  ```md
  Euler’s identity \$e^{i\pi}+1=0$
  ```

  will be

  Euler’s identity \$e^{i\pi}+1=0$

:::

## Options

`mathjax(md, options)` accepts the following options:

::: fields
@`output` type=`"chtml" | "svg"` default=`"svg"`

Output syntax.

@`delimiters` type=`"brackets" | "dollars" | "all"` default=`"dollars"`

Math delimiter syntax to enable.

- `"brackets"`: Use `\(...\)` for inline math and `\[...\]` for display math (LaTeX style).
- `"dollars"`: Use `$...$` for inline math and `$$...$$` for display math (common Markdown style).
- `"all"`: Enable both bracket and dollar syntaxes.

@`allowInlineWithSpace` type=boolean default=`false`

Whether to allow inline math with spaces on ends.

NOT recommended to set this to true, because it will likely break the default usage of `$`.

@`mathFence` type=boolean default=`false`

Whether parsed fence block with math language to display mode math.

@`a11y` type=boolean default=`true`

Whether to include assistive MathML for screen readers. When disabled, math is still rendered but the hidden `<mjx-assistive-mml>` output is omitted.

@`tex` type=MathJaxTexInputOptions

TeX input options. The default package list excludes HTML-related and font-extension packages, see [Font and TeX Package Limitations](#font-and-tex-package-limitations).

@`chtml` type=MathjaxCommonHTMLOutputOptions

Common HTML output options.

@`svg` type=MathjaxSVGOutputOptions

SVG output options.

@`transformer` type=TeXTransformer

Transformer on output content. Runs on the main thread after the worker returns the rendered HTML.

@`debug` type=boolean default=`false`

Enable debug mode.

@`renderStrategy` type=`"batch" | "immediate"` default=`"batch"`

How formulas of a markdown document are converted. With `"batch"`, all formulas are collected and converted in one worker round-trip when the outermost render finishes; nested `md.render()` / `md.renderInline()` calls return internal placeholders until that flush. With `"immediate"`, every formula is converted as soon as it is encountered, so nested render calls return final HTML immediately at the cost of one worker round-trip per formula.

@`workerTimeout` type=number default=`30000`

Timeout of a single synchronous worker call in milliseconds. Only used by the synchronous main entry.

:::

::: warning Function options need the async entry

The synchronous main entry sends options to a worker thread, so all options must be structured-cloneable. The following options are rejected with an explicit error:

- `tex.formatError`
- `preFilters` and `postFilters` in `chtml` / `svg`
- `fontData`, `wrapperFactory` and `cssStyles` in `chtml` / `svg` (custom fonts, wrappers and styles)
- `linebreaks.LinebreakVisitor` in `chtml` / `svg`

Import from `@mdit/plugin-mathjax/async` when you need any of them. `transformer` is the only function option supported by the synchronous entry. Any other non-cloneable value, such as a function in `tex.macros`, is rejected as well.

:::

## Security

The `html` TeX package provides macros such as `\href`, `\class`, `\style` and `\cssId`, which can create clickable links and inject attributes into the output; `texhtml` registers raw `<tex-html>` support (inert unless MathJax's `allowTexHTML` option is enabled). Enabling them for untrusted TeX input allows `\href{javascript:...}` to become a clickable script URL.

The default package list does not enable them: with `new MarkdownIt()` (raw HTML disabled) the HTML-related packages are not loaded. They are only added to the default list when the markdown-it instance enables raw HTML:

```ts
// Default: the HTML-related TeX packages are not loaded, `\href` stays a red macro placeholder.
const safeMd = new MarkdownIt().use(mathjax);

// Enabling raw HTML in Markdown also enables the HTML-related TeX packages by default.
const trustedMd = new MarkdownIt({ html: true }).use(mathjax);
```

An explicit `tex.packages` list is trusted developer configuration and is used as-is, so the HTML-related packages can also be enabled while keeping raw HTML in Markdown disabled:

```ts
const md = new MarkdownIt().use(mathjax, {
  tex: { packages: ["ams", "html", "texhtml"] },
});
```

Only enable them when the TeX input is trusted: an explicit configuration does not make untrusted Markdown safe, and `\href{javascript:...}` remains a script URL.

The `html` option is read when the plugin is installed (`md.use(...)`); changing it later with `md.set()` is not observed.

For the async entry, the `html` option of the markdown-it instance passed to `md.use(mathjax, instance)` decides the default list when the instance is installed. A MathJax instance owns shared TeX state, so it can only be installed on one markdown-it instance; use a separate `createMathjaxInstance()` result for each instance, especially when they have different trust levels.

## Font and TeX Package Limitations

The plugin bundles MathJax's NewCM font (`@mathjax/mathjax-newcm-font`). Standard math variants work out of the box: `\mathbb` renders as double-struck, `\mathcal` as calligraphic, `\mathfrak` as fraktur, and so on. Font files are loaded through MathJax's dynamic font loader.

The bundled font does not ship the font-extension data used by the `bbm`, `bboldx` and `dsfont` TeX packages. These packages are therefore not enabled by default: loading them would replace standard macros (e.g. `\mathbb`) with missing font variants and fall back to normal glyphs with an `Invalid variant` warning. If you enable them explicitly through `tex.packages`, commands such as `\mathbbm` and `\mathds` still fall back with a warning because the extension data is missing.

The synchronous main entry sends its options to a worker, so a custom `fontData` cannot be used there; use `@mdit/plugin-mathjax/async` if you need a custom font with additional extensions.

## MathJax Methods

`getMathjax(md)` returns the `MathjaxMethods` object of a markdown-it instance. It throws if `mathjax` has not been installed on that instance.

::: fields
@`outputStyle` type=`() => string`

Return the CSS content collected from all rendered formulas as a `string`, synchronously.

Font files are loaded on demand before the stylesheet is generated, and the style cache is cleared afterwards, so call it once all rendering is done.

@`reset` type=`() => void`

Reset the $TeX$ input, clearing user-defined macros, environments and labels.

The plugin calls it after each document so that state does not leak across renders. To keep macros available in every document, define them with the `tex.macros` option instead.

@`clearStyle` type=`() => void`

Clear the style cache and reset both the input and output jax. It does nothing when the output jax has not been initialized yet.

@`dispose` type=`() => void`

Terminate the worker-side session and release its MathJax state.

After calling it, the markdown-it instance can no longer render math and `getMathjax(md)` throws; create a new `MarkdownIt` instance to render again.

@`warmup` type=`(options?: WarmupOptions) => void`

Initialize the worker and the MathJax session synchronously, so the first document does not pay the one-time initialization cost (~100ms). `warmup({ preloadFonts: true })` also loads all dynamic font files, which additionally takes ~73ms for SVG and ~35ms for CHTML on the first call. Because it blocks, call it before a batch of renders when predictable timing matters.

:::

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, { output: "svg" });

// Render first, then collect the CSS for the rendered formulas.
md.render("$e^{i\\pi}+1=0$");

const { outputStyle, reset, clearStyle, dispose, warmup } = getMathjax(md);

const css = outputStyle();

// Reset TeX state (macros / labels); rendering already does this.
reset();

// Clear the style cache and math jax state.
clearStyle();

// Initialize now instead of on the first rendered document.
warmup();

// Release the worker session when the MarkdownIt instance is no longer used.
dispose();
```

## Demo

::: preview Demo

Euler’s identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^i r \cdots (r-i+1) (\log y)^{r-i}} {\omega^i} \right\}
$$

:::

## Support List

- [Supported TeX/LaTeX commands](https://docs.mathjax.org/en/latest/input/tex/macros/index.html#tex-commands)

## Cookbook

- [$\TeX$ Cookbook](tex.md#tex-tutorial)

<!-- comparison:start -->

## Comparison

The tables below compare each package with its upstream reference implementation.

### @mdit/plugin-mathjax

Compared against the upstream [`markdown-it-mathjax3`](https://www.npmjs.com/package/markdown-it-mathjax3) package `5.2.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

#### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |     8 |         11 |                6 |

The following cases are documented differences:

- `tag-numbered` — `\tag{1}` is laid out identically, but MathJax 4 splits the tag into `<mtext>(</mtext><mtext>1</mtext><mtext>)</mtext>` while MathJax 3 emits a single `<mtext>(1)</mtext>` in the assistive MathML.
- `inline-adjacent-word` — The reference delimiter check has no word-boundary rule, so it parses `a$x$b` as inline math; the current package requires a word boundary around `$` so that currency amounts stay literal (see `plain-dollar-currency`).
- `block-unclosed` — An unclosed `$$` block is still emitted as display math by the reference: its `math_block` rule scans to the end of the document and then pushes the token anyway. The current package only starts a block when the closing `$$` exists and otherwise falls back to a paragraph.
- `block-trailing-inline` — The reference parses `$$a=1$$ and $b=2$` as one display-math block that swallows the trailing inline expression; the current package keeps the line as a paragraph and renders `$b=2$` as inline math.
- `escaped-backslash-dollar` — `$a\\$b`: the reference counts the preceding backslash run differently and closes the math after the escaped backslash (`\\` then `$`), while the current package treats a `$` preceded by an even number of backslashes as escaped and keeps the line literal.
- `text-with-dollar` — The reference stops scanning at the whitespace-surrounded `$` inside `\text{…}` and leaves the whole line literal; the current package treats that `$` as literal TeX content, keeps scanning to the final `$` and renders an error node.

#### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |           1,329 |             1,536 | 0.87× |
| normal/medium |             734 |               635 | 1.16× |
| normal/large  |             303 |               263 | 1.15× |
| heavy/small   |             754 |               647 | 1.17× |
| heavy/medium  |             298 |               238 | 1.25× |
| heavy/large   |             108 |                96 | 1.12× |

Geometric mean throughput ratio: 1.11× across 6 cases; above 1× means the current package is faster.

#### Scaling

| Series            | Sizes                     | Current exponent | Reference exponent |
| ----------------- | ------------------------- | ---------------: | -----------------: |
| block-fences      | 32 / 64 / 128 / 256       |            ~0.97 |              ~0.99 |
| inline-formulas   | 32 / 64 / 128 / 256       |            ~0.95 |              ~0.74 |
| unclosed-block    | 256 / 512 / 1024 / 2048   |            ~1.00 |              ~1.60 |
| unmatched-dollars | 1024 / 2048 / 4096 / 8192 |            ~0.95 |              ~0.94 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

#### Package size

| Package                                | Unpacked size | Entry gzip |
| -------------------------------------- | ------------: | ---------: |
| @mdit/plugin-mathjax (current)         |      116.7 kB |     1.7 kB |
| markdown-it-mathjax3@5.2.0 (reference) |       14.6 kB |     1.7 kB |

### @mdit/plugin-mathjax-slim

Compared against the upstream [`markdown-it-mathjax3`](https://www.npmjs.com/package/markdown-it-mathjax3) package `5.2.0`. Benchmarks were measured with Node.js v26.13.0, Apple M4 (darwin arm64) on 2026-11-02. Every table below is generated from the committed comparison data.

#### Correctness

| Cases | Exact | Normalized | Documented diffs |
| ----: | ----: | ---------: | ---------------: |
|    25 |     8 |         11 |                6 |

The following cases are documented differences:

- `tag-numbered` — `\tag{1}` is laid out identically, but MathJax 4 splits the tag into `<mtext>(</mtext><mtext>1</mtext><mtext>)</mtext>` while MathJax 3 emits a single `<mtext>(1)</mtext>` in the assistive MathML.
- `inline-adjacent-word` — The reference delimiter check has no word-boundary rule, so it parses `a$x$b` as inline math; the current package requires a word boundary around `$` so that currency amounts stay literal (see `plain-dollar-currency`).
- `block-unclosed` — An unclosed `$$` block is still emitted as display math by the reference: its `math_block` rule scans to the end of the document and then pushes the token anyway. The current package only starts a block when the closing `$$` exists and otherwise falls back to a paragraph.
- `block-trailing-inline` — The reference parses `$$a=1$$ and $b=2$` as one display-math block that swallows the trailing inline expression; the current package keeps the line as a paragraph and renders `$b=2$` as inline math.
- `escaped-backslash-dollar` — `$a\\$b`: the reference counts the preceding backslash run differently and closes the math after the escaped backslash (`\\` then `$`), while the current package treats a `$` preceded by an even number of backslashes as escaped and keeps the line literal.
- `text-with-dollar` — The reference stops scanning at the whitespace-surrounded `$` inside `\text{…}` and leaves the whole line literal; the current package treats that `$` as literal TeX content, keeps scanning to the final `$` and renders an error node.

#### Benchmarks

| Case          | Current (ops/s) | Reference (ops/s) | Ratio |
| ------------- | --------------: | ----------------: | ----: |
| normal/small  |           1,777 |             1,792 | 0.99× |
| normal/medium |             769 |               681 | 1.13× |
| normal/large  |             309 |               269 | 1.15× |
| heavy/small   |             741 |               652 | 1.14× |
| heavy/medium  |             319 |               270 | 1.18× |
| heavy/large   |             133 |               112 | 1.18× |

Geometric mean throughput ratio: 1.13× across 6 cases; above 1× means the current package is faster.

#### Scaling

| Series            | Sizes                     | Current exponent | Reference exponent |
| ----------------- | ------------------------- | ---------------: | -----------------: |
| block-fences      | 32 / 64 / 128 / 256       |            ~1.00 |              ~0.99 |
| inline-formulas   | 32 / 64 / 128 / 256       |            ~0.98 |              ~0.98 |
| unclosed-block    | 256 / 512 / 1024 / 2048   |            ~0.99 |              ~1.36 |
| unmatched-dollars | 1024 / 2048 / 4096 / 8192 |            ~0.98 |              ~0.99 |

Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.

#### Package size

| Package                                | Unpacked size | Entry gzip |
| -------------------------------------- | ------------: | ---------: |
| @mdit/plugin-mathjax-slim (current)    |      125.1 kB |     1.7 kB |
| markdown-it-mathjax3@5.2.0 (reference) |       14.6 kB |     1.7 kB |

### Notes

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
- Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.
- Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.
- Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.

<!-- comparison:end -->
