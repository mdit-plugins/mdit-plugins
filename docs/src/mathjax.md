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

const { outputStyle, reset, clearStyle, dispose } = getMathjax(md);

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
- `createMathjaxInstance` has moved to `@mdit/plugin-mathjax/async` and is no longer exported from the main entry.
- `@mdit/plugin-mathjax/sync` has been removed. The main entry itself is synchronous on Node.js.
- There is no instance to create, pass around or await. Use `getMathjax(md)` to access `outputStyle`, `reset`, `clearStyle` and `dispose`.
- The synchronous main entry requires Node.js (`worker_threads`). In browsers or runtimes without worker threads, use `./async`.
- Options must be structured-cloneable. Function options are rejected with a clear error, see [Options](#options).

:::

### Migration

Before (v1 / the async entry):

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

The `@mdit/plugin-mathjax-slim` package follows the same change: its main entry uses the new synchronous API (with `@mathjax/src` and `@mathjax/mathjax-newcm-font` as optional peer dependencies), `./async` keeps the instance API, and `./sync` is removed. Its usage is otherwise the same as `@mdit/plugin-mathjax`.

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

Enable A11y.

@`tex` type=MathJaxTexInputOptions

TeX input options.

@`chtml` type=MathjaxCommonHTMLOutputOptions

Common HTML output options.

@`svg` type=MathjaxSVGOutputOptions

SVG output options.

@`transformer` type=TeXTransformer

Transformer on output content. Runs on the main thread after the worker returns the rendered HTML.

@`debug` type=boolean default=`false`

Enable debug mode.

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

:::

```ts
import { getMathjax, mathjax } from "@mdit/plugin-mathjax";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(mathjax, { output: "svg" });

// Render first, then collect the CSS for the rendered formulas.
md.render("$e^{i\\pi}+1=0$");

const { outputStyle, reset, clearStyle, dispose } = getMathjax(md);

const css = outputStyle();

// Reset TeX state (macros / labels); rendering already does this.
reset();

// Clear the style cache and math jax state.
clearStyle();

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
