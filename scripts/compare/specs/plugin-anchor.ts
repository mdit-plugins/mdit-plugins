import MarkdownIt from "markdown-it";

import type { CompareRenderer, ComparisonSpec, PluginFunction, PluginModule } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Minimal permalink generator signature shared by both packages */
type PermalinkGenerator = (
  slug: string,
  options: unknown,
  state: unknown,
  index: number,
) => unknown;

/** Minimal permalink preset factory signature shared by both packages */
type PermalinkPreset = (options?: Record<string, unknown>) => PermalinkGenerator;

/** Options passed to the permalink presets of both sides */
const PERMALINK_OPTIONS: Record<string, unknown> = { class: "anchor-link", symbol: "¶" };

/**
 * Create a renderer that installs the current package with its exported legacy slugify
 *
 * `legacySlugify` is the equivalent of the reference default slugify, so heading ids become
 * comparable while every other default stays untouched.
 *
 * @param module - Module namespace of the current package
 * @returns A renderer that turns markdown into HTML
 */
const createOurLegacyRenderer = (module: PluginModule): CompareRenderer => {
  const md = new MarkdownIt();

  md.use(module.anchor as PluginFunction, { slugify: module.legacySlugify });

  return (markdown: string): string => md.render(markdown);
};

/**
 * Create a renderer that installs a permalink preset of the current package
 *
 * The current package exports its presets as named exports.
 *
 * @param preset - Preset export name
 * @returns A renderer factory
 */
const createOurPermalinkRenderer =
  (preset: string) =>
  (module: PluginModule): CompareRenderer => {
    const md = new MarkdownIt();
    const presetFactory = module[preset] as PermalinkPreset;

    md.use(module.anchor as PluginFunction, {
      slugify: module.legacySlugify,
      permalink: presetFactory(PERMALINK_OPTIONS),
    });

    return (markdown: string): string => md.render(markdown);
  };

/**
 * Create a renderer that installs a permalink preset of the reference package
 *
 * The reference exposes its presets on the `permalink` property of the default export.
 *
 * @param preset - Preset name under `permalink`
 * @returns A renderer factory
 */
const createReferencePermalinkRenderer =
  (preset: string) =>
  (module: PluginModule): CompareRenderer => {
    const md = new MarkdownIt();
    const anchorPlugin = module.default as PluginFunction & {
      permalink: Record<string, PermalinkPreset>;
    };

    md.use(anchorPlugin, { permalink: anchorPlugin.permalink[preset](PERMALINK_OPTIONS) });

    return (markdown: string): string => md.render(markdown);
  };

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param repetitions - Number of repetitions
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, repetitions: number): string => unit.repeat(repetitions);

/** Repetitions per corpus size, tuned to roughly 1.3 KB / 9 KB / 36 KB */
const NORMAL_REPETITIONS = { small: 4, medium: 28, large: 110 } as const;

/** Repetitions per corpus size, tuned to roughly 2 KB / 11 KB / 42 KB */
const HEAVY_REPETITIONS = { small: 7, medium: 40, large: 150 } as const;

/** Markdown with a sparse amount of headings, close to a normal document */
const NORMAL_UNIT = `## Overview

A realistic paragraph of documentation prose that describes the feature, links to the
[guide](https://example.com/guide) and keeps the inline tokenizer busy.

- first list item
- second list item

\`\`\`ts
const value = 1;
\`\`\`

### Details

Another short section with *emphasis* and \`code\` and a closing sentence.

`;

