import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param size - Corpus size
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, size: "small" | "medium" | "large"): string => {
  const repetitions = { small: 2, medium: 8, large: 24 }[size];

  return unit.repeat(repetitions);
};

/** Markdown with a sparse amount of attrs syntax, close to a normal document */
const NORMAL_UNIT = `## Section {#section .section}

A paragraph with a [link](https://example.com) and some plain text that keeps the line long enough.

- first list item
- second list item

\`\`\`js
const value = 1;
\`\`\`

`;

/** Markdown where almost every block and inline element carries attrs */
const HEAVY_UNIT = `## Heading {#heading .heading data-level=2}

Text {.text} with \`code\`{.code} and **bold**{.bold} and [link](https://example.com){.link}.

- item one {.item}
- item two {.item}

| A | B |
|---|---|
| 1 | 2 |

{.table}

\`\`\`js {.fence}
const value = 1;
\`\`\`

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
  plugin: "plugin-attrs",
  reference: "markdown-it-attrs",
  notes: [
    "`fenceAttrsOnPre` is set to `false` on the current package so that fence attrs are placed on `<code>`, matching the reference default.",
    "Table extension rules (`rowspan` / `colspan` cells) are not compared because the reference does not implement them.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "attrs",
      referenceExport: "default",
      ourOptions: { fenceAttrsOnPre: false },
      referenceOptions: {},
    },
  ],
  correctness: [
    { name: "heading-id", markdown: "## Hello World {#say-hello-world}" },
    {
      name: "heading-multiple-attrs",
      markdown: "## Hello {#heading .big data-level=2}",
    },
    { name: "inline-image", markdown: "![img](link/to/image.png){.full-width}" },
    { name: "inline-code", markdown: "Text with `inline code`{.code data-lang=js}." },
    { name: "inline-emphasis", markdown: "Text with *emphasis*{.italic} and **bold**{.bold}." },
    {
      name: "inline-link",
      markdown: '[link](https://example.com){.link target=_blank aria-label="example"}',
    },
    {
      name: "block-paragraph",
      markdown:
        'A paragraph with some text. {#p .a .b align=center data-value="content with spaces"}',
    },
    { name: "block-leading", markdown: "{.lead}\nA paragraph with a leading attrs block." },
    { name: "list-item", markdown: "- first item {.first}\n- second item {.second}" },
    {
      name: "nested-list",
      markdown: "- first item {.first}\n  - nested item {.nested}\n- second item",
    },
    {
      name: "table",
      markdown: "| A | B |\n|---|---|\n| 1 | 2 |\n\n{.table border=1}",
    },
    { name: "fence", markdown: "```js {.hl data-lang=javascript}\nconst a = 1;\n```" },
    { name: "fence-info-string", markdown: "```js title=example\nconst a = 1;\n```" },
    { name: "horizontal-rule", markdown: "--- {.horizontal}" },
    { name: "softbreak", markdown: "first line  \n{.break}\nsecond line" },
    { name: "escaped-attrs", markdown: String.raw`A paragraph with escaped \{#not-an-id} attrs.` },
    { name: "empty-attrs", markdown: "A paragraph with empty attrs {}. " },
    { name: "no-attrs", markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b" },
    { name: "multiline-paragraph", markdown: "line one\nline two\nline three {.last}" },
    { name: "blockquote", markdown: "> quoted text {.quote}" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-attrs",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"word {.cls} ".repeat(size)}\n`,
    },
    {
      name: "unmatched-braces",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"{".repeat(size)}text\n`,
    },
    {
      name: "heading-attrs",
      sizes: [64, 128, 256, 512],
      build: (size) =>
        Array.from({ length: size }, (_, index) => `## Heading ${index} {#id-${index} .cls}`).join(
          "\n",
        ),
    },
  ],
});

export default spec;
