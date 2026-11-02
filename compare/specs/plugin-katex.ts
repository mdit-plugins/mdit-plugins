import { composeNormalizers, normalizeHtml } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Unwrap the display math wrapper of the current package
 *
 * `@mdit/plugin-katex` wraps display math in `<p class='katex-block'>` so that it can be styled,
 * while the reference emits a plain `<p>`. Both wrappers end up as a paragraph around the same
 * KaTeX HTML, so only the class is normalized away.
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

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    targetMs: 100,
    file: `corpora/plugin-katex/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-katex",
  reference: "markdown-it-katex",
  normalize: composeNormalizers(unwrapDisplayWrapper, trimAnnotationContent, normalizeHtml),
  notes: [
    {
      en: "This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.",
      zh: "本次对比在两侧渲染真实的 KaTeX，并对比生成的 HTML。参考包声明 `katex: ^0.6.0`，但仓库中已提交的工作区 override（`pnpm-workspace.yaml` 中的 `overrides.katex: ^0.19.0`，为文档工具链保留）让安装后的参考包使用与本包相同的 KaTeX 0.19.1，因此渲染出的数学 HTML 可直接对比。若该 override 被移除，参考包会回退到 KaTeX 0.6，本 spec 就必须改为 token 级对比。",
    },
    {
      en: "The benchmark still shows a small gap that is not plugin overhead: this ESM package resolves `katex` through the `import` condition (`dist/katex.mjs`) while the CJS reference resolves `dist/katex.js`. The identical KaTeX 0.19.1 code runs about 4.5% faster as CJS on Node, so with both sides forced onto the same KaTeX build the packages measure at parity; neither package allocates KaTeX options per formula any more.",
      zh: "基准测试中仍存在小幅差距，但并非插件开销：本包是 ESM，通过 `import` 条件解析 `katex`（`dist/katex.mjs`），而参考包是 CJS，解析 `dist/katex.js`。相同的 KaTeX 0.19.1 代码在 Node 上以 CJS 运行大约快 4.5%，因此当两侧强制使用同一个 KaTeX 构建时，两个包测得的性能相当；两个包都不再为每个公式分配 KaTeX 选项。",
    },
    {
      en: "Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it (the MathML `annotation` echoes the input formula, so its edge whitespace differs). The visible KaTeX HTML is unchanged by either normalization, and both are documented here rather than hidden.",
      zh: "两处有意的标记差异通过归一化处理而非直接对比：当前包将行间公式包裹在 `<p class='katex-block'>` 中（参考包输出普通 `<p>`），并且当前包保留块级公式的首尾空白/换行，而参考包会将其裁剪（MathML 的 `annotation` 会回显输入公式，因此其首尾空白不同）。两种归一化都不会改变可见的 KaTeX HTML，且这两处差异都在此记录，而非被隐藏。",
    },
    {
      en: "`throwOnError: false` is set on both sides so that invalid LaTeX is handled the same way. This is already the default of the current package; with the reference's defaults the reference instead emits the raw LaTeX from its own `catch` block, which is a documented default difference and not compared.",
      zh: "两侧都设置 `throwOnError: false`，以便以相同方式处理无效 LaTeX。这已经是当前包的默认值；在参考包的默认设置下，参考包会从其自身的 `catch` 块输出原始 LaTeX，这是已记录的默认值差异，不参与对比。",
    },
    {
      en: "Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), and a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`).",
      zh: "已记录差异源自当前 fork 更严格的定界符规则：起始 `$` 前需要一个非单词字符，结束 `$` 后也需要一个非单词字符（`$a$b`、`a$x$`）；公式内被空白包围的行内 `$` 会被视为字面内容并继续扫描（`$\\text{a $ b}$`）；结束 `$` 不能紧跟另一个 `$`（`$a$$b$`）；单行 `$$...$$` 后紧跟行内内容时不视为块级公式（`$$a$$ tail`）。",
    },
    {
      en: "One difference is a feature, not a regression: macros defined with `\\gdef` are shared between the formulas of one document by the current package (`macros` is a single object per render), while the reference creates fresh KaTeX settings for every formula, so a later formula cannot use an earlier `\\gdef`. The case documents this.",
      zh: "有一处差异是特性而非回归：当前包会在同一文档的公式之间共享用 `\\gdef` 定义的宏（`macros` 在每次渲染中都是同一个对象），而参考包会为每个公式创建全新的 KaTeX 设置，因此后面的公式无法使用前面 `\\gdef` 定义的宏。该用例记录了这一点。",
    },
    {
      en: "Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\\(...\\)` / `\\[...\\]`), `mathFence` (```` ```math ````), `allowInlineWithSpace`, `transformer`, and the `logger` callback.",
      zh: "仅当前 fork 独有的行为不参与对比，因为参考包没有对应选项：括号定界符（`\\(...\\)` / `\\[...\\]`）、`mathFence`（```` ```math ````）、`allowInlineWithSpace`、`transformer` 以及 `logger` 回调。",
    },
    {
      en: "Benchmarks render real KaTeX on both sides (display and inline) with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.",
      zh: "基准测试在两侧用小型语料渲染真实的 KaTeX（行间和行内）：`normal/large` 为 24 个行内公式，`heavy/large` 为 24 个行内公式加 8 个行间公式。每个用例的 `targetMs` 为 100 ms。",
    },
    {
      en: "Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.",
      zh: "扩展性序列测量真实渲染：大量行内公式、一个超长公式以及大量行间公式。KaTeX 0.19 渲染和参考包解析器在所探测的每种模式上都测得线性（拟合指数约 1），因此这些序列是回归基线，而不是用来暴露超线性行为。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "katex",
      referenceExport: "default",
      ourOptions: { throwOnError: false },
      referenceOptions: { throwOnError: false },
    },
  ],
  testSuiteSkips: [
    {
      file: "katex.spec.ts",
      name: "default logger should not give warnings",
      why: {
        en: "Asserts the warning count of the current package's default `logger`; the reference has no logging callback, so the console output it produces is not comparable.",
        zh: "该测试断言当前包默认 `logger` 的警告次数；参考包没有日志回调，其产生的控制台输出不可对比。",
      },
    },
    {
      file: "katex.spec.ts",
      name: "should support custom logger",
      why: {
        en: "Uses the fork-only `logger` option (no equivalent in the reference) and asserts its exact call count, so the test cannot be meaningfully run against the reference.",
        zh: "该测试使用仅本包提供的 `logger` 选项（参考包没有对应项）并断言其精确调用次数，因此无法有意义地在参考实现上运行。",
      },
    },
    {
      file: "katex.spec.ts",
      name: "should work with transformer",
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
    { name: "block-edge-space", markdown: "$$ a $$" },
    { name: "block-fraction", markdown: "$$\n\\frac{1}{2}\n$$" },
    {
      name: "block-aligned",
      markdown: String.raw`$$\begin{aligned}
a &= b \\
c &= d
\end{aligned}$$`,
    },
    { name: "block-in-document", markdown: "Before.\n\n$$\n\\frac{1}{2}\n$$\n\nAfter." },
    { name: "invalid-inline", markdown: String.raw`Broken $\frac{1}$ formula.` },
    { name: "invalid-display", markdown: "$$\n\\frac{1}\n$$" },
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
      note: {
        en: "The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text and nothing is rendered; the reference parses and renders `a`.",
        zh: "当前 fork 要求结束 `$` 后为非单词字符，因此 `$a$b` 保持字面文本，不渲染任何内容；参考包会解析并渲染 `a`。",
      },
    },
    {
      name: "word-boundary-open",
      markdown: "a$x$",
      note: {
        en: "The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses and renders `x`.",
        zh: "当前 fork 要求起始 `$` 前为非单词字符，因此 `a$x$` 保持字面文本；参考包会解析并渲染 `x`。",
      },
    },
    {
      name: "adjacent-dollar-inline",
      markdown: "$a$$b$",
      note: {
        en: "The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the line stays literal; the reference renders `$a$` and `$b$` as two formulas.",
        zh: "当结束 `$` 紧跟另一个 `$` 时，当前 fork 不会闭合公式，因此整行保持字面文本；参考包会将 `$a$` 和 `$b$` 渲染为两个公式。",
      },
    },
    {
      name: "literal-gap-inline",
      markdown: String.raw`$\text{a $ b}$`,
      note: {
        en: "The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter, then renders the formula; the reference gives up at the first `$` that cannot close and emits literal text.",
        zh: "当前 fork 会将公式内被空格包围的 `$` 视为字面内容，并继续扫描结束定界符，然后渲染公式；参考包在遇到第一个无法闭合的 `$` 时放弃，并输出字面文本。",
      },
    },
    {
      name: "block-trailing-content",
      markdown: "$$a$$ tail",
      note: {
        en: "A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the line stays a paragraph); the reference renders the whole line as one display formula and KaTeX reports an error for the trailing text.",
        zh: "单行 `$$...$$` 后紧跟非空白内容时，当前 fork 有意不将其视为块级公式（整行保持为段落）；参考包会把整行渲染为一个行间公式，KaTeX 会为尾随文本报告错误。",
      },
    },
    {
      name: "macro-scope",
      markdown: String.raw`$\gdef\foo{x}$ $\foo$`,
      note: {
        en: "Macros defined with the `gdef` command are shared between the formulas of one document by the current package, so the second formula renders `x`; the reference creates fresh KaTeX settings per formula, so the macro is undefined there and renders as a KaTeX error.",
        zh: "当前包会在同一文档的公式之间共享用 `gdef` 命令定义的宏，因此第二个公式渲染为 `x`；参考包会为每个公式创建全新的 KaTeX 设置，因此该宏在那里未定义，渲染为 KaTeX 错误。",
      },
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