/** Markdown where headings are dense and often share a slug with an earlier heading */
const HEAVY_UNIT = `## Setup

Install the plugin and configure it.

## Setup

### Configuration

Configure the options.

### Configuration

## Usage

Call the plugin.

## Usage

### Advanced usage

Read the guide.

### Advanced usage

`;

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(
      kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT,
      (kind === "normal" ? NORMAL_REPETITIONS : HEAVY_REPETITIONS)[size],
    ),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-anchor",
  reference: "markdown-it-anchor",
  notes: [
    "The `default` variant uses the defaults of both packages. The current package intentionally ships a different default slugify than the reference legacy percent-encoding slugify: it lowercases ASCII, keeps non-ASCII characters (e.g. CJK), folds whitespace and dashes into a single dash and strips other ASCII punctuation. Headings with punctuation, CJK or raw HTML text therefore produce different ids; those cases carry a `note`. Generated ids are compared byte for byte and are never normalized.",
    "The `legacy-slugify` variant configures the current package with its exported `legacySlugify`, which is byte-identical to the reference default slugify, so every heading id matches.",
    "`link-inside-header` compares the `linkInsideHeader` permalink presets with the same `class` and `symbol` options and a matching slugify. Markup is identical except for the empty-slug placeholder difference.",
    "`header-link` compares the `headerLink` presets. The current preset leaves headings that already contain a link untouched, because wrapping them would emit invalid nested `<a>` elements, while the reference wraps the existing link; that case carries a `note`.",
    'Empty slugs are behavior, not a formatting difference: for headings without text (image-only or empty headings) the reference emits `id=""`, while the current package falls back to its `defaultPlaceHolder` option (`heading`). These cases carry a `note`.',
    "Manual heading ids (e.g. set by plugin-attrs) are not compared: both packages reuse a preset id and both throw on duplicate explicit ids (reference default `failOnNonUnique: true`; the current package has no option to disable the failure).",
    "Scaling: `duplicate-headings` is quadratic in the reference, because its unique-slug loop rescans the used-slug map for every duplicate; the current package resumes from the last used candidate and stays linear. `unique-headings` exposes the leftover `state.tokens.indexOf(token)` call the reference executes for every heading after the permalink step (the O(n²) loop from markdown-it-anchor#80); the current package only rescans when a permalink actually moves the heading token. `heading-inline-content` is the linear baseline.",
    "Benchmarks render fixed corpora (`normal` = sparse headings, `heavy` = heading-dense) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.",
    "Only attribute order is normalized (the harness default); no other normalization is applied.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "anchor",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
    {
      id: "legacy-slugify",
      createOurRenderer: createOurLegacyRenderer,
    },
    {
      id: "link-inside-header",
      createOurRenderer: createOurPermalinkRenderer("linkInsideHeader"),
      createReferenceRenderer: createReferencePermalinkRenderer("linkInsideHeader"),
    },
    {
      id: "header-link",
      createOurRenderer: createOurPermalinkRenderer("headerLink"),
      createReferenceRenderer: createReferencePermalinkRenderer("headerLink"),
    },
  ],
  correctness: [
    {
      name: "no-headings",
      markdown:
        "A plain paragraph without headings.\n\n- a list item\n- another item\n\n```ts\nconst value = 1;\n```",
    },
    { name: "single-heading", markdown: "# Hello World" },
    {
      name: "heading-levels",
      markdown: "# a\n\n## b\n\n### c\n\n#### d\n\n##### e\n\n###### f",
    },
    {
      name: "heading-inline-markup",
      markdown: "## Hello *emphasis* and `code` and **bold**",
    },
    {
      name: "heading-with-link",
      markdown: "## Heading with [link](https://example.com)",
      note: "Our `headerLink` preset leaves this heading untouched; the reference wraps the existing link and emits nested anchors. The `default`, `legacy-slugify` and `link-inside-header` variants match.",
    },
    {
      name: "heading-image-only",
      markdown: "## ![alt](image.png)",
      note: 'No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.',
    },
    {
      name: "heading-empty",
      markdown: "#\n\n##",
      note: 'Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.',
    },
    {
      name: "heading-punctuation",
      markdown: "## Hello, World! How are you?",
      note: "Default slugify policy difference: the reference percent-encodes `,`, `!` and `?`, the current default strips them.",
    },
    {
      name: "heading-cjk",
      markdown: "## 你好 世界",
      note: "Default slugify policy difference: the reference percent-encodes CJK characters, the current default keeps them.",
    },
    {
      name: "heading-only-punctuation",
      markdown: "## !!!",
      note: "The current default strips all punctuation and falls back to `heading`; the reference keeps `!!!` (percent-encoding leaves `!` untouched).",
    },
    {
      name: "heading-html",
      markdown: "## Heading with <em>raw html</em>",
      note: "With `html: false` the angle brackets are text; the reference percent-encodes them and the current default strips them.",
    },
    { name: "heading-tab", markdown: "## Tab\there" },
    { name: "heading-trailing-spaces", markdown: "## Trailing   spaces   " },
    { name: "heading-code-only", markdown: "## `inline_code` only code" },
    {
      name: "duplicate-headings",
      markdown: "## Same title\n\n## Same title\n\n## Same title",
    },
    {
      name: "duplicate-existing-index",
      markdown: "## Test\n\n## Test\n\n## Test 1",
    },
    { name: "multi-word", markdown: "## Multi-word Heading_title 123" },
    {
      name: "setext-headings",
      markdown: "Setext Heading\n===\n\nAnother\n---",
    },
    {
      name: "heading-in-blockquote",
      markdown: "> ## Quoted heading\n>\n> text",
    },
    { name: "heading-in-list", markdown: "- ## List heading" },
    {
      name: "nested-headings",
      markdown: "# Top\n\n> ## Quoted\n>\n> - ### Listed\n\nText after the quote.",
    },
    { name: "not-a-heading", markdown: "#NotAHeading\n\nText with # hash" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "duplicate-headings",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${Array.from({ length: size }, () => "## Same heading").join("\n\n")}\n`,
    },
    {
      name: "unique-headings",
      sizes: [1024, 2048, 4096, 8192],
      build: (size) =>
        `${Array.from({ length: size }, (_, index) => `## Unique heading ${index}`).join("\n\n")}\n`,
    },
    {
      name: "heading-inline-content",
      sizes: [256, 512, 1024, 2048],
      build: (size) =>
        `${Array.from(
          { length: size },
          (_, index) =>
            `## Heading ${index} with *emphasis*, \`code\` and [link](https://example.com/${index})`,
        ).join("\n\n")}\n`,
    },
  ],
});

export default spec;
