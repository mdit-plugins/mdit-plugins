import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";

import { resolvePlugin } from "../loader.ts";
import type { CompareRenderer, ComparisonSpec, PluginModule } from "../types.ts";
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
 * Serialize one token and its inline children into a stable string
 *
 * Math token content is trimmed at the edges: the reference keeps the leading whitespace of the
 * first block line and drops the trailing newline, while the current package keeps the trailing
 * newline and the untrimmed first line. KaTeX receives the same formula either way, so only the
 * edge formatting is normalized here.
 *
 * @param tokens - Tokens to serialize
 * @param indent - Indentation of the current nesting level
 * @returns Comparable token description
 */
const serializeTokens = (tokens: readonly Token[], indent = ""): string =>
  tokens
    .map((token) => {
      const content = token.type.startsWith("math_") ? token.content.trim() : token.content;
      const markup = token.markup ? `{${token.markup}}` : "";
      const line = `${indent}${token.type}${markup}:${JSON.stringify(content)}`;

      return token.children ? `${line}\n${serializeTokens(token.children, `${indent}  `)}` : line;
    })
    .join("\n");

/**
 * Deterministic stub renderer for the required `render` option
 *
 * The comparison never reaches a renderer: the token stream is compared right after parsing.
 *
 * @param content - Tex content
 * @param displayMode - Whether the formula is display mode
 * @returns Stable placeholder
 */
const stubRender = (content: string, displayMode: boolean): string =>
  displayMode ? `\\[${content}\\]` : `\\(${content}\\)`;

/**
 * Create a renderer that compares the parsed token stream instead of rendered output
 *
 * `@mdit/plugin-tex` is a fork of `markdown-it-katex` with a pluggable renderer, so the two plugins
 * cannot be compared through their rendered HTML: the current package requires a `render` option
 * and the reference always renders with KaTeX. Both sides are parsed with the same markdown-it core
 * and the resulting token stream (including text tokens, so literal `$` handling is compared too)
 * is serialized instead.
 *
 * @param module - Loaded plugin module
 * @param exportName - Plugin export name
 * @param options - Options passed to the plugin
 * @returns A renderer that parses markdown and dumps the token stream
 */
