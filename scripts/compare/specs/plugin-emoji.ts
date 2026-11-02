import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Custom emoji data for the bare variant, which ships no built-in definitions */
const BARE_DEFINITIONS: Record<string, string> = {
  smile: "😄",
  heart: "❤️",
  rocket: "🚀",
  tada: "🎉",
  coffee: "☕",
};

/** Custom shortcuts for the bare variant */
const BARE_SHORTCUTS: Record<string, string[]> = {
  smile: [":)", ":-)"],
  heart: ["<3"],
};

/** Emoji names kept by the `enabled` whitelist of the bare variant */
const BARE_ENABLED = ["smile", "rocket"];

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param repetitions - Number of repetitions
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, repetitions: number): string => unit.repeat(repetitions);

/** Repetitions per corpus size, tuned to roughly 2 KB / 12 KB / 44 KB */
const CORPUS_REPETITIONS = { small: 6, medium: 32, large: 115 } as const;

/** Markdown with a sparse amount of emoji syntax, close to a normal document */
const NORMAL_UNIT = `## Sprint review :sparkles:

The release shipped on time :rocket: and the team celebrated :tada:.

- Fixed a parser edge case :)
- Documented the new options :memo:
- Improved the renderer :zap:

A paragraph of ordinary prose keeps the document realistic: it gives the tokenizer
plenty of plain text to chew on and only a few emoji in between the sentences.

\`\`\`ts
const template = ":smile:";
\`\`\`

> Thanks everyone :heart:

`;

/** Markdown where almost every line is dense with emoji and shortcuts */
const HEAVY_UNIT = `:smile: :heart: :rocket: :tada: :sparkles: :zap: :100: :fire: :star2: :sunny:
:coffee: :cloud: :umbrella: :snowflake: :hourglass: :watch: :star: :gem: :) :D
:smile::heart::rocket::tada::sparkles::zap::fire::star2::sunny::coffee:
:smile: text :heart: text :rocket: text :) text :D text <3 text :zap: text

`;

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, CORPUS_REPETITIONS[size]),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-emoji",
  reference: "markdown-it-emoji",
  notes: [
    'The `bare` preset ships no built-in data, so both sides receive the same custom definitions (the reference option is `defs`, the current one `definitions`), shortcuts and `enabled` whitelist (`enabled: ["smile", "rocket"]`).',
    "`light` data (150 names) and the shortcut table (25 names) are identical on both sides, so every `light` case matches.",
    "`full` data differs: the current package ships 1957 names, markdown-it-emoji 3.1.0 ships 1903. 55 newer names (Unicode 15.1/16.0 additions such as `head_shaking_horizontally`, `phoenix` or `leafless_tree`) exist only in the current data, and the reference-only generated name `u6e80` (🈵, exposed as `no_vacancy` in the current data) is missing from the current data. The two `full` cases covering these names are reported as documented diffs; the `light` and `bare` variants render them as literal text on both sides.",
    "The current package ignores empty or whitespace-only shortcut aliases, while the reference compiles a zero-length alternative that duplicates emojis next to whitespace or punctuation (e.g. `a :smile: b` with an empty `smile` alias becomes `a 😄😄 b`). This is documented behavior of the current package and is not covered by a case, because such an alias changes every shortcut-bearing text token.",
    "Scaling: `dense-emoji-text` and `unmatched-colon-words` are linear baselines. `inline-token-replacements` is superlinear and exposes the replacement loop from markdown-it-emoji#22: every matching text token is rewritten with `arrayReplaceAt`, which copies the whole inline children array, so an inline token with m matching children costs O(m²).",
    "Benchmarks render fixed corpora (`normal` = sparse emoji, `heavy` = dense emoji) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.",
  ],
  variants: [
    {
      id: "bare",
      ourExport: "bareEmoji",
      referenceExport: "bare",
      ourOptions: {
        definitions: BARE_DEFINITIONS,
        shortcuts: BARE_SHORTCUTS,
        enabled: BARE_ENABLED,
      },
      referenceOptions: {
        defs: BARE_DEFINITIONS,
        shortcuts: BARE_SHORTCUTS,
        enabled: BARE_ENABLED,
      },
    },
    {
      id: "light",
      ourExport: "lightEmoji",
      referenceExport: "light",
      ourOptions: {},
      referenceOptions: {},
    },
    {
      id: "full",
      ourExport: "fullEmoji",
      referenceExport: "full",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    {
      name: "no-syntax",
      markdown: "A plain paragraph without any emoji syntax.\n\n- a list item\n- another item",
    },
    { name: "single-emoji", markdown: "Hello world :smile:" },
    { name: "consecutive-emojis", markdown: ":smile::heart::rocket:" },
    {
      name: "emoji-in-sentence",
      markdown: "The :rocket: launch was a :tada: success and the team :heart:s it.",
    },
    { name: "shortcut-smileys", markdown: "Classic :) and :-) and :D and ;)" },
    {
      name: "shortcut-boundaries",
      markdown: "Time 12:30:45, path https://example.com and x:)y stay untouched.",
    },
    { name: "emoji-adjacent-to-text", markdown: "before:smile:after and a:smile:b" },
    { name: "partial-delimiters", markdown: "::smile:: and :smile:: and ::smile:" },
    { name: "unknown-emoji", markdown: "An unknown :not_an_emoji_name: stays literal." },
    {
      name: "multi-line",
      markdown: "line one :smile:\nline two :heart:\nline three :rocket:",
    },
    { name: "heading", markdown: "## Release :rocket: notes" },
    { name: "blockquote", markdown: "> :smile: quoted text" },
    { name: "list", markdown: "- :smile: first\n- :heart: second\n- :rocket: third" },
    {
      name: "table",
      markdown: "| Emoji | Name |\n|---|---|\n| :smile: | smile |\n| :heart: | heart |",
    },
    { name: "code-span", markdown: "Inline code `:smile: :)` must not be replaced." },
    { name: "fenced-code", markdown: "```\n:smile: :)\n```" },
    { name: "indented-code", markdown: "    :smile: :)" },
    { name: "autolink", markdown: "<https://example.com/:smile:>" },
    { name: "link-text", markdown: "[link :smile:](https://example.com)" },
    { name: "link-href", markdown: "[link](https://example.com/:smile:)" },
    { name: "image-alt", markdown: "![alt :smile:](image.png)" },
    { name: "emphasis", markdown: "**:smile:** _:heart:_" },
    { name: "escaped-colon", markdown: String.raw`escaped \:smile: and unescaped :heart:` },
    {
      name: "full-new-emoji-name",
      markdown: ":head_shaking_horizontally:",
      note: "This Unicode 15.1 name exists only in the current `full` data; the reference renders it as literal text. `light` and `bare` render it literally on both sides.",
    },
    {
      name: "full-reference-only-name",
      markdown: ":u6e80:",
      note: "`u6e80` (🈵) only exists in the reference data; the current `full` data names the same character `no_vacancy` and renders `:u6e80:` as literal text. `light` and `bare` render it literally on both sides.",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "dense-emoji-text",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `${":smile: :heart: :rocket: ".repeat(size)}\n`,
    },
    {
      name: "inline-token-replacements",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `${"*x* :smile: ".repeat(size)}\n`,
    },
    {
      name: "unmatched-colon-words",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `${":word ".repeat(size)}\n`,
    },
  ],
});

export default spec;
