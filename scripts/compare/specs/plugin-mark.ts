import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Target byte length of every benchmark corpus size */
const CORPUS_TARGETS = { small: 2000, medium: 11000, large: 40000 } as const;

/** Markdown with a sparse amount of mark syntax, close to a normal document */
const NORMAL_UNIT = `## Release notes

Version 2.4 focuses on stability and documentation. The migration guide is unchanged.

- Added support for ==inline marks== in the changelog renderer.
- Fixed a regression when a [link](https://example.com) contains \`inline code\`.
- Improved error messages for malformed tables.

> A short blockquote that mentions the new syntax once.

\`\`\`js
const version = "2.4.0";
\`\`\`

`;

/** Markdown where almost every inline run is marked, including nested and odd marker runs */
const HEAVY_UNIT = `==alpha== ==beta== ==gamma== ==delta==
==nested ==inner== mark== and ==**bold** ==text==
[==linked==](https://example.com/==path==) and \`==code==\`
- ==item one== ==item two==
> ==quoted== ==text==
==escaped \\==marker== ==tail==

`;

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param size - Corpus size
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, size: "small" | "medium" | "large"): string =>
  unit.repeat(Math.ceil(CORPUS_TARGETS[size] / unit.length));

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, size),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-mark",
  reference: "markdown-it-mark",
  notes: [
    "Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.",
    "The package registers the shared nested inline rule with doubled `==` markers, like the reference; both follow the CommonMark emphasis delimiter rules and relocate the lone marker of odd-length runs. Every correctness case renders identical HTML, so no case is a documented difference.",
    "Scaling: both implementations consume each marker run once and move the lone marker of an odd-length run within a single run of adjacent close tags. `inline-marks`, `unmatched-openers` and `nested-odd-markers` all fit a near-linear exponent on both sides; no superlinear path was found.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "mark",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    { name: "basic", markdown: "==marked==" },
    { name: "inline-sentence", markdown: "The migration guide is ==ready to read==." },
    { name: "empty-markers", markdown: "====" },
    { name: "empty-with-space", markdown: "== ==" },
    { name: "single-marker", markdown: "=marked=" },
    { name: "whitespace-inside", markdown: "== marked ==" },
    { name: "whitespace-newline", markdown: "==multi\nline==" },
    { name: "escaped-opening", markdown: String.raw`\==marked==` },
    { name: "escaped-closing", markdown: String.raw`==marked\==` },
    { name: "nested", markdown: "====foo== bar==" },
    { name: "nested-outer", markdown: "==foo ==bar== baz==" },
    { name: "nested-emphasis", markdown: "==**bold** and *italic*==" },
    { name: "inside-emphasis", markdown: "**==marked==**" },
    { name: "inside-inline-code", markdown: "`==marked==`" },
    { name: "inside-code-fence", markdown: "```md\n==not marked==\n```" },
    { name: "inside-link", markdown: "[==marked==](https://example.com)" },
    {
      name: "inside-link-destination",
      markdown: "[link](https://example.com/==path==)",
    },
    { name: "unclosed", markdown: "==unclosed" },
    { name: "single-equal-inside", markdown: "==a= b==" },
    { name: "punctuation", markdown: "(==marked==), a==b==c and .==d==." },
    { name: "triple-markers", markdown: "x ===foo===" },
    { name: "link-priority", markdown: "[==link]()==" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with = and == symbols.\n\n- a\n- b",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-marks",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"==word== ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"==word ".repeat(size)}\n`,
    },
    {
      name: "nested-odd-markers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"==".repeat(size)}a${"=".repeat(2 * size + 1)}\n`,
    },
  ],
});

export default spec;
