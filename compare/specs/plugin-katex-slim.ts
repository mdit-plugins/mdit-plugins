import { composeNormalizers, normalizeHtml } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Unwrap the display math wrapper of the current package
 *
 * `@mdit/plugin-katex-slim` wraps display math in `<p class='katex-block'>` so that it can be
 * styled, while the reference emits a plain `<p>`. Both wrappers end up as a paragraph around the
 * same KaTeX HTML, so only the class is normalized away.
 *
 * @param html - Rendered HTML
 * @returns HTML with the display math wrapper class removed
 */
const unwrapDisplayWrapper = (html: string): string =>
  html.replaceAll("<p class='katex-block'>", "<p>");

/**
 * Trim the edge whitespace of the KaTeX MathML annotation
 *
 * The MathML annotation echoes the formula that was passed to KaTeX. The reference trims the first
 * line of a block formula and drops its trailing newline, while the current package keeps both, so
 * the echoed formula differs only in edge whitespace. The visible KaTeX HTML is identical, and this
 * normalization does not touch the formula itself.
 *
 * @param html - Rendered HTML
 * @returns HTML with trimmed annotation content
 */
const trimAnnotationContent = (html: string): string =>
  html
    .replaceAll(/(?<open><annotation encoding="application\/x-tex">)\s+/gu, "$<open>")
    .replaceAll(/\s+(?<close><\/annotation>)/gu, "$<close>");

