import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Markdown with a sparse amount of image size syntax, close to a normal document */
const NORMAL_UNIT = `## Images

A paragraph with a sized image ![logo](img/logo.png "Logo" =200x200) using the legacy syntax.

Another paragraph without any size syntax.

- a list item
- another item

`;

/** Markdown where most images carry a legacy size specification */
const HEAVY_UNIT = `![one](img/one.png "One" =100x100)
![two](img/two.png =200x)
![three](img/three.png =x300)
![four](img/four.png "Four" =50%x200)
![five](img/five.png =0x0)

`;

/** Repetitions of the benchmark units, tuned to roughly 1-3 KB, 8-15 KB and 30-50 KB */
const REPETITIONS = {
  normal: { small: 6, medium: 50, large: 190 },
  heavy: { small: 7, medium: 55, large: 200 },
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
  plugin: "plugin-img-size",
  reference: "markdown-it-imsize",
  notes: [
    "Only the deprecated `legacyImgSize` variant is compared: `imgSize` (`![alt =100x200](url)`) and `obsidianImgSize` (`![alt|100x200](url)`) are extensions of this package with no equivalent in `markdown-it-imsize`.",
    "The current package treats a dimension whose numeric value is `0` as unspecified and rejects a size whose width and height are both `0`; the reference emits the literal `0`. `zero-width`, `zero-height`, `zero-both` and `zero-percent-width` document this.",
    "The current package accepts a single trailing `%` per dimension (the documented syntax); the reference's number scanner accepts `%` anywhere, so `=5%0x3%0` is parsed by the reference only. Documented in `percent-in-middle`.",
    "The current package accepts any whitespace before the size specification, while the reference requires a literal space (its check is `charCodeAt(pos - 1) === 0x20`); `tab-before-size` is therefore parsed by the current package only.",
    "The reference `autofill` option is not compared: it reads image files from disk (`image-size`) and its output depends on the filesystem.",
    "Scaling: the reference image rule re-attempts `parseLinkLabel` for every `![` opener and parses every label again; malformed sizes fall back to the core image rule. markdown-it caches `skipToken` positions, so all series stay ~linear (no superlinear behavior was found in the upstream implementation).",
    "Attribute order is normalized.",
  ],
  variants: [
    {
      id: "legacy",
      ourExport: "legacyImgSize",
      referenceExport: "default",
    },
  ],
  correctness: [
    { name: "width-and-height", markdown: "![Alt](image.png =100x200)" },
    { name: "width-only", markdown: "![Alt](image.png =100x)" },
    { name: "height-only", markdown: "![Alt](image.png =x200)" },
    { name: "title-and-size", markdown: '![Alt](image.png "Title" =100x200)' },
    { name: "percent-width", markdown: "![Alt](image.png =50%x300)" },
    { name: "percent-height", markdown: "![Alt](image.png =100x50%)" },
    {
      name: "zero-width",
      markdown: "![Alt](image.png =0x200)",
      note: 'The current package drops a `0` width (treated as unspecified), the reference emits `width="0"`.',
    },
    {
      name: "zero-height",
      markdown: "![Alt](image.png =100x0)",
      note: 'The current package drops a `0` height (treated as unspecified), the reference emits `height="0"`.',
    },
    {
      name: "zero-both",
      markdown: "![Alt](image.png =0x0)",
      note: 'The current package rejects an all-zero size and leaves the markdown unparsed as an image, the reference renders the image with `width="0" height="0"`.',
    },
    {
      name: "zero-percent-width",
      markdown: "![Alt](image.png =0%x200)",
      note: 'The current package treats `0%` as an unspecified width, the reference emits `width="0%"`.',
    },
    {
      name: "percent-in-middle",
      markdown: "![Alt](image.png =5%0x3%0)",
      note: "The reference number scanner accepts `%` anywhere in a dimension, while the current package only accepts one trailing `%`.",
    },
    {
      name: "tab-before-size",
      markdown: "![Alt](image.png\t=100x200)",
      note: "The current package accepts a tab before the size, the reference only accepts a literal space.",
    },
    { name: "no-size", markdown: "![Alt](image.png)" },
    { name: "malformed-size", markdown: "![Alt](image.png =100)" },
    { name: "malformed-trailing-x", markdown: "![Alt](image.png =x100x200)" },
    {
      name: "no-space-before-size",
      markdown: "![Alt](image.png=100x200)",
    },
    {
      name: "reference-image",
      markdown: '![Alt][ref]\n\n[ref]: image.png "Title"',
    },
    {
      name: "inline-image",
      markdown: "Text ![Alt](image.png =100x200) here",
    },
    {
      name: "multiple-images",
      markdown: "![a](1.png =10x20) ![b](2.png =30x)",
    },
    {
      name: "size-before-title",
      markdown: '![Alt](image.png =100x200 "Title")',
    },
    {
      name: "newline-before-size",
      markdown: "![Alt](image.png\n=100x200)",
    },
    {
      name: "leading-space-in-destination",
      markdown: "![Alt]( image.png =100x200)",
    },
    { name: "escaped-image", markdown: String.raw`\![Alt](image.png =100x200)` },
    { name: "empty-input", markdown: "\n" },
    {
      name: "no-size-syntax",
      markdown: "# Title\n\nParagraph with [link](https://example.com) and ![image](a.png).",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "sized-images",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"![Alt](image.png =100x200) ".repeat(size)}\n`,
    },
    {
      name: "malformed-sizes",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"![Alt](image.png =100) ".repeat(size)}\n`,
    },
    {
      name: "unmatched-labels",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"![a ".repeat(size)}\n`,
    },
  ],
});

export default spec;
