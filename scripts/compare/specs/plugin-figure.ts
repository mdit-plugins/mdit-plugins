import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Markdown with a sparse amount of figure syntax, close to a normal document */
const NORMAL_UNIT = `## Photo gallery

A paragraph with a regular image ![thumbnail](img/thumbnail.jpg "Thumbnail") inside text.

![A landscape](img/landscape.jpg "Mountain lake at sunrise")

- list item with a [link](https://example.com)
- another list item

\`\`\`js
const image = "photo.jpg";
\`\`\`

`;

/** Markdown where most paragraphs are standalone images or linked images */
const HEAVY_UNIT = `![Figure one](img/one.png "First caption with *emphasis*")

[![Linked figure](img/two.png "Linked caption")](https://example.com/page)

![Figure three](img/three.png "Third caption")

> ![Quoted figure](img/four.png "Quoted caption")

![Figure five](img/five.png "Fifth caption with \`code\`")

`;

/** Repetitions of the benchmark units, tuned to roughly 1-3 KB, 8-15 KB and 30-50 KB */
const REPETITIONS = {
  normal: { small: 5, medium: 30, large: 130 },
  heavy: { small: 5, medium: 30, large: 125 },
} as const;

/**
 * Build a benchmark corpus from the unit of the requested kind
 *
 * @param kind - Corpus kind
 * @param size - Corpus size
 * @returns Markdown of the requested size
 */
const buildCorpus = (kind: "normal" | "heavy", size: "small" | "medium" | "large"): string =>
  (kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT).repeat(REPETITIONS[kind][size]);

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind, size),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-figure",
  reference: "markdown-it-image-figures",
  notes: [
    '`focusable` is disabled because the current package adds `tabindex="0"` to the image, while the reference `tabindex` option numbers figures from `1`; the reference option is therefore not used.',
    'The current package derives `<figcaption>` from the image `title` and falls back to the `alt` text; `markdown-it-image-figures` has no fallback mode, so `figcaption: "title"` is compared and alt-only images are documented as a difference.',
    "The current package skips hidden paragraphs (tight list items) so that a `<figcaption>` is never emitted without its `<figure>` wrapper; the reference converts images in tight list items without a `<figure>` wrapper. Documented in `tight-list-image`.",
    "`moveAttrs` is not compared: for `true` the current package copies non-native image attributes to `<figure>` and keeps them on the image, for a pattern list it moves them (the image loses them), and it merges `class`/`style` values. The reference `copyAttrs` copies every matching attribute to `<figure>` and keeps the original order on the image, which is not equivalent.",
    "Reference-only options (`dataType`, `link`, `tabindex`, `lazy`, `async`, `classes`, `removeSrc`) have no equivalent and are not compared.",
    "Scaling: the reference core rule walks the token stream once and calls `md.parseInline` once per caption, so the work is linear in the document size and caption length; all three series measure ~1 (no superlinear behavior was found in the upstream implementation).",
    "Attribute order is normalized.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "figure",
      referenceExport: "default",
      ourOptions: { focusable: false },
      referenceOptions: { figcaption: "title" },
    },
  ],
  correctness: [
    { name: "figure-title", markdown: '![Alt](image.png "Caption")' },
    {
      name: "figure-title-with-markup",
      markdown: '![Alt](image.png "*emph*, **strong** and `code`")',
    },
    {
      name: "figure-title-with-html",
      markdown: '![Alt](image.png "a < b & c")',
    },
    {
      name: "figure-title-with-quotes",
      markdown: String.raw`![Alt](image.png "A \"quoted\" title")`,
    },
    {
      name: "figure-alt-only",
      markdown: "![Alt text](image.png)",
      note: 'The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.',
    },
    { name: "figure-empty-alt", markdown: "![](image.png)" },
    {
      name: "linked-image",
      markdown: '[![Alt](image.png "Caption")](https://example.com)',
    },
    {
      name: "linked-image-alt-only",
      markdown: "[![Alt text](image.png)](https://example.com)",
      note: 'The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.',
    },
    { name: "inline-image", markdown: "Text with ![img](a.png) in the middle." },
    {
      name: "tight-list-image",
      markdown: '- ![Alt](image.png "Caption")',
      note: "The current package skips images inside hidden (tight list) paragraphs, so the paragraph is untouched; the reference converts it and emits a `<figcaption>` without a `<figure>` wrapper.",
    },
    {
      name: "loose-list-image",
      markdown: '- ![Alt](image.png "Caption")\n\n- second item',
    },
    { name: "blockquote-image", markdown: '> ![Alt](image.png "Caption")' },
    { name: "table-image", markdown: '| A |\n|---|\n| ![Alt](image.png "Caption") |' },
    { name: "heading-image", markdown: '# ![Alt](image.png "Caption")' },
    {
      name: "reference-image",
      markdown: '![Alt][ref]\n\n[ref]: image.png "Caption"',
    },
    {
      name: "multiple-figures",
      markdown: '![One](1.png "First")\n\n![Two](2.png "Second")',
    },
    { name: "two-images-inline", markdown: '![a](1.png) ![b](2.png "T")' },
    { name: "escaped-image", markdown: String.raw`\![Alt](image.png "Caption")` },
    { name: "code-fence-image", markdown: '```\n![Alt](image.png "Caption")\n```' },
    { name: "empty-input", markdown: "\n" },
    { name: "no-figure-syntax", markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-figures",
      sizes: [64, 128, 256, 512],
      build: (size) => '![Alt](image.png "Caption")\n\n'.repeat(size),
    },
    {
      name: "long-captions",
      sizes: [64, 128, 256, 512],
      build: (size) =>
        `${Array.from({ length: size }, (_, index) => `![Alt](image${index}.png "${"caption text ".repeat(8)}")`).join("\n\n")}\n`,
    },
    {
      name: "linked-figures",
      sizes: [64, 128, 256, 512],
      build: (size) => '[![Alt](image.png "Caption")](https://example.com/)\n\n'.repeat(size),
    },
  ],
});

export default spec;
