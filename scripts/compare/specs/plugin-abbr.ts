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

/** Markdown with a sparse amount of abbreviation syntax, close to a normal document */
const NORMAL_UNIT = `## Web standards

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium
*[API]: Application Programming Interface

The HTML specification is maintained by the W3C, and the API is documented in
the same place. Tools validate HTML documents before they are published.

- Validate the HTML document
- Read the API reference

\`\`\`js
const markup = "<p>HTML</p>";
\`\`\`

Return to the HTML overview when the API changes.

`;

/** Markdown where almost every inline run contains a defined abbreviation */
const HEAVY_UNIT = `*[HTML]: Hyper Text Markup Language
*[CSS]: Cascading Style Sheets
*[JS]: JavaScript
*[DOM]: Document Object Model
*[API]: Application Programming Interface

HTML and CSS are rendered by JS; the DOM exposes an API. *HTML* with **CSS**
and \`JS\` next to the DOM API, then HTML again.

- HTML item with CSS and JS
- DOM item with API and HTML

> HTML quoted text with CSS, JS, DOM and API.

HTML CSS JS DOM API HTML CSS JS DOM API HTML CSS JS DOM API.

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
  plugin: "plugin-abbr",
  reference: "markdown-it-abbr",
  notes: [
    "Neither package takes options; both are installed with their defaults.",
    "The reference rewrites the inline token list with `md.utils.arrayReplaceAt` for every text token that contains an abbreviation, copying the whole token array each time, so a paragraph with inline markup between abbreviations grows quadratically on the reference side. The current package rebuilds the children list in a single pass and stays linear; `interleaved-abbreviations` exposes the difference.",
    "Abbreviations are matched case-sensitively and only at word boundaries, so `HTML` is not replaced inside `HTML5` or `html`.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "abbr",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    {
      name: "definition-and-usage",
      markdown:
        "*[HTML]: Hyper Text Markup Language\n*[W3C]: World Wide Web Consortium\n\nThe HTML specification is maintained by the W3C.\n",
    },
    {
      name: "multiple-definitions",
      markdown:
        "*[HTML]: Hyper Text Markup Language\n*[CSS]: Cascading Style Sheets\n*[JS]: JavaScript\n\nHTML, CSS and JS.\n",
    },
    {
      name: "abbreviation-at-start",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nHTML is a markup language.\n",
    },
    {
      name: "abbreviation-at-end",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nWe write HTML\n",
    },
    {
      name: "boundary-punctuation",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nHTML, HTML. (HTML) HTML! HTML?\n",
    },
    {
      name: "multi-word-abbreviation",
      markdown: "*[multi word]: description\n\nmulti word and multiword\n",
    },
    {
      name: "overlapping-labels",
      markdown: "*[ab]: short\n*[abc]: long\n\nabc ab\n",
    },
    {
      name: "duplicate-definition",
      markdown: "*[ab]: first\n*[ab]: second\n\nab\n",
    },
    {
      name: "case-sensitivity",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nHTML html Html\n",
    },
    {
      name: "inside-emphasis",
      markdown: "*[HTML]: Hyper Text Markup Language\n\n**HTML** and *HTML*\n",
    },
    {
      name: "inside-link",
      markdown: "*[HTML]: Hyper Text Markup Language\n\n[HTML](https://example.com)\n",
    },
    {
      name: "inside-code-ignored",
      markdown: "*[tag]: description\n\n`tag` and **tag**\n",
    },
    {
      name: "definition-in-text-block",
      markdown: "Some text.\n*[x]: definition\nmore x\n",
    },
    {
      name: "definition-after-paragraph",
      markdown: "The HTML spec.\n*[HTML]: Hyper Text Markup Language\n\nThe HTML spec.\n",
    },
    {
      name: "escaped-definition",
      markdown: "\\*[HTML]: Hyper Text Markup Language\n\nHTML\n",
    },
    {
      name: "empty-label",
      markdown: "*[]: empty label\n\nfoo\n",
    },
    {
      name: "empty-title",
      markdown: "*[tag]:\n\nfoo\n",
    },
    {
      name: "escaped-label-brackets",
      markdown: "*[tag\\[x\\]]: escaped bracket\n\n tag[x] \n",
    },
    {
      name: "unicode-label",
      markdown: "*[日本]: Japan\n\n日本\n",
    },
    {
      name: "title-html-escaping",
      markdown: '*[tag]: <b>bold</b> "quoted"\n\ntag\n',
    },
    {
      name: "headings-lists-blockquotes",
      markdown: "*[x]: definition\n\n# Heading x\n\n> quoted x\n\n- list x\n",
    },
    {
      name: "no-abbreviations",
      markdown: "# Plain heading\n\nA plain paragraph with no definitions at all.\n\n- a\n- b\n",
    },
    {
      name: "unclosed-bracket",
      markdown: "*[tag: no closing bracket\n\ntag\n",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "interleaved-abbreviations",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `*[ab]: title\n\n${"ab *x* ".repeat(size)}\n`,
    },
    {
      name: "many-definitions",
      sizes: [128, 256, 512, 1024],
      build: (size) =>
        `${Array.from({ length: size }, (_, index) => `*[T${index}]: title ${index}`).join("\n")}\n\n${"word ".repeat(size)}\n`,
    },
    {
      name: "dense-occurrences",
      sizes: [128, 256, 512, 1024],
      build: (size) => `*[tag]: title\n\n${"tag ".repeat(size)}\n`,
    },
  ],
});

export default spec;
