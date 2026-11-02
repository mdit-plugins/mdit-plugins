import { composeNormalizers, removeMatches, replaceMatches, sortAttributes } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Markdown with a sparse amount of task list syntax, close to a normal document */
const NORMAL_UNIT = `## Checklist

A normal paragraph with some text that does not contain task syntax.

- a regular list item
- [ ] one task item
- another regular item

\`\`\`bash
npm install
\`\`\`

`;

/** Markdown where most list items are task items */
const HEAVY_UNIT = `- [ ] Plan the release
- [x] Write the changelog
- [X] Review pull requests
  - [ ] Nested unchecked task
  - [x] Nested checked task
- [ ] Long task item with **bold**, \`code\` and a [link](https://example.com)

`;

/** Repetitions of the benchmark units, tuned to roughly 1-3 KB, 8-15 KB and 30-50 KB */
const REPETITIONS = {
  normal: { small: 7, medium: 50, large: 200 },
  heavy: { small: 7, medium: 40, large: 180 },
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

/**
 * Normalize the task list markup so that the remaining comparison covers behavior
 *
 * Both packages label the item text: the current package nests the checkbox inside `<label
 * class="task-list-item-label">` (no document-scoped id), while the reference places the `<input>`
 * before `<label for="cbx_N">`. Label tags and the generated `cbx_*` ids are therefore removed on
 * both sides, and the empty checkbox class plus the boolean attribute spelling (`checked="checked"`
 * vs `checked="true"`) are canonicalized.
 *
 * @param html - Rendered HTML
 * @returns Normalized HTML
 */
const normalizeTaskListHtml = composeNormalizers(
  (html) => removeMatches(html, /<label[^>]*>|<\/label>/gu),
  (html) => removeMatches(html, / (?:id|for)="cbx_[^"]*"/gu),
  (html) => removeMatches(html, / class=""/gu),
  (html) =>
    replaceMatches(
      html,
      / (?<attribute>checked|disabled)="(?:checked|disabled|true)"/gu,
      " $<attribute>",
    ),
  sortAttributes,
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-tasklist",
  reference: "markdown-it-task-checkbox",
  notes: [
    "`ulClass` / `liClass` are mapped to `containerClass` / `itemClass` with the reference defaults (`task-list` / `task-list-item`); `divWrap` stays `false` and `disabled` stays `true` on the reference side.",
    'Both packages label the item text, but the structure differs by design: the current package nests the checkbox inside `<label class="task-list-item-label">` and emits no ids, while the reference emits `<input id="cbx_N"><label for="cbx_N">`. Normalization unwraps the label tags and removes the generated `cbx_*` ids, so the compared part is the list structure, container/item classes, checkbox state and item text.',
    "`checkboxClass` is set to an empty string because the reference emits no class on the checkbox; the resulting empty `class` attribute is normalized away. The current package's extra `labelClass` is not observable after the label tags are normalized.",
    '`checked="checked"` / `disabled="disabled"` and the reference `checked="true"` / `disabled="true"` are equivalent boolean attributes; the normalizer canonicalizes them to the bare attribute.',
    "Scaling: both packages locate the parent list token with a backward scan through the token stream for every task item, which is quadratic in the number of items in one list; `many-task-items` exposes this for both sides (exponent ~1.6).",
    "Attribute order is normalized.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "tasklist",
      referenceExport: "default",
      ourOptions: {
        containerClass: "task-list",
        itemClass: "task-list-item",
        checkboxClass: "",
      },
      referenceOptions: {
        ulClass: "task-list",
        liClass: "task-list-item",
      },
    },
  ],
  correctness: [
    { name: "unchecked-item", markdown: "- [ ] task 1" },
    { name: "checked-item-lowercase", markdown: "- [x] task 1" },
    { name: "checked-item-uppercase", markdown: "- [X] task 1" },
    {
      name: "mixed-items",
      markdown: "- [ ] one\n- [x] two\n- [X] three",
    },
    { name: "ordered-list", markdown: "1. [ ] one\n2. [x] two" },
    {
      name: "nested-list",
      markdown: "- [ ] one\n  - [x] two\n- [x] three",
    },
    { name: "non-task-list", markdown: "- one\n- two" },
    { name: "marker-in-paragraph", markdown: "[ ] not a task" },
    { name: "missing-space-after-marker", markdown: "- [x]no space" },
    { name: "empty-item", markdown: "- [ ]" },
    { name: "non-breaking-space", markdown: "- [x]\u00A0text" },
    { name: "code-fence", markdown: "```\n- [ ] code\n```" },
    { name: "blockquote-list", markdown: "> - [ ] quoted" },
    {
      name: "inline-markup",
      markdown: "- [x] **bold** and `code`",
    },
    { name: "plus-bullet", markdown: "+ [ ] plus\n+ [x] plus 2" },
    {
      name: "multiple-lists",
      markdown: "- [ ] a\n- [x] b\n\n- [ ] c\n\n- [x] d",
    },
    { name: "link-inside-item", markdown: "- [x] [link](https://example.com)" },
    {
      name: "loose-item",
      markdown: "- [x] first\n\n  second paragraph",
    },
    {
      name: "marker-as-link-reference",
      markdown: "- [x] [x]\n\n[x]: https://example.com",
      note: "The marker also resolves as a link reference: the current package removes the three parsed marker tokens, while the reference only strips the first text token, leaving the link markup inside the item.",
    },
    { name: "empty-input", markdown: "\n" },
    { name: "no-list-syntax", markdown: "# Title\n\nParagraph.\n\n> quote" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-task-items",
      sizes: [512, 1024, 2048, 4096],
      targetMs: 40,
      build: (size) => "- [x] item\n".repeat(size),
    },
    {
      name: "long-task-items",
      sizes: [64, 128, 256, 512],
      build: (size) => `- [x] ${"word ".repeat(60)}\n`.repeat(size),
    },
    {
      name: "many-lists",
      sizes: [64, 128, 256, 512],
      build: (size) => "- [x] item\n\n".repeat(size),
    },
  ],
  normalize: normalizeTaskListHtml,
});

export default spec;
