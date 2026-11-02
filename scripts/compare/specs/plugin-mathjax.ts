import { sortAttributes } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Generated per-formula wrapper of the reference output: `<span id="mjx-<hash>"><style>…</style>` */
const REFERENCE_FORMULA_OPEN = /\s*<span id="mjx-[0-9a-z]+">\s*<style>[\s\S]*?<\/style>\s*/gu;

/** One rendered formula container of either implementation */
const FORMULA_CONTAINER = /<mjx-container\b[^>]*>[\s\S]*?<\/mjx-container>/gu;

/** Assistive MathML emitted inside a formula container */
const ASSISTIVE_MATHML = /<mjx-assistive-mml\b[^>]*>(?<mathml>[\s\S]*?)<\/mjx-assistive-mml>/u;

/** `<pre>` blocks, whose whitespace is meaningful */
const PRE_BLOCK = /(?<pre><pre\b[\s\S]*?<\/pre>)/gu;

/**
 * Collapse HTML whitespace, leaving `<pre>` content untouched
 *
 * @param html - Rendered HTML
 * @returns HTML with collapsed whitespace
 */
const collapseWhitespaceOutsidePre = (html: string): string =>
  html
    .split(PRE_BLOCK)
    .map((part, index) => (index % 2 === 0 ? part.replaceAll(/\s+/gu, " ") : part))
    .join("");

/**
 * Replace one formula container by a canonical marker holding its assistive MathML
 *
 * @param container - `<mjx-container>` output of one formula
 * @returns Canonical formula marker
 */
const formulaToMarker = (container: string): string => {
  // `display="true"` marks block math on the container of both implementations
  const display = /^<mjx-container\b[^>]*\sdisplay="true"/u.test(container);
  const mathml = (ASSISTIVE_MATHML.exec(container)?.groups?.mathml ?? "")
    // MathJax 4 metadata (`data-latex`, `data-mjx-*`, `data-break-align`)
    .replaceAll(/\sdata-[\w-]+="[^"]*"/gu, "")
    // MathJax 4 emits presentational `<mstyle>` wrappers for alignment/script level
    .replaceAll(/<\/?mstyle\b[^>]*>/gu, "");

  return `<math-formula kind="${display ? "display" : "inline"}">${mathml}</math-formula>`;
};

/**
 * Normalize the rendered output of both implementations
 *
 * The reference wraps every formula in a generated `<span id="mjx-<hash>">` holding the full SVG
 * stylesheet inline, while the current package returns the stylesheet once through
 * `getMathjax(md).outputStyle()`. Both sides render with different MathJax majors and font
 * packages, so the SVG path data is presentational; the assistive MathML of every formula is
 * compared instead.
 *
 * @param html - Rendered HTML
 * @returns Normalized HTML
 */
const normalizeMathjaxOutput = (html: string): string => {
  let result = html
    .replaceAll(REFERENCE_FORMULA_OPEN, " ")
    .replaceAll(FORMULA_CONTAINER, formulaToMarker)
    // Closing tag of the reference wrapper, now empty
    .replaceAll(/(?<formula><\/math-formula>)\s*<\/span>/gu, "$<formula>");

  result = collapseWhitespaceOutsidePre(result);
  // The reference template pads every formula with newlines; that padding is not content
  result = result.replaceAll(
    /\s*(?<formula><math-formula\b[^>]*>[\s\S]*?<\/math-formula>)\s*/gu,
    "$<formula>",
  );
  result = sortAttributes(result);

  return result.trim();
};

/** Markdown with a sparse amount of math, close to a normal document */
const NORMAL_UNIT = `## Section

A paragraph with some plain text and an inline formula $x_{i}^2 + y_{i}^2$ plus a [link](https://example.com).

- first list item
- second list item

`;

/** Markdown where math dominates the document */
const HEAVY_UNIT = `Inline $a_{i} + b_{i} = c_{i}$ text followed by display math:

$$
\\frac{a_{i}}{b_{i}} = \\sqrt{c_{i}^2 + d_{i}^2}
$$

`;