const createTokenRenderer = (
  module: PluginModule,
  exportName: string,
  options?: unknown,
): CompareRenderer => {
  const plugin = resolvePlugin(module, exportName);
  const md = new MarkdownIt();

  md.use(plugin, options);

  return (markdown) => serializeTokens(md.parse(markdown, {}));
};

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
  plugin: "plugin-tex",
  reference: "markdown-it-katex",
  normalize: (output) => output,
  notes: [
    "`@mdit/plugin-tex` is a fork of `markdown-it-katex` with a pluggable renderer and a required `render` option, so rendered output is not comparable: the reference always renders KaTeX HTML while this package delegates rendering. Both sides are compared on the parsed token stream instead (token type, markup, content, and text tokens, so differences in literal `$` handling are visible).",
    "The required `render` option of the current package is set to a deterministic stub (`\\(...\\)` / `\\[...\\]`). It is never invoked because the comparison reads the parsed tokens instead of rendering them, so no real KaTeX work happens on either side.",
    "Math token content is compared after trimming edge whitespace. The reference trims the first line of a block formula and drops the trailing newline, while the current package preserves both; both implementations pass the same formula payload to their renderer, so the edge formatting is not a behavioral difference and the case `block-edge-space` is reported as an exact match.",
    "Edge formatting aside, the token streams match on inline math, `$$` fences, escaping, unmatched delimiters, an effectively empty document, and markdown constructs that must not be parsed as math (code spans, fences). Labels are not implemented by either plugin, so no `math_block_label` tokens are compared.",
    "Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`), and `$$` alone is not a math block.",
    "Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\\(...\\)` / `\\[...\\]`), `mathFence` (```` ```math ````), `allowInlineWithSpace`, and the `render` callback itself.",
    "Benchmarks measure parsing only on both sides (the stub renderer is never called and the reference renderer is not invoked), so the two sides do the same work. The corpora stay small on purpose: 24 inline formulas for `normal/large` and 24 inline plus 8 display formulas for `heavy/large`.",
    "Scaling series probe the delimiter scanners: many unmatched `$$` fence lines (the current `math_block` rule scans ahead even in silent mode and the paragraph terminator calls it once per line, so the fitted exponent is well above 1 and approaches 2 asymptotically; the reference short-circuits in silent mode and then consumes the rest of the document as a single block, staying linear), many inline formulas, and many closed multi-line `$$` fences (the reference re-scans the document prefix to find the closing line).",
  ],
  variants: [
    {
      id: "default",
      ourExport: "tex",
      referenceExport: "default",
      ourOptions: { render: stubRender },
      referenceOptions: {},
      createOurRenderer: (module) => createTokenRenderer(module, "tex", { render: stubRender }),
      createReferenceRenderer: (module) => createTokenRenderer(module, "default", {}),
    },
  ],
  correctness: [
    { name: "inline-basic", markdown: "$a+b$" },
    { name: "inline-in-text", markdown: "The value $x^2$ is positive." },
    { name: "inline-multiple", markdown: "Given $a$ and $b$ and $c$, conclude." },
    { name: "inline-escaped-dollar", markdown: String.raw`A price of $\$5$ is cheap.` },
    { name: "inline-escaped-text", markdown: String.raw`Literal \$not math\$ delimiters.` },
    { name: "inline-word-price", markdown: "It costs $5 or $6 today, nothing more." },
    { name: "block-single-line", markdown: "$$a=1$$" },
    { name: "block-multiline", markdown: "$$\na+b\n$$" },
    { name: "block-empty-lines", markdown: "$$\n\n$$" },
    { name: "block-edge-space", markdown: "$$ a $$" },
    { name: "block-closing-content", markdown: "$$\na + b\nc = d $$" },
    { name: "block-in-document", markdown: "Before.\n\n$$\n\\frac{1}{2}\n$$\n\nAfter." },
    { name: "inline-in-emphasis", markdown: "*emphasized $x$ and $y$ here*" },
    { name: "inline-in-link", markdown: "[$x$](https://example.com)" },
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
      note: "The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text; the reference closes the formula before `b`.",
    },
    {
      name: "word-boundary-open",
      markdown: "a$x$",
      note: "The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses the formula.",
    },
    {
      name: "adjacent-dollar-inline",
      markdown: "$a$$b$",
      note: "The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the whole line stays literal; the reference parses `$a$` and `$b$` as two formulas.",
    },
    {
      name: "literal-gap-inline",
      markdown: String.raw`$\text{a $ b}$`,
      note: "The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter; the reference gives up at the first `$` that cannot close and emits literal text.",
    },
    {
      name: "block-trailing-content",
      markdown: "$$a$$ tail",
      note: "A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the trailing content stays a paragraph); the reference swallows the entire line into one display formula.",
    },
    {
      name: "block-trailing-inline-math",
      markdown: "$$a$$ $b$",
      note: "Same as `block-trailing-content`: the current fork falls back to a paragraph and parses `$b$` as inline math, while the reference emits one display formula containing the whole line.",
    },
    {
      name: "empty-block-fence",
      markdown: "$$",
      note: "The current fork only emits a math block when a closing `$$` exists; the reference emits an empty `math_block` token for a lone `$$`.",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "unmatched-block-fence",
      sizes: [128, 256, 512, 1024],
      build: (size) => "$$ a\n".repeat(size),
    },
    {
      name: "inline-formulas",
      sizes: [64, 128, 256, 512],
      build: (size) => "$x+1$ ".repeat(size),
    },
    {
      name: "multiline-block-fences",
      sizes: [64, 128, 256, 512],
      build: (size) => "$$\na = 1\n$$\n\n".repeat(size),
    },
  ],
});

export default spec;
