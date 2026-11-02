import { composeNormalizers, normalizeHtml } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param repetitions - Number of repetitions
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, repetitions: number): string => unit.repeat(repetitions);

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

/** Markdown with one inline formula in otherwise plain prose */
const NORMAL_UNIT = `A realistic paragraph with an inline formula $x^2 + y^2 = z^2$ and some plain text.

- a list item without math
- another list item

\`\`\`js
const value = 1;
\`\`\`

`;

/** Markdown where almost every line carries math, including display math */
const HEAVY_UNIT = `The identity $a + b = b + a$, the difference $a - b$, and the product $a \\cdot b$.

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$

`;

/** Benchmark cases built from the two corpora */
const BENCH_CASES = [
  { kind: "normal" as const, sizes: { small: 2, medium: 8, large: 24 } },
  { kind: "heavy" as const, sizes: { small: 2, medium: 4, large: 8 } },
].flatMap(({ kind, sizes }) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    targetMs: 100,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, sizes[size]),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-katex-slim",
  reference: "markdown-it-katex",
  normalize: composeNormalizers(unwrapDisplayWrapper, trimAnnotationContent, normalizeHtml),
  notes: [
    "This comparison renders real KaTeX on both sides and compares the resulting HTML. The reference declares `katex: ^0.6.0`, but the committed workspace override (`pnpm-workspace.yaml`: `overrides.katex: ^0.19.0`, kept for the docs toolchain) makes the installed reference use the same KaTeX 0.19.1 as this package, so the rendered math HTML is directly comparable. If that override is ever removed the reference would fall back to KaTeX 0.6 and this spec would have to switch to a token-level comparison.",
    '`@mdit/plugin-katex-slim` is the same tex + KaTeX composition as `@mdit/plugin-katex`; the only difference is that it loads KaTeX with a dynamic `import("katex")` at module initialization and throws when KaTeX is not installed. The comparison therefore uses the same cases and the results should match `plugin-katex`.',
    "Two intentional markup differences are normalized instead of compared: the current package wraps display math in `<p class='katex-block'>` (the reference emits a plain `<p>`), and it keeps the edge whitespace/newline of the block formula while the reference trims it (the MathML `annotation` echoes the input formula, so its edge whitespace differs). The visible KaTeX HTML is unchanged by either normalization, and both are documented here rather than hidden.",
    "`throwOnError: false` is set on both sides so that invalid LaTeX is handled the same way. This is already the default of the current package; with the reference's defaults the reference instead emits the raw LaTeX from its own `catch` block, which is a documented default difference and not compared.",
    "Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), and a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`).",
    "One difference is a feature, not a regression: macros defined with `\\gdef` are shared between the formulas of one document by the current package (`macros` is a single object per render), while the reference creates fresh KaTeX settings for every formula, so a later formula cannot use an earlier `\\gdef`. The case documents this.",
    "Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\\(...\\)` / `\\[...\\]`), `mathFence` (```` ```math ````), `allowInlineWithSpace`, `transformer`, and the `logger` callback.",
    "Benchmarks render real KaTeX on both sides with small corpora: 24 inline formulas for `normal/large`, and 24 inline plus 8 display formulas for `heavy/large`. Per-case `targetMs` is 100 ms.",
    "Scaling series measure real rendering: many inline formulas, one very long formula, and many display formulas. KaTeX 0.19 rendering and the reference parser were both measured as linear (~1) on every pattern probed, so these series are a regression baseline rather than an exposure of superlinear behavior.",
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
      note: "The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text and nothing is rendered; the reference parses and renders `a`.",
    },
    {
      name: "word-boundary-open",
      markdown: "a$x$",
      note: "The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses and renders `x`.",
    },
    {
      name: "adjacent-dollar-inline",
      markdown: "$a$$b$",
      note: "The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the line stays literal; the reference renders `$a$` and `$b$` as two formulas.",
    },
    {
      name: "literal-gap-inline",
      markdown: String.raw`$\text{a $ b}$`,
      note: "The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter, then renders the formula; the reference gives up at the first `$` that cannot close and emits literal text.",
    },
    {
      name: "block-trailing-content",
      markdown: "$$a$$ tail",
      note: "A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the line stays a paragraph); the reference renders the whole line as one display formula and KaTeX reports an error for the trailing text.",
    },
    {
      name: "macro-scope",
      markdown: String.raw`$\gdef\foo{x}$ $\foo$`,
      note: "Macros defined with the `gdef` command are shared between the formulas of one document by the current package, so the second formula renders `x`; the reference creates fresh KaTeX settings per formula, so the macro is undefined there and renders as a KaTeX error.",
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
