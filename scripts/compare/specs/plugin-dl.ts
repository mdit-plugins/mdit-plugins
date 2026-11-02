import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Target corpus size in bytes for each benchmark size */
const CORPUS_BYTES = { small: 2000, medium: 10000, large: 40000 } as const;

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param size - Corpus size
 * @returns Markdown of roughly the requested size
 */
const buildCorpus = (unit: string, size: "small" | "medium" | "large"): string =>
  unit.repeat(Math.max(1, Math.round(CORPUS_BYTES[size] / unit.length)));

/** Markdown with a sparse amount of definition list syntax, close to a normal document */
const NORMAL_UNIT = `## Definition lists

A regular paragraph that introduces the definition list below.

Apple
: Pomaceous fruit of plants of the genus Malus in the family Rosaceae.

Orange
: The fruit of an evergreen tree of the genus Citrus.

A paragraph after the list that keeps the document realistic.

- first list item
- second list item

`;

/** Markdown where most blocks are definition lists */
const HEAVY_UNIT = `Term 1

: Definition 1 with **bold** text and \`inline code\`.

Term 2
: Definition 2a
: Definition 2b

Term 3
: Definition
with lazy continuation.

    Second paragraph of the definition.

Term 4

: Definition with a nested list

  - nested item
  - nested item

Term 5
~ Tilde definition

Term 6

: Definition with a code block

        const value = 1;

`;

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, size),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-dl",
  reference: "markdown-it-deflist",
  notes: [
    "Neither package takes options; both are installed with their defaults.",
    "The current package and the reference only differ in source-map / token metadata that is not rendered, so every correctness case compares equal.",
    "Historical context: the reference implementation had a hang (infinite loop) on definition lines starting with `: >` or `~ >` (markdown-it-deflist#5), fixed in 2.0.3. The installed 4.0.0 and this fork are both linear on that pattern and on all other probed patterns.",
    "`nested-definitions` grows its indentation by four spaces per level, so the generated input itself is quadratic in the series size; the fitted exponent is a lower bound for the parser's work per input byte, not a quadratic parser.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "dl",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    {
      name: "basic",
      markdown:
        "Apple\n: Pomaceous fruit of plants of the genus Malus.\n\nOrange\n: The fruit of an evergreen tree of the genus Citrus.\n",
    },
    {
      name: "blank-line-after-term",
      markdown: "Term 1\n\n: Definition 1\n\nTerm 2\n: Definition 2\n",
    },
    { name: "multiple-definitions", markdown: "Term 1\n: Definition 1\n: Definition 2\n" },
    { name: "tilde-marker", markdown: "Term 1\n~ Tilde definition\n" },
    {
      name: "lazy-continuation",
      markdown: "Term 1\n: Definition\nwith lazy continuation.\n",
    },
    {
      name: "multi-paragraph-definition",
      markdown: "Term\n: Def with paragraph\n\n    Second paragraph.\n",
    },
    {
      name: "code-block-in-definition",
      markdown: "Term\n: Def\n\n      six spaces\n",
    },
    {
      name: "list-in-definition",
      markdown: "Term\n: Def\n  - nested list\n",
    },
    { name: "heading-in-definition", markdown: "Term\n: Def\n\n    # heading\n" },
    {
      name: "blockquote-in-definition",
      markdown: "Term\n: Def\n\n    > quote in dd\n",
    },
    {
      name: "inline-markup-term",
      markdown: "Term with *emphasis*\n: Def with `code`\n",
    },
    {
      name: "nested-deflist",
      markdown: "Term\n: Definition\n\n    Term 2\n    : Nested definition\n",
    },
    { name: "empty-definition", markdown: "Term\n:\n: empty definition\n" },
    { name: "empty-definition-next-line", markdown: "Term\n\n:\n" },
    { name: "no-space-after-marker", markdown: "Term\n:no space\n" },
    { name: "double-marker", markdown: "Term\n:: double marker\n" },
    {
      name: "definition-after-paragraph",
      markdown: "A paragraph\n\nTerm\n: Definition\n",
    },
    { name: "deflist-in-list", markdown: "- item\n\n  Term\n  : Def\n" },
    { name: "deflist-in-blockquote", markdown: "> Term\n> : Def\n" },
    {
      name: "term-followed-by-unindented-line",
      markdown: "Term\n: Def\nnot a marker\n",
    },
    {
      name: "consecutive-deflists",
      markdown: "A\n: 1\n\nB\n: 2\n\nC\n: 3\n",
    },
    {
      name: "no-deflist-syntax",
      markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b\n\n```js\nconst a = 1;\n```\n",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-terms",
      sizes: [128, 256, 512, 1024],
      build: (size) =>
        Array.from({ length: size }, (_, index) => `Term ${index}\n: Definition ${index}\n`).join(
          "\n",
        ),
    },
    {
      name: "many-definitions-per-term",
      sizes: [128, 256, 512, 1024],
      build: (size) => `Term\n${": definition\n".repeat(size)}`,
    },
    {
      name: "nested-definitions",
      sizes: [128, 256, 512, 1024],
      build: (size) => {
        let markdown = "Term\n: Definition\n";

        for (let level = 0; level < size; level++)
          markdown += `\n${"    ".repeat(level + 1)}Term ${level}\n${"    ".repeat(level + 1)}: Nested ${level}\n`;

        return markdown;
      },
    },
  ],
});

export default spec;
