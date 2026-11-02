import { composeNormalizers, replaceMatches, sortAttributes } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Whitespace after a tag and before a block-level start or end tag
 *
 * The reference renders its alert wrapper and title without newlines, while the current package
 * uses markdown-it's default block renderer. Whitespace between block-level tags is not
 * significant, so it is removed before comparing; whitespace inside text nodes is kept.
 */
const BLOCK_TAG_WHITESPACE_RE =
  /(?<prefix>>)\s+(?=<\/?(?:blockquote|div|h[1-6]|hr|li|ol|p|pre|table|ul)\b)/gu;

/** Markdown with a sparse amount of alert syntax, close to a normal document */
const NORMAL_UNIT = `## Alerts

> [!note]
> The upgrade guide has the details for this release.

A paragraph after the alert that keeps the document realistic, with a [link](https://example.com) and \`inline code\`.

- first list item
- second list item

\`\`\`bash
pnpm add @mdit/plugin-alert
\`\`\`

`;

/** Markdown where most blocks are alerts, covering all five types and nested placement */
const HEAVY_UNIT = `> [!note]
> **Note** content with a [link](https://example.com).

> [!tip]
> A tip with \`inline code\`.

> [!important]
> Important content.

> [!warning]
> Warning content with a list:
>
> - first item
> - second item

> [!caution]
> Caution content.

- > [!tip]
  > Alert inside a list item.

> [!warning]
> First paragraph.
>
> Second paragraph.

`;