/** Repetitions of the corpus unit for every benchmark size */
const REPETITIONS = {
  normal: { small: 2, medium: 6, large: 16 },
  heavy: { small: 2, medium: 5, large: 12 },
} as const;

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: (kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT).repeat(REPETITIONS[kind][size]),
    targetMs: 100,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-mathjax",
  reference: "markdown-it-mathjax3",
  notes: [
    "The synchronous entry is compared (`installSyncMathjax`, also exported as `mathjax`): the reference renders synchronously and the async entry of the current package exposes a different API (it takes a MathJax instance instead of plugin options). The sync entry renders MathJax in a worker thread and blocks on one IPC round-trip per document (plus one reset round-trip); the reference typesets in-process through `deasync`.",
    'Equivalent options: `{ output: "svg" }` (the current default) matches the reference, which only produces SVG. Both sides use `$` / `$$` delimiters only (`delimiters: "dollars"`, `mathFence: false`, `allowInlineWithSpace: false`) and render assistive MathML by default (`a11y: true`). The default `renderStrategy: "batch"` converts every formula of a document (one worker batch), the same number of MathJax conversions as the reference performs per formula.',
    'Normalization: the reference wraps every formula in `<span id="mjx-<hash>"><style>…full MathJax stylesheet…</style> formula </span>`. The id and the inlined CSS are generated per formula (the current package returns the stylesheet once through `getMathjax(md).outputStyle()`), so the wrapper and its template whitespace are normalized away.',
    "Normalization: formulas are compared by their assistive MathML instead of the SVG, because the current package renders with MathJax 4 (`@mathjax/src` + the newcm font) while the reference bundles MathJax 3 (`mathxyjax3`'s `tex-svg-full`). SVG paths, widths and `viewBox` values therefore differ by font version by design. Generated `data-*` metadata attributes and presentational `<mstyle>` wrappers are dropped; the MathML tree, its text and MathJax error content stay visible.",
    "The reference duplicates its whole stylesheet inside every formula (about 4 KiB per formula), which is why its raw output is much larger per formula; that is a known output-size difference of the reference wrapper, not a rendering difference.",
    "Scaling series: `inline-formulas`, `unmatched-dollars` and `block-fences` check the delimiter scans of the reference (its `math_inline` rescan of `$` candidates and the block loop over `$$` fences); all three fit an exponent near 1 on both sides. `unclosed-block` targets the reference's `math_block` rule: without a closing `$$` it still pushes a display-math token that swallows the rest of the document, so MathJax lays out the whole remaining file as one formula and the measured cost grows superlinearly (fitted exponent ~1.4-1.5), while the current package falls back to a paragraph and stays linear.",
  ],
  variants: [
    {
      id: "sync",
      ourExport: "installSyncMathjax",
      referenceExport: "default",
      ourOptions: { output: "svg" },
      referenceOptions: {},
    },
  ],
  normalize: normalizeMathjaxOutput,
  correctness: [
    { name: "inline-simple", markdown: "Inline $x^2$ math." },
    {
      name: "inline-tex-commands",
      markdown: String.raw`$\sum_{i=1}^{n} i^2$ and $\int_0^1 x\,dx$`,
    },
    { name: "inline-frac", markdown: String.raw`Text with $\frac{a}{b}$ and $\alpha$.` },
    { name: "inline-text", markdown: String.raw`$\text{hello world}$` },
    { name: "inline-mhchem", markdown: String.raw`$\ce{H2O}$` },
    { name: "display-fence", markdown: "$$\nx^2 + y^2 = z^2\n$$" },
    { name: "display-single-line", markdown: "$$x^2$$" },
    { name: "display-multi-formula", markdown: "$$\na\n$$\n\n$$\nb\n$$" },
    { name: "display-in-blockquote", markdown: "> $$\n> x\n> $$" },
    { name: "display-in-list", markdown: "- item\n\n  $$\n  x\n  $$" },
    { name: "no-math", markdown: "# Plain heading\n\nA plain paragraph with 100% plain text." },
    { name: "empty-document", markdown: "\n" },
    { name: "unmatched-inline", markdown: "Unmatched $x end." },
    { name: "escaped-dollar", markdown: String.raw`Escaped \$x\$ here.` },
    { name: "code-span", markdown: "`$x$` is code" },
    { name: "fence-code", markdown: "```\n$x$\n```" },
    { name: "math-fence-language", markdown: "```math\nx\n```" },
    { name: "tex-error", markdown: String.raw`Error $\frac{$ end.` },
    { name: "plain-dollar-currency", markdown: "Price $5 and $10 dollars." },
    {
      name: "tag-numbered",
      markdown: String.raw`$$\tag{1} x = y$$`,
      note: "`\\tag{1}` is laid out identically, but MathJax 4 splits the tag into `<mtext>(</mtext><mtext>1</mtext><mtext>)</mtext>` while MathJax 3 emits a single `<mtext>(1)</mtext>` in the assistive MathML.",
    },
    {
      name: "inline-adjacent-word",
      markdown: "a$x$b",
      note: "The reference delimiter check has no word-boundary rule, so it parses `a$x$b` as inline math; the current package requires a word boundary around `$` so that currency amounts stay literal (see `plain-dollar-currency`).",
    },
    {
      name: "block-unclosed",
      markdown: "$$\nunclosed block\n",
      note: "An unclosed `$$` block is still emitted as display math by the reference: its `math_block` rule scans to the end of the document and then pushes the token anyway. The current package only starts a block when the closing `$$` exists and otherwise falls back to a paragraph.",
    },
    {
      name: "block-trailing-inline",
      markdown: "$$a=1$$ and $b=2$",
      note: "The reference parses `$$a=1$$ and $b=2$` as one display-math block that swallows the trailing inline expression; the current package keeps the line as a paragraph and renders `$b=2$` as inline math.",
    },
    {
      name: "escaped-backslash-dollar",
      markdown: String.raw`$a\\$b`,
      note: "`$a\\\\$b`: the reference counts the preceding backslash run differently and closes the math after the escaped backslash (`\\\\` then `$`), while the current package treats a `$` preceded by an even number of backslashes as escaped and keeps the line literal.",
    },
    {
      name: "text-with-dollar",
      markdown: String.raw`$a \text{ $ b}$`,
      note: "The reference stops scanning at the whitespace-surrounded `$` inside `\\text{…}` and leaves the whole line literal; the current package treats that `$` as literal TeX content, keeps scanning to the final `$` and renders an error node.",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-formulas",
      sizes: [32, 64, 128, 256],
      build: (size) => "$x^2$ ".repeat(size),
    },
    {
      name: "unmatched-dollars",
      sizes: [1024, 2048, 4096, 8192],
      build: (size) => "$1 ".repeat(size),
    },
    {
      name: "block-fences",
      sizes: [32, 64, 128, 256],
      build: (size) => "$$\nx\n$$\n\n".repeat(size),
    },
    {
      name: "unclosed-block",
      sizes: [256, 512, 1024, 2048],
      build: (size) => `$$\n${"text line\n".repeat(size)}`,
    },
  ],
});

export default spec;
