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

/**
 * Markdown with a sparse amount of ruby syntax, close to a normal document
 *
 * Both documented divider styles are present so that each side parses its own syntax while the
 * other one only scans over it, which keeps the two sides' workloads comparable.
 */
const NORMAL_UNIT = `## Ruby annotations

The word {漢字|かんじ} is annotated with ruby text, and {中国:zhōng} uses the
divider documented by this package.

A paragraph with plain text and a single {東京:とうきょう} annotation.

- list item with {日本:にほん}
- list item with {日本|にほん}
- list item without annotation

`;

/** Markdown where most inline runs contain ruby syntax */
const HEAVY_UNIT = `{漢字:かんじ} {中国:ちゅうごく} {東京:とうきょう} {日本:にほん} {大阪:おおさか}
{漢字|かんじ} {中国|ちゅうごく} {東京|とうきょう} {日本|にほん} {大阪|おおさか}

{東京:とうきょう}の{駅:えき}と{日本|にほん}の{首都|しゅと}です。
{東京|とうきょう}の{駅|えき}と{日本:にほん}の{首都:しゅと}です。

**{強調:きょうちょう}** and *{強調|きょうちょう}* and \`{コード:こーど}\`.

- {項目:こうもく} item
- {項目|こうもく} item

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
  plugin: "plugin-ruby",
  reference: "markdown-it-ruby",
  notes: [
    "The current package and the installed reference use different dividers: this package implements `{ruby base:ruby text}` (the upstream syntax that the fork was based on), while the installed `markdown-it-ruby@1.1.2` implements DenDenMarkdown's `{ruby base|ruby text}`. This is a real behavioral difference, not a normalization, so every case that renders ruby on one side renders plain text on the other and carries a `note`.",
    "The reference has an `rp` option (`[open, close]`). This package does not implement it, so the reference is left at its default `rp: []`, which renders no `<rp>` elements and matches the current package's output shape.",
    "The reference renders empty rubies such as `{ab:|}` (base `ab:`, empty `<rt></rt>`) because it only splits on `|`; this package rejects empty `|`-separated segments and empty ruby text, which is covered by `empty-ruby-segment`.",
    "Because the syntax differs, every benchmark corpus mixes both divider styles: each side parses its own syntax and only scans over the other side's lines. Throughput ratios therefore compare equivalent mixtures, not identical parse work.",
    "Both implementations scan forward to the end of the line when an opening `{` has no valid divider/close in that line; `unmatched-openers` exposes that quadratic path for both, `dense-documented-syntax` is linear for this package but quadratic for the reference, and `upstream-syntax` is the mirror image.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "ruby",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    {
      name: "documented-syntax",
      markdown: "{中国:zhōng|guó}",
      note: "The reference splits on `|`, not on `:`: it renders `中国:zhōng` as the base text with `guó` as ruby text, while this package splits the base per character and pairs `中`/`zhōng` and `国`/`guó`.",
    },
    {
      name: "upstream-syntax",
      markdown: "{漢字|かんじ}",
      note: "This package does not recognize the upstream `|` divider, so it leaves the construct as plain text; the reference renders it as ruby.",
    },
    {
      name: "simple-ruby",
      markdown: "{ruby base:ruby text}",
      note: "Same divider difference: this package renders ruby, the reference leaves the text untouched.",
    },
    {
      name: "equal-length-pairs",
      markdown: "{鬼門:き|もん}",
      note: "Divider difference: this package splits per character into two `<rt>` pairs, while the reference does not recognize `:` as the divider.",
    },
    {
      name: "wrapped-in-strong",
      markdown: "**{ruby base:ruby text}**",
      note: "Divider difference inside emphasis; both sides keep the surrounding `**` markup.",
    },
    {
      name: "inline-markup-inside-ruby",
      markdown: "{**ruby base**:ruby text}",
      note: "Divider difference: this package parses inline markup inside the base text, the reference leaves the whole construct as text with the emphasis parsed normally.",
    },
    {
      name: "inline-markup-in-ruby-text",
      markdown: "{ruby base:**ruby text**}",
      note: "Divider difference: this package parses inline markup inside the ruby text, the reference leaves the construct as text.",
    },
    {
      name: "empty-ruby-segment",
      markdown: "{ab:|b}",
      note: "This package rejects empty `|`-separated segments and leaves the source as text; the reference sees no `:` divider, treats `ab:` as base text and renders an empty `<rt></rt>`.",
    },
    {
      name: "extra-colon",
      markdown: "{a:b:c}",
      note: "This package keeps everything after the first `:` as ruby text; the reference does not recognize `:` and leaves the source as text.",
    },
    {
      name: "escaped-backslash",
      markdown: String.raw`{a\\:b}`,
      note: "This package treats `\\\\` as an escaped backslash and the following `:` as the divider; the reference does not parse `:` at all.",
    },
    {
      name: "in-table-cell",
      markdown: "| a | b |\n| - | - |\n| {中:zhōng} | x |\n",
      note: "Divider difference: this package renders ruby inside the table cell, the reference keeps the source text.",
    },
    {
      name: "no-ruby-syntax",
      markdown: "# Plain heading\n\nLore ipsum dolor sit amet.\n\n- a\n- b\n",
    },
    {
      name: "escaped-opening",
      markdown: String.raw`\{ruby base:ruby text}`,
    },
    {
      name: "escaped-divider",
      markdown: String.raw`{ruby base\:ruby text}`,
    },
    {
      name: "escaped-closing",
      markdown: String.raw`{ruby base:ruby text\}`,
    },
    { name: "empty-ruby-text", markdown: "{abc:}" },
    { name: "empty-braces", markdown: "{}" },
    { name: "colon-only", markdown: "{:}" },
    { name: "empty-base", markdown: "{:a}" },
    { name: "unclosed", markdown: "{abc:def" },
    {
      name: "plain-colons",
      markdown: "A paragraph with a time 12:30 and a ratio 3:4.\n",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "unmatched-openers",
      sizes: [256, 512, 1024, 2048],
      build: (size) => `${"{".repeat(size)}x\n`,
    },
    {
      name: "dense-documented-syntax",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"{a:b} ".repeat(size)}\n`,
    },
    {
      name: "upstream-syntax",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"{a|b} ".repeat(size)}\n`,
    },
  ],
});

export default spec;