/** Repetitions of the benchmark units, tuned to roughly 1-3 KB, 8-15 KB and 30-50 KB */
const REPETITIONS = {
  normal: { small: 5, medium: 35, large: 110 },
  heavy: { small: 5, medium: 25, large: 95 },
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
  plugin: "plugin-alert",
  reference: "markdown-it-github-alerts",
  notes: [
    "`deep: true` is enabled on the current package because the reference transforms every outermost blockquote after block parsing and therefore recognizes alerts at any nesting depth; the comparison covers nested blockquotes and alerts inside list items.",
    "The reference's default GitHub SVG icons are disabled with `icons: {}` because the current package has no icon option. This is a documented default-markup difference, not a normalization: with default options the reference title contains an inline `<svg>`, while the current title contains only text.",
    "Whitespace between block-level tags is normalized because the reference renders its opening `<div>` and title `<p>` without newlines while the current package uses markdown-it's default block renderer; attribute order is normalized by the shared normalizer as well. Text content and code whitespace are preserved.",
    "The reference removes the marker from the first inline token and keeps the surrounding blockquote content. An alert whose first content line is empty therefore leaves an empty `<p></p>`, and a nested blockquote is hoisted into the alert. The current package consumes the marker line before parsing the body, so those structural differences remain visible in the `list-body`, `nested-blockquote`, `empty-quoted-body` and `nested-alert` cases.",
    "Parse-level differences are documented rather than normalized: the reference supports a custom title from trailing text (`> [!note] Title`), accepts a marker without any body, treats `\\[!note]` as an alert, and finds a marker in the first inline token even after another block such as `<hr>`. The current package requires the marker line to contain only the marker, requires body content, and honors the escaped bracket. See the matching diff cases.",
    "Default title casing differs: the reference lowercases the marker before capitalizing it (`[!TIP]` → `Tip`), while the current package capitalizes the written name and preserves its casing (`[!TIP]` → `TIP`).",
    "Both sides use the same five case-insensitive alert names and the default `markdown-alert` class prefix. The reference's `classPrefix` / `titles` options and the current package's `openRenderer` / `closeRenderer` / `titleRenderer` hooks have no counterpart on the other side and are left at their defaults.",
    "Scaling: the reference scans a blockquote's token range once per outermost blockquote and the current package scans each alert body once, so `alert-rows`, `long-alert-body` and `nested-alerts` all grow linearly; no superlinear path was found.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "alert",
      referenceExport: "default",
      ourOptions: { deep: true },
      referenceOptions: {
        icons: {},
        matchCaseSensitive: false,
      },
    },
  ],
  correctness: [
    { name: "note", markdown: "> [!note]\n> Some text" },
    { name: "tip", markdown: "> [!tip]\n> Some tip" },
    { name: "important", markdown: "> [!important]\n> Important" },
    { name: "warning", markdown: "> [!warning]\n> Warning\n> second line" },
    { name: "caution", markdown: "> [!caution]\n> Caution" },
    { name: "mixed-case", markdown: "> [!Note]\n> body" },
    {
      name: "uppercase",
      markdown: "> [!TIP]\n> body",
      note: "The reference lowercases the alert name before capitalizing the default title, so `[!TIP]` renders `Tip`; the current package preserves the written casing and renders `TIP`.",
    },
    { name: "unknown-type", markdown: "> [!danger]\n> body" },
    { name: "multiline-body", markdown: "> [!warning]\n> first line\n> second line" },
    {
      name: "inline-markup",
      markdown: "> [!note]\n> **bold** and [link](https://example.com)",
    },
    {
      name: "list-body",
      markdown: "> [!note]\n> - a\n> - b",
      note: "The reference keeps the marker line's empty paragraph and emits `<p></p>` before the list; the current package consumes the marker line and starts the body with the list.",
    },
    {
      name: "nested-blockquote",
      markdown: "> [!note]\n> > nested quote",
      note: "The reference keeps an empty `<p></p>` for the marker line and closes the hoisted alert `<div>` before the nested `</blockquote>`; the current package keeps the nested blockquote inside the alert with balanced tags.",
    },
    {
      name: "nested-alert",
      markdown: "> > [!note]\n> > nested alert",
      note: "The reference transforms the outermost blockquote because its first inline token starts with the marker, leaving the inner blockquote inside the alert; the current package (`deep: true`) transforms the inner blockquote and keeps the outer quote.",
    },
    { name: "inside-list", markdown: "- > [!note]\n  > in list" },
    { name: "multiple-alerts", markdown: "> [!note]\n> first\n\n> [!tip]\n> second" },
    {
      name: "empty-body",
      markdown: "> [!note]",
      note: "The reference accepts a marker with no body and renders an empty alert; the current package requires at least one body line, so the marker stays a literal blockquote.",
    },
    {
      name: "empty-quoted-body",
      markdown: "> [!note]\n>\n> body",
      note: "The reference keeps an empty paragraph for the empty quoted line before the body; the current package consumes the marker line and emits only the body paragraph.",
    },
    {
      name: "custom-title",
      markdown: "> [!note] Custom title\n> body",
      note: "The reference treats trailing text after the marker as a custom title; the current package rejects the marker when anything but spaces follows `]`, so it stays a literal blockquote.",
    },
    { name: "trailing-spaces", markdown: "> [!note]   \n> body" },
    {
      name: "escaped-bracket",
      markdown: "> \\[!note]\n> body",
      note: "The reference's regex accepts an optional backslash before `[`, so `\\[!note]` is still parsed as an alert; the current package treats the escaped bracket as literal text, as documented.",
    },
    { name: "escaped-bang", markdown: "> [\\!note]\n> body" },
    { name: "unterminated-marker", markdown: "> [!note\n> body" },
    {
      name: "hr-before-marker",
      markdown: "> ***\n> [!note]\n> body",
      note: "The reference searches the first inline token of the blockquote and therefore finds the marker after an `<hr>`; the current package only accepts the marker on the first line of the blockquote.",
    },
    {
      name: "indented-marker",
      markdown: ">    [!note]\n> body",
    },
    {
      name: "no-alert-syntax",
      markdown: "# Plain heading\n\nA plain paragraph.\n\n> a plain quote\n\n- a\n- b",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "alert-rows",
      sizes: [250, 500, 1000, 2000],
      build: (size) => "> [!note]\n> body\n\n".repeat(size),
    },
    {
      name: "long-alert-body",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `> [!note]\n${"> line\n".repeat(size)}`,
    },
    {
      name: "nested-alerts",
      sizes: [250, 500, 1000, 2000],
      build: (size) => "> > [!warning]\n> > body\n\n".repeat(size),
    },
  ],
  normalize: composeNormalizers(sortAttributes, (html) =>
    replaceMatches(html, BLOCK_TAG_WHITESPACE_RE, "$<prefix>"),
  ),
});

export default spec;
