import MarkdownIt from "markdown-it";

import { resolvePlugin } from "../loader.ts";
import { composeNormalizers, normalizeHtml, replaceMatches } from "../normalize.ts";
import type { CompareRenderer, ComparisonSpec, PluginModule } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Default alt text of the current package, replaced before comparing */
const CURRENT_DEFAULT_ALT = "PlantUML Diagram";

/** Default alt text of the reference package, used as the canonical value */
const REFERENCE_DEFAULT_ALT = "uml diagram";

/** Pattern matching the alt attribute that holds the current package's default alt text */
const CURRENT_DEFAULT_ALT_PATTERN = new RegExp(`alt="${CURRENT_DEFAULT_ALT}"`, "gu");

/**
 * Create a renderer for the current package that renders the diagram source as the image `src`
 *
 * The default `srcGetter` deflates and base64-encodes the diagram for a PlantUML server. The
 * reference package uses a different encoder, so the two encoded URLs are not byte-comparable;
 * returning the source unchanged keeps the rendered `<img>` deterministic and exposes the diagram
 * source in the `src` attribute. Rendering never contacts a PlantUML server.
 *
 * @param module - Loaded plugin module
 * @returns A renderer that turns markdown into HTML
 */
const createOurRenderer = (module: PluginModule): CompareRenderer => {
  const plugin = resolvePlugin(module, "plantuml");
  const md = new MarkdownIt();

  md.use(plugin, {
    srcGetter: (content: string): string => content,
  });

  return (markdown) => md.render(markdown);
};

/**
 * Create a renderer for the reference package that renders the diagram code as the image `src`
 *
 * `generateSource` is the reference counterpart of `srcGetter`: it replaces the deflate + base64
 * server URL with the raw diagram code. Rendering never contacts a PlantUML server.
 *
 * @param module - Loaded plugin module
 * @returns A renderer that turns markdown into HTML
 */
const createReferenceRenderer = (module: PluginModule): CompareRenderer => {
  const plugin = resolvePlugin(module);
  const md = new MarkdownIt();

  md.use(plugin, {
    generateSource: (umlCode: string): string => umlCode,
  });

  return (markdown) => md.render(markdown);
};

/**
 * Normalize the rendered HTML of both sides
 *
 * An untitled diagram gets a different default alt text from each package (`PlantUML Diagram` vs
 * `uml diagram`). Both are arbitrary wording choices for the same fallback, so the current wording
 * is rewritten to the reference one. Explicit titles are not normalized: the two packages trim and
 * inline-parse them differently, and those differences stay visible. Attribute order is normalized
 * because it is not meaningful in HTML.
 *
 * @param html - Rendered HTML
 * @returns Normalized HTML
 */
const normalizePlantumlHtml = composeNormalizers(
  (html) => replaceMatches(html, CURRENT_DEFAULT_ALT_PATTERN, `alt="${REFERENCE_DEFAULT_ALT}"`),
  normalizeHtml,
);

/** Markdown with a sparse amount of diagram syntax, close to a normal document */
const NORMAL_UNIT = `## Release checklist

The deploy pipeline finished after the review and the team wrote a short summary of the changes.

@startuml
Alice -> Bob : deploy
Bob -> Alice : done
@enduml

- verify the health check
- watch the error budget

A closing paragraph keeps the document realistic and gives the parser enough prose between diagrams.

`;

/** Markdown where most blocks are diagrams */
const HEAVY_UNIT = `@startuml
Alice -> Bob : hello
Bob -> Carol : forward
note right: handled
@enduml

@startuml
Client -> Server : request
Server -> Client : response
@enduml

@startuml
A -> B
B -> C
C -> A
@enduml

@startuml
start
:collect input;
stop
@enduml

`;