/** Benchmark cases built from the two corpora */
const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    targetMs: 100,
    file: `corpora/plugin-katex-slim/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-katex-slim",
  reference: "markdown-it-katex",
  normalize: composeNormalizers(unwrapDisplayWrapper, trimAnnotationContent, normalizeHtml),
  notes: [
    {
      en: "This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.",
      zh: "本次对比会让双方都实际渲染 KaTeX，并比较生成的 HTML。参考包声明 `katex: ^0.6.0`，但仓库已提交的 workspace override（`pnpm-workspace.yaml` 中的 `overrides.katex: ^0.19.0`，为文档工具链保留）让已安装的参考包使用与本包相同的 KaTeX 0.19.1，因此渲染出的数学 HTML 可以直接比较。如果该 override 被移除，参考包会回退到 KaTeX 0.6，本 spec 就必须改为 token 级对比。",
    },
    {
      en: "The benchmark still shows a small gap that is not plugin overhead: this ESM package resolves `katex` through the `import` condition (`dist/katex.mjs`) while the CJS reference resolves `dist/katex.js`. The identical KaTeX 0.19.1 code runs about 4.5% faster as CJS on Node, so with both sides forced onto the same KaTeX build the packages measure at parity; neither package allocates KaTeX options per formula any more.",
      zh: "基准测试仍显示一个小差距，但它不是插件开销：本 ESM 包通过 `import` 条件解析 `katex`（`dist/katex.mjs`），而 CJS 参考包解析到 `dist/katex.js`。完全相同的 KaTeX 0.19.1 代码在 Node 上以 CJS 运行时快约 4.5%，因此把双方强制到同一个 KaTeX 构建后，两个包测得的结果基本持平；两个包都不再为每个公式分配 KaTeX 选项。",
    },
    {
      en: '`@mdit/plugin-katex-slim` is the same tex + KaTeX composition as `@mdit/plugin-katex`; the only difference is that it loads KaTeX with a dynamic `import("katex")` at module initialization and throws when KaTeX is not installed. The comparison therefore uses the same cases and the results should match `plugin-katex`.',
      zh: '`@mdit/plugin-katex-slim` 与 `@mdit/plugin-katex` 是相同的 tex + KaTeX 组合；唯一区别是它在模块初始化时通过动态 `import("katex")` 加载 KaTeX，并在未安装 KaTeX 时抛错。因此对比使用相同的用例，结果应与 `plugin-katex` 一致。',
    },
    {
      en: "Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it. The display wrapper is renderer-only; the retained whitespace also shows up in the token content and is tracked by the `annotation-whitespace` issue.",
      zh: "两处有意的标记差异通过归一化处理而非直接对比：当前包把显示公式包在 `<p class='katex-block'>` 中（参考包输出普通 `<p>`），并保留块公式首尾的空白与换行，而参考包会将其裁剪。显示公式的包裹仅存在于渲染阶段；保留的空白还会体现在 token content 中，归入 `annotation-whitespace` issue。",
    },
    {
      en: "Both packages run with their own defaults for error handling: the current package keeps `throwOnError: false`, so KaTeX renders invalid formulas as error markup, while the reference's catch block returns the raw LaTeX into the HTML. Tracked by the `raw-latex-on-error` issue.",
      zh: "两侧都以各自的默认设置处理错误：当前包保持 `throwOnError: false`，无效公式由 KaTeX 渲染为错误标记，而参考包的 catch 块会把原始 LaTeX 写入 HTML。归入 `raw-latex-on-error` issue。",
    },
    {
      en: "The current fork applies stricter delimiter rules than the reference; the affected cases are grouped under the `word-boundary-delimiters`, `literal-gap-inline`, `block-trailing-content` and `adjacent-dollar-delimiter` issues.",
      zh: "当前 fork 的定界符规则比参考包更严格；相关用例分别归入 `word-boundary-delimiters`、`literal-gap-inline`、`block-trailing-content` 和 `adjacent-dollar-delimiter` issue。",
    },
    {
      en: "Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\\(...\\)` / `\\[...\\]`), `mathFence` (```` ```math ````), `allowInlineWithSpace`, `transformer`, and the `logger` callback.",
      zh: "参考包没有等价选项的 fork 专有行为不参与比较：方括号定界符（`\\(...\\)` / `\\[...\\]`）、`mathFence`（```` ```math ````）、`allowInlineWithSpace`、`transformer` 以及 `logger` 回调。",
    },
    {
      en: "Benchmarks render real KaTeX on both sides with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.",
      zh: "基准测试会让双方实际渲染 KaTeX，语料较小：`normal/large` 有 24 个行内公式，`heavy/large` 有 24 个行内公式加 8 个显示公式。每个用例的 `targetMs` 为 100 ms。",
    },
    {
      en: "Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.",
      zh: "伸缩序列测量实际渲染：大量行内公式、一个超长公式以及大量显示公式。KaTeX 0.19 渲染与参考包解析器在探测到的每种模式上均测得为线性（约 1），因此这些序列是回归基线，而不是用来暴露超线性行为。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "katex",
      referenceExport: "default",
    },
  ],
  issues: [
    {
      id: "annotation-whitespace",
      category: "difference",
      note: {
        en: "The reference trims the leading space of the first line and the trailing newline of block formulas, while the current package keeps them; KaTeX renders the same output and only the MathML `annotation` echo (token content) differs.",
        zh: "参考包会裁掉块级公式首行的前导空格与末尾换行，当前包会保留；KaTeX 的渲染结果相同，只有 MathML `annotation` 的回显（token content）不同。",
      },
    },
    {
      id: "raw-latex-on-error",
      category: "reference-error",
      note: {
        en: "KaTeX's `throwOnError` defaults to `true` in the reference, whose catch block then returns the raw LaTeX as HTML instead of an escaped error message, so markup is leaked unescaped; the current package defaults to `throwOnError: false` and lets KaTeX render the error markup.",
        zh: "参考包沿用 KaTeX 的 `throwOnError: true` 默认值，其 catch 块随后把原始 LaTeX 直接作为 HTML 返回，而不是输出转义后的错误信息，导致标记未转义地泄漏；当前包默认 `throwOnError: false`，由 KaTeX 渲染错误标记。",
      },
    },
    {
      id: "word-boundary-delimiters",
      category: "reference-error",
      note: {
        en: "The reference treats `$` adjacent to word characters as a math delimiter, so text such as `a$x$` or `$a$b` is partly swallowed into math; the current fork requires a non-word character on both sides.",
        zh: "参考包会把紧邻单词字符的 `$` 当作公式定界符，因此 `a$x$`、`$a$b` 这类文本会被部分吞进公式；当前 fork 要求两侧都是非单词字符。",
      },
    },
    {
      id: "adjacent-dollar-delimiter",
      category: "difference",
      note: {
        en: "The current fork refuses to close a formula when the closing `$` is immediately followed by another `$`, while the reference parses two adjacent formulas; the stricter rule avoids confusion with `$$` display delimiters.",
        zh: "当前 fork 在结束 `$` 紧跟另一个 `$` 时不闭合公式，而参考包会解析出两个相邻公式；更严格的规则用于避免与 `$$` 行间定界符混淆。",
      },
    },
    {
      id: "literal-gap-inline",
      category: "reference-error",
      note: {
        en: "The reference stops at the first inner `$` that cannot close a formula and emits the whole line literally, losing the formula; the current fork treats a whitespace-surrounded `$` inside a formula as literal content and keeps scanning.",
        zh: "参考包在遇到第一个无法闭合公式的内部 `$` 时停止，并把整行作为字面文本输出，从而丢失公式；当前 fork 会把公式内被空白包围的 `$` 当作字面内容并继续扫描。",
      },
    },
    {
      id: "block-trailing-content",
      category: "reference-error",
      note: {
        en: "The reference treats a single-line `$$...$$` followed by text as one display formula, so the trailing text is consumed as math and then leaked raw by the error path; the current fork leaves the line as a paragraph.",
        zh: "参考包会把单行 `$$...$$` 后的文本并入同一个行间公式，导致尾部文本被当作公式内容，并由错误路径原样泄漏；当前 fork 会把该行保留为段落。",
      },
    },
    {
      id: "gdef-macro-scope",
      category: "reference-error",
      note: {
        en: "`\\gdef` defines a macro for the rest of the document, but the reference creates fresh KaTeX settings per formula, so a later formula renders the macro as an error or raw LaTeX; the current package shares one macro table per render.",
        zh: "`\\gdef` 定义的宏应在文档后续内容中可用，但参考包为每个公式创建全新的 KaTeX 设置，因此后面的公式会把该宏渲染为错误或原始 LaTeX；当前包在每次渲染中共享同一份宏表。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "mhchem-error.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Tests this package's own dynamic `./mhchem` loader by mocking `katex/contrib/mhchem`; the reference has no equivalent subpath or loader, so there is no reference behavior to compare.",
        zh: "通过 mock `katex/contrib/mhchem` 测试本包自己的动态 `./mhchem` 加载器；参考包没有等价子路径或加载器，因此没有可对比的参考行为。",
      },
    },
    {
      file: "katex-ext.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Exercises this package's `./mhchem` subpath entry, which loads `katex/contrib/mhchem`; the reference ships no mhchem integration.",
        zh: "该测试使用本包的 `./mhchem` 子路径入口来加载 `katex/contrib/mhchem`；参考包没有 mhchem 集成。",
      },
    },
    {
      file: "katex.spec.ts",
      name: "default logger should not give warnings",
      category: "feature-gap",
      why: {
        en: "Asserts the warning count of the current package's default `logger`; the reference has no logging callback, so the console output it produces is not comparable.",
        zh: "该测试断言当前包默认 `logger` 的警告次数；参考包没有日志回调，其产生的控制台输出不可对比。",
      },
    },
    {
      file: "katex.spec.ts",
      name: "should support custom logger",
      category: "feature-gap",
      why: {
        en: "Uses the fork-only `logger` option (no equivalent in the reference) and asserts its exact call count, so the test cannot be meaningfully run against the reference.",
        zh: "该测试使用仅本包提供的 `logger` 选项（参考包没有对应项）并断言其精确调用次数，因此无法有意义地在参考实现上运行。",
      },
    },
    {
      file: "katex.spec.ts",
      name: "should work with transformer",
      category: "feature-gap",
      why: {
        en: "Uses the fork-only `transformer` option, which post-processes KaTeX HTML; the reference has no such hook and ignores the option.",
        zh: "该测试使用仅本包提供的 `transformer` 选项对 KaTeX HTML 做后处理；参考包没有该钩子，会忽略此选项。",
      },
    },
  ],
  correctness: [
    { name: "inline-basic", markdown: "$a+b$" },
    { name: "inline-fraction", markdown: String.raw`$\frac{1}{2}$` },
    { name: "inline-in-text", markdown: "The value $x^2$ is positive." },
    { name: "inline-escaped-dollar", markdown: String.raw`A price of $\$5$ is cheap.` },
    { name: "inline-in-emphasis", markdown: "*emphasized $x$ and $y$ here*" },
    { name: "inline-in-link", markdown: "[$x$](https://example.com)" },
    { name: "block-single-line", markdown: "$$a=1$$" },
    { name: "block-multiline", markdown: "$$\na+b\n$$" },
    { name: "block-empty-lines", markdown: "$$\n\n$$" },
    {
      name: "block-edge-space",
      markdown: "$$ a $$",
      issue: "annotation-whitespace",
    },
    { name: "block-fraction", markdown: "$$\n\\frac{1}{2}\n$$" },
    {
      name: "block-aligned",
      markdown: String.raw`$$\begin{aligned}
a &= b \\
c &= d
\end{aligned}$$`,
      issue: "annotation-whitespace",
    },
    { name: "block-in-document", markdown: "Before.\n\n$$\n\\frac{1}{2}\n$$\n\nAfter." },
    {
      name: "invalid-inline",
      markdown: String.raw`Broken $\frac{1}$ formula.`,
      issue: "raw-latex-on-error",
    },
    {
      name: "invalid-display",
      markdown: "$$\n\\frac{1}\n$$",
      issue: "raw-latex-on-error",
    },
    {
      name: "markdown-structure",
      markdown: "- item with $a$\n- item with $b$\n\n> quote with $c$",
    },
    { name: "code-not-math", markdown: "`$code$` and\n\n```tex\n$a$\n```" },
    { name: "no-math-baseline", markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b" },
    { name: "empty-document", markdown: "\n" },
    {
      name: "word-boundary-close",
      markdown: "$a$b",
      issue: "word-boundary-delimiters",
    },
    {
      name: "word-boundary-open",
      markdown: "a$x$",
      issue: "word-boundary-delimiters",
    },
    {
      name: "adjacent-dollar-inline",
      markdown: "$a$$b$",
      issue: "adjacent-dollar-delimiter",
    },
    {
      name: "literal-gap-inline",
      markdown: String.raw`$\text{a $ b}$`,
      issue: "literal-gap-inline",
    },
    {
      name: "block-trailing-content",
      markdown: "$$a$$ tail",
      issue: "block-trailing-content",
    },
    {
      name: "macro-scope",
      markdown: String.raw`$\gdef\foo{x}$ $\foo$`,
      issue: "gdef-macro-scope",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-formulas",
      sizes: [32, 64, 128, 256],
      build: (size) => "$x+1$ ".repeat(size),
    },
    {
      name: "long-formula",
      sizes: [64, 128, 256, 512],
      build: (size) => `$${"x+".repeat(size)}x$`,
    },
    {
      name: "display-formulas",
      sizes: [16, 32, 64, 128],
      build: (size) => "$$\na = 1\n$$\n\n".repeat(size),
    },
  ],
});

export default spec;
