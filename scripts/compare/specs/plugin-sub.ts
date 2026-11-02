import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Target byte length of every benchmark corpus size */
const CORPUS_TARGETS = { small: 2000, medium: 11000, large: 40000 } as const;

/** Markdown with a sparse amount of sub syntax, close to a normal document */
const NORMAL_UNIT = `## Release notes

Version 2.4 focuses on stability and documentation. Water is H~2~O, as every guide says.

- Added support for ~inline subscripts~ in the changelog renderer.
- Fixed a regression when a [link](https://example.com) contains \`inline code\`.
- Improved error messages for malformed tables.

> A short blockquote that mentions the new syntax once.

\`\`\`js
const version = "2.4.0";
\`\`\`

`;

/** Markdown where almost every inline run is a subscript */
const HEAVY_UNIT = `H~2~O ~alpha~ ~beta~ ~gamma~ ~delta~
~x~ ~y~ ~z~ and ~**bold**~ text
[~linked~](https://example.com/~path~) and \`~code~\`
- ~item one~ ~item two~
> ~quoted~ ~text~
~escaped\\ space~ ~tail~

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
  plugin: "plugin-sub",
  reference: "markdown-it-sub",
  notes: [
    "Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.",
    "The package uses the shared linear inline rule; like the reference it scans to the next marker, rejects unescaped whitespace in the content and unescapes backslash escapes. Every correctness case renders identical HTML, so no case is a documented difference.",
    "Scaling: the scanner stops at the next marker character, so repeated unmatched openers do not rescan the remaining line, and `long-inline-run` scans its content once. `inline-subscripts`, `unmatched-openers` and `long-inline-run` all fit a near-linear exponent on both sides; no superlinear path was found.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "sub",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    { name: "basic", markdown: "H~2~0" },
    { name: "inline-sentence", markdown: "Water is H~2~O at room temperature." },
    { name: "empty-markers", markdown: "~~" },
    { name: "empty-with-space", markdown: "~ ~" },
    { name: "whitespace-inside", markdown: "~foo bar~" },
    { name: "escaped-space", markdown: String.raw`~foo\ bar\ baz~` },
    { name: "escaped-closing", markdown: String.raw`~foo\~` },
    { name: "escaped-opening", markdown: String.raw`\~foo~` },
    { name: "multiple-backslashes", markdown: String.raw`~foo\\\\\ bar~` },
    { name: "other-markers", markdown: "~foo^bar~ baz~" },
    { name: "nested-emphasis", markdown: "**~foo~ bar**" },
    { name: "nested-markers", markdown: "~outer ~inner~ outer~" },
    { name: "inside-emphasis", markdown: "*H~2~O*" },
    { name: "inside-strong", markdown: "**H~2~O**" },
    { name: "inside-inline-code", markdown: "`H~2~O`" },
    { name: "code-inside", markdown: "~H`2`O~" },
    { name: "inside-link", markdown: "[H~2~O](https://example.com)" },
    { name: "link-inside", markdown: "~[link](https://example.com)~" },
    { name: "unclosed", markdown: "~unclosed" },
    { name: "adjacent", markdown: "~a~~b~" },
    { name: "punctuation", markdown: "a~b~c, (H~2~O)." },
    { name: "multiline", markdown: "~multi\nline~" },
    { name: "inside-code-fence", markdown: "```md\nH~2~O\n```" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with ~ and ~~ symbols.\n\n- a\n- b",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-subscripts",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"~word~ ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"~word ".repeat(size)}\n`,
    },
    {
      name: "long-inline-run",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `~${"word".repeat(size)}~\n`,
    },
  ],
});

export default spec;