/** Repetitions per corpus size, tuned to roughly 2 KB / 7 KB / 20 KB */
const CORPUS_REPETITIONS = { small: 3, medium: 12, large: 36 } as const;

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param size - Corpus size
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, size: "small" | "medium" | "large"): string =>
  unit.repeat(CORPUS_REPETITIONS[size]);

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, size),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-plantuml",
  reference: "markdown-it-plantuml",
  normalize: normalizePlantumlHtml,
  notes: [
    "Both packages parse `@startuml` … `@enduml` blocks and render an `<img>` whose `src` points at a PlantUML server. The current package compresses with its platform deflate implementation (Node: `node:zlib`, browser: pako) and its own base64 variant, while the reference package ships its own deflate implementation, so the encoded URLs are not byte-comparable by design. The source generators are replaced through the documented hooks: `srcGetter` returns the token content on the current side and `generateSource` returns the diagram code on the reference side. The compared `src` is therefore the decoded diagram source (the text that would be compressed into the URL), not the encoded URL. No PlantUML server is contacted and no request is made while rendering.",
    "The current package parses through `@mdit/plugin-uml` and extracts block content with `state.getLines` plus `dedent`, while the reference slices `state.src` itself. As a result the reference keeps the raw indentation of indented blocks and lists (and even the `> ` prefix of blockquotes) in the diagram source, whereas the current package strips it. The `list-item`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` cases document this; block structure itself is identical.",
    "An untitled diagram gets a different default alt text from each package (`PlantUML Diagram` vs `uml diagram`). Both are arbitrary fallbacks, so the current wording is normalized to the reference one before comparing; explicit titles are not normalized. Attribute order is normalized as well.",
    "Explicit titles differ by design: the current package uses the raw marker suffix (including the separating space after `@startuml`) and does not inline-parse it, while the reference drops that space and inline-parses the title, so emphasis and code markers disappear from its alt text. The `title`, `title-inline-markup` and `title-html` cases document this.",
    "The default renderer of each package is kept; only the `src` generator is replaced. Alt text, HTML escaping, block structure and the number of rendered images are therefore compared as produced by both plugins.",
    "Benchmarks run through the same deterministic renderers, so they measure parsing and markup generation only: the deflate + base64 encoders are bypassed on both sides and are not part of the throughput numbers. The `heavy` corpora contain many diagrams, so their ratios also reflect the reference's per-block document split described below. Corpora stay modest (normal ≈ 1/4/12 KB with one diagram per section, heavy ≈ 0.7/3/9 KB with four diagrams per section).",
    "Scaling: the reference extracts every block with `state.src.split('\\n')`, so each diagram costs O(document size) and many diagrams cost O(blocks × document), i.e. quadratic (`many-diagrams`, and `unmatched-openers`, which places one unclosed marker inside every list item so each item auto-closes its own block). The current package slices only the block lines with `state.getLines` and stays linear in the number of diagrams. `long-diagram-body` is linear on both sides; no superlinear path was found in the current package. Encoding cost is excluded from all series.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "plantuml",
      referenceExport: "default",
      createOurRenderer,
      createReferenceRenderer,
    },
  ],
  correctness: [
    { name: "basic", markdown: "@startuml\nBob -> Alice : hello\n@enduml" },
    {
      name: "multiline",
      markdown:
        "@startuml\nAlice -> Bob : request\nBob -> Carol : forward\nnote right of Carol: handled\nAlice <-- Carol : response\n@enduml",
    },
    {
      name: "multiple-diagrams",
      markdown:
        "@startuml\nA -> B\n@enduml\n\nA paragraph between two diagrams.\n\n@startuml\nC -> D\n@enduml",
    },
    { name: "empty-block", markdown: "@startuml\n@enduml" },
    { name: "block-with-blank-lines", markdown: "@startuml\n\nAlice -> Bob\n\n@enduml" },
    { name: "unclosed-block", markdown: "@startuml\nBob -> Alice : hello" },
    {
      name: "markers-in-fence",
      markdown: "```\n@startuml\nBob -> Alice : hello\n@enduml\n```",
    },
    {
      name: "markers-in-indented-code",
      markdown: "    @startuml\n    Bob -> Alice : hello\n    @enduml",
    },
    {
      name: "markers-in-inline-code",
      markdown: "Use `@startuml` and `@enduml` in prose.",
    },
    {
      name: "list-item",
      markdown: "- @startuml\n  Bob -> Alice : hello\n  @enduml",
      note: "The current package strips the list indentation from the diagram source, while the reference keeps the two leading spaces of the content line. The rendered list and `<img>` structure are identical.",
    },
    {
      name: "blockquote",
      markdown: "> @startuml\n> Bob -> Alice : hello\n> @enduml",
      note: "The reference slices `state.src` without removing blockquote markers, so the `> ` prefix leaks into the diagram source; the current package dedents the quoted lines. The blockquote structure is identical.",
    },
    {
      name: "nested-blockquote",
      markdown: "> > @startuml\n> > Bob -> Alice : hello\n> > @enduml",
      note: "Same cause as `blockquote`: the reference keeps every `> ` prefix in the diagram source, while the current package strips both quote levels. The nested blockquote structure is identical.",
    },
    {
      name: "indented-marker",
      markdown: "  @startuml\n  Bob -> Alice : hello\n  @enduml",
      note: "Both sides accept the two-space indented marker, but the reference keeps the indentation of the content line in the diagram source and the current package strips it with `dedent`.",
    },
    {
      name: "indented-content",
      markdown: "@startuml\n  Alice -> Bob\n    note right\n  Bob -> Carol\n@enduml",
      note: "The current package removes the common indentation of the diagram body, while the reference keeps every line as written. The relative indentation is preserved by `dedent`, so the drawing itself is unchanged.",
    },
    {
      name: "title",
      markdown: "@startuml My title\nBob -> Alice : hello\n@enduml",
      note: "The current package uses the raw marker suffix as alt, including the separating space after `@startuml`; the reference removes that space and inline-parses the title.",
    },
    {
      name: "title-inline-markup",
      markdown: "@startuml **Flow** chart\nBob -> Alice : hello\n@enduml",
      note: "Besides the separating space, the reference inline-parses the title, so `**Flow**` becomes `Flow` in alt; the current package keeps the raw markers.",
    },
    {
      name: "title-html",
      markdown: "@startuml <b>Flow</b> chart\nBob -> Alice : hello\n@enduml",
      note: "Only the separating space differs: the reference inline-parses `<b>` but keeps it as text in the alt attribute, so both sides end up with the same escaped HTML.",
    },
    {
      name: "closing-marker-indented",
      markdown: "@startuml\nBob -> Alice : hello\n  @enduml",
      note: "Both sides reject a closing marker that is indented deeper than the opening one, keep the line as diagram content and auto-close the block at the end of the document.",
    },
    {
      name: "closing-marker-trailing-text",
      markdown: "@startuml\nBob -> Alice : hello\n@enduml extra",
      note: "Both sides require the closing marker line to contain only spaces after the marker, so the line stays in the diagram source and the block is auto-closed at the end of the document.",
    },
    {
      name: "marker-not-at-line-start",
      markdown: "Text before @startuml\nBob -> Alice\n@enduml",
    },
    {
      name: "content-escaping",
      markdown: '@startuml\nAlice -> Bob : a < b && c > d "quoted"\n@enduml',
    },
    {
      name: "adjacent-diagrams",
      markdown: "@startuml\nA -> B\n@enduml\n@startuml\nC -> D\n@enduml",
    },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b\n\n```js\nconst value = 1;\n```",
    },
    { name: "empty-document", markdown: "\n" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-diagrams",
      sizes: [128, 256, 512, 1024],
      build: (size) => "@startuml\nAlice -> Bob : hello\n@enduml\n\n".repeat(size),
    },
    {
      name: "long-diagram-body",
      sizes: [64, 128, 256, 512],
      build: (size) =>
        `@startuml\n${Array.from({ length: size }, (_, index) => `Alice -> Bob : message ${index}`).join("\n")}\n@enduml\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [128, 256, 512, 1024],
      build: (size) => "- @startuml\n  Alice -> Bob : hello\n\n".repeat(size),
    },
  ],
});

export default spec;
