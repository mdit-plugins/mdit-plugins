import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Markdown with a sparse amount of spoiler syntax, close to a normal document */
const NORMAL_UNIT = `## Spoiler syntax

The release notes for this version are !!ready to read!! and the migration guide is unchanged.

- !!Faster!! cold start
- Same public API
- Smaller bundle

\`\`\`bash
pnpm add @mdit/plugin-spoiler
\`\`\`

Inline \`!!code!!\` is left untouched, and a plain exclamation mark is fine.

`;

/** Markdown where most inline content is a spoiler, including odd marker runs */
const HEAVY_UNIT = `!!Dense spoiler!! with !!**bold** and *italic*!! content and a !!nested !!inner!! marker!!.
!!!!!odd runs!!!! and !!!leading odd!! plus a trailing odd marker!!!.
- !!First item!! and !!second item!!
> !!Quoted spoiler!! inside a blockquote
Escaped \\!!markers!! and an unmatched !!opener stay readable.

`;

/** Repetitions of the benchmark units, tuned to roughly 1-3 KB, 8-15 KB and 30-50 KB */
const REPETITIONS = {
  normal: { small: 4, medium: 30, large: 102 },
  heavy: { small: 8, medium: 40, large: 140 },
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
  plugin: "plugin-spoiler",
  reference: "markdown-it-spoiler",
  notes: [
    'The current package adds `tabindex="-1"` to the spoiler element by default for keyboard accessibility. The variant sets `attrs` to `[["class", "spoiler"]]` so that the compared markup is the reference\'s `<span class="spoiler">`; the accessibility attribute is an intentional addition and is not part of this comparison.',
    "The reference exposes a `frontPriorMode` option that controls where an odd leftover marker is placed. The current package has no counterpart, so both sides are compared in the reference's default mode (`frontPriorMode: false`); the odd-length marker cases cover that mode.",
    "All correctness cases render identical HTML, so no output normalization beyond the harness default (attribute order) is applied.",
    "Scaling: both implementations consume each marker run once and relocate lone odd markers within a single run of adjacent close tags, so `inline-spoilers`, `unmatched-openers` and `nested-odd-markers` all grow linearly; no superlinear path was found.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "spoiler",
      referenceExport: "default",
      ourOptions: { attrs: [["class", "spoiler"]] },
    },
  ],
  correctness: [
    { name: "basic", markdown: "!!spoiler!!" },
    { name: "inline-sentence", markdown: "VuePress Theme Hope is !!powerful!!." },
    { name: "multiline", markdown: "!!multi\nline spoiler!!" },
    { name: "nested-markup", markdown: "!!**bold** and *italic* and `code`!!" },
    { name: "link-inside", markdown: "!![link](https://example.com)!!" },
    { name: "nested-spoilers", markdown: "!!outer !!inner!! outer!!" },
    { name: "adjacent", markdown: "!!a!! !!b!!" },
    { name: "empty-pair", markdown: "!!!!" },
    { name: "single-marker", markdown: "a ! b" },
    { name: "unclosed", markdown: "!!unclosed" },
    { name: "closing-only", markdown: "unopened!!" },
    { name: "odd-run", markdown: "!!!!!text!!!!" },
    { name: "leading-odd", markdown: "!!!spoiler!!" },
    { name: "trailing-odd", markdown: "!!spoiler!!!" },
    { name: "escaped-open", markdown: String.raw`\!!escaped!!` },
    { name: "escaped-marker", markdown: String.raw`!!a\!b!!` },
    { name: "blockquote", markdown: "> !!quoted!!" },
    { name: "list", markdown: "- !!item one!!\n- !!item two!!" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with an exclamation mark!\n\n- a\n- b",
    },
    { name: "code-fence", markdown: "```md\n!!not a spoiler!!\n```" },
    { name: "inline-code", markdown: "`!!not a spoiler!!`" },
    { name: "punctuation", markdown: "!!a!!, !b! and !!c!!." },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-spoilers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"!!word!! ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"!!word ".repeat(size)}\n`,
    },
    {
      name: "nested-odd-markers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"!!".repeat(size)}a${"!".repeat(2 * size + 1)}\n`,
    },
  ],
});

export default spec;
