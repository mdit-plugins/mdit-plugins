import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance, RendererRule } from "markdown-it";

import { resolvePlugin } from "../loader.ts";
import type { CompareRenderer, ComparisonSpec, PluginModule } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Diagram name of the current package: it is the `name` option, i.e. the token type and renderer
 * key, and the suffix of the `@start…` / `@end…` markers
 */
const DIAGRAM_NAME = "uml";

/** Token type of the reference package, hard-coded in its block rule */
const REFERENCE_TOKEN_TYPE = "uml_diagram";

/** Fields of a parsed block that both implementations expose in some form */
interface BlockRecord {
  /** Marker that opened the block (`token.markup`) */
  readonly markup: string;
  /** Raw marker suffix (`token.info`), including the separating space */
  readonly params: string;
  /** Title text the renderer layer would use */
  readonly title: string;
  /** Extracted diagram source */
  readonly content: string;
  /** Source line range of the block */
  readonly map: readonly [number, number] | null;
}

/**
 * Serialize one parsed block into a single comparable line
 *
 * Every string value is JSON-quoted so that leading/trailing spaces, blank lines and escapes stay
 * visible in the diff; the line range is rendered as `first..last`.
 *
 * @param block - Parsed block fields
 * @returns A stable one-line description
 */
const serializeBlock = (block: BlockRecord): string => {
  const map = block.map ? `${block.map[0]}..${block.map[1]}` : "none";
  const fields = [
    "block",
    `markup=${JSON.stringify(block.markup)}`,
    `params=${JSON.stringify(block.params)}`,
    `title=${JSON.stringify(block.title)}`,
    `map=${map}`,
    `content=${JSON.stringify(block.content)}`,
  ];

  return `${fields.join(" ")}\n`;
};

/**
 * Renderer of the current package: dump the block token pushed by `@mdit/plugin-uml`
 *
 * The base package derives nothing from the marker suffix: the raw suffix is `token.info` and the
 * extracted, dedented source is `token.content`, so both are reported as they are. The literal
 * token type is not printed: it is the configurable `name` option here but a hard-coded
 * `uml_diagram` in the reference.
 *
 * @param tokens - Token stream
 * @param index - Index of the block token
 * @returns Serialized block
 */
const renderOurBlock: RendererRule = (tokens, index) => {
  const token = tokens[index];

  return serializeBlock({
    markup: token.markup,
    params: token.info,
    title: token.info,
    content: token.content,
    map: token.map,
  });
};

/**
 * Renderer of the reference package: dump the block token built by `markdown-it-plantuml`
 *
 * The reference never stores the diagram source on the token: it passes the source to
 * `generateSource` during parsing and keeps the result in the `src` attribute, so the identity
 * `generateSource` configured below is also how the extracted source is read back. The reference
 * also derives the `alt` text inside the block rule by dropping the first character of the marker
 * suffix and inline-parsing the rest; the fixed fallback alt of an untitled diagram (`uml diagram`)
 * is reported as no title, because it is an arbitrary label of the image layer that this comparison
 * disables.
 *
 * @param tokens - Token stream
 * @param index - Index of the block token
 * @param options - Markdown-it options
 * @param env - Markdown-it environment
 * @param renderer - Renderer of the same markdown-it instance
 * @returns Serialized block
 */
const renderReferenceBlock: RendererRule = (tokens, index, options, env, renderer) => {
  const token = tokens[index];
  const source = token.attrGet("src");

  return serializeBlock({
    markup: token.markup,
    params: token.info,
    title: token.info ? renderer.renderInlineAsText(token.children ?? [], options, env) : "",
    content: typeof source === "string" ? source : "",
    map: token.map,
  });
};

/**
 * Create a renderer that reports the number of parsed blocks and the rendered document
 *
 * All other tokens are rendered by the shared markdown-it core on both sides, so the markup around
 * the blocks (paragraphs, lists, quotes, fences) is compared as well; only the block tokens are
 * replaced by {@link serializeBlock} through each plugin's renderer hook.
 *
 * @param md - Markdown-it instance with the plugin installed
 * @param tokenType - Token type the plugin pushes for a block
 * @returns A renderer that turns markdown into a comparable dump
 */
const createDumpRenderer =
  (md: MarkdownItInstance, tokenType: string): CompareRenderer =>
  (markdown) => {
    const tokens = md.parse(markdown, {});
    const blocks = tokens.filter((token) => token.type === tokenType).length;

    return `blocks=${blocks}\n${md.renderer.render(tokens, md.options, {})}`;
  };

/**
 * Create a renderer for the current package
 *
 * `@mdit/plugin-uml` is the generalized base of `markdown-it-plantuml`: the marker names, the token
 * name and the renderer are options here. The marker options are mapped to the reference markers
 * and the renderer is replaced, so only the base block parser is exercised.
 *
 * @param module - Loaded plugin module
 * @returns A renderer that turns markdown into a comparable dump
 */
const createOurRenderer = (module: PluginModule): CompareRenderer => {
  const plugin = resolvePlugin(module, "uml");
  const md = new MarkdownIt();

  md.use(plugin, {
    name: DIAGRAM_NAME,
    open: `start${DIAGRAM_NAME}`,
    close: `end${DIAGRAM_NAME}`,
    renderer: renderOurBlock,
  });

  return createDumpRenderer(md, DIAGRAM_NAME);
};

/**
 * Create a renderer for the reference package
 *
 * `generateSource` replaces the deflate + base64 PlantUML server URL with the raw diagram source,
 * so no encoder runs and no server is contacted. `render` replaces the image renderer with the same
 * deterministic dump as the current side.
 *
 * @param module - Loaded plugin module
 * @returns A renderer that turns markdown into a comparable dump
 */
const createReferenceRenderer = (module: PluginModule): CompareRenderer => {
  const plugin = resolvePlugin(module);
  const md = new MarkdownIt();

  md.use(plugin, {
    openMarker: `@start${DIAGRAM_NAME}`,
    closeMarker: `@end${DIAGRAM_NAME}`,
    generateSource: (contents: string): string => contents,
    render: renderReferenceBlock,
  });

  return createDumpRenderer(md, REFERENCE_TOKEN_TYPE);
};

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param size - Corpus size
 * @returns Markdown of the requested size
 */
const buildCorpus = (unit: string, size: "small" | "medium" | "large"): string => {
  const repetitions = { small: 3, medium: 12, large: 36 }[size];

  return unit.repeat(repetitions);
};

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

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, size),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-uml",
  reference: "markdown-it-plantuml",
  normalize: (output) => output,
  notes: [
    '`@mdit/plugin-uml` is the generalized base implementation of `markdown-it-plantuml`: it contains the same `@`-marker block rule, line scanning and auto-close rules, with the marker names, the token name and the renderer turned into options. This spec compares only that base block parser; the PlantUML image and encoder layer is out of scope and is disabled on both sides. The marker options are mapped 1:1 — the current side is configured with `{ name: "uml", open: "startuml", close: "enduml", renderer }` and the reference with `{ openMarker: "@startuml", closeMarker: "@enduml", generateSource, render }` — and each plugin registers its rule before `fence` with the same `alt` list, so the two parsers see the same block boundaries.',
    "Rendering is replaced by a deterministic dump on both sides: `blocks=N` followed by the document HTML of the shared markdown-it renderer, with every plugin block token serialized as `block markup=… params=… title=… map=… content=…` (strings JSON-quoted). The output is compared byte for byte (`normalize` is the identity function), because the only real differences are inside that record and the surrounding HTML comes from the same markdown-it core. No encoder, server URL or network access is involved on either side: the current `renderer` option and the reference `render` option return the record, and the reference `generateSource` returns the diagram source unchanged instead of the deflate + base64 server URL.",
    "The reference never stores the diagram source on its token: the block rule passes it to `generateSource` and keeps the result in the `src` attribute, while `token.content` stays empty. The current base stores it in `token.content`. The identity `generateSource` is therefore both the replacement for the encoder and the way the reference's extracted source is read back for the record; the `src`/`alt` attributes and the `<img>` tag are not compared (the current base pushes a placeholder `<uml>` token without attributes, and the image markup is the layer this spec excludes).",
    "The reference hard-codes the token type `uml_diagram`, which is also its renderer key. In the current package both are the `name` option (`uml` here, which is also the name `@mdit/plugin-plantuml` passes). The record prints a canonical `block` marker instead of the literal token type so that this naming difference does not mask the field-by-field comparison; the serializer of each side is installed as the renderer rule for its own token type, so a token of an unexpected type would not be rendered at all.",
    "Titles are handled differently by the two implementations. The reference derives an `alt` inside the block rule: it drops the first character of the marker suffix (`params.slice(1)`, assuming a separating space) and inline-parses the rest into `token.children`, falling back to the fixed `uml diagram` when the suffix is empty. The current base derives nothing: it exposes the raw suffix as `token.info` and leaves titles to the renderer (`@mdit/plugin-plantuml` uses that raw suffix as the image alt text). The compared `title` field is therefore the raw `info` on the current side and the inline-rendered alt text on the reference side; the fixed `uml diagram` fallback is not compared because it is an arbitrary label of the disabled image layer (the `plugin-plantuml` comparison covers it). `title`, `title-inline-markup`, `title-only-space` and `odd-marker-suffix` document the remaining differences.",
    "The body is extracted differently: the current package calls `state.getLines(startLine + 1, nextLine, state.blkIndent, false)` and `dedent`, while the reference slices the raw document with `state.src.split('\\n').slice(startLine + 1, nextLine).join('\\n')`. Both agree on the line range, the auto-close rules, the block count, the `markup` and the token `map` in every case; they disagree on the text. The reference keeps the indentation of list items and of indented blocks and even the `> ` prefixes of blockquotes, while the current package strips the container prefixes and the common indentation. `list-item`, `list-item-unclosed`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` document this; the block structure around the diagrams is identical in all of them.",
    "Both sides reject a closing marker that is indented deeper than the opening one or followed by non-space text, keep that line as diagram content and auto-close the block at the end of the parent; `closing-marker-indented` and `closing-marker-trailing-text` pin this down. Markers inside fences and indented code blocks are not parsed by either side (both rules sit between `code` and `fence`), and an escaped (`\\@startuml`) or mid-line marker stays paragraph text on both sides.",
    "Benchmarks use the same deterministic dump, so they measure block parsing and the shared markdown-it rendering only; the deflate + base64 encoder and the network are excluded on both sides. The `heavy` corpora contain four diagrams per section rather than one, so their ratios also include the reference's per-block whole-document split described below.",
    "Scaling: the reference extracts every block with `state.src.split('\\n')`, so each block costs O(document) and many blocks cost O(blocks × document) — quadratic. `many-blocks` and `unmatched-openers` (every list item opens a block that is auto-closed by the next item) target that; `long-block-body` is linear on both sides and serves as the baseline. The current package slices only the block lines with `state.getLines` and stays linear in the number of blocks; no superlinear path was found in it.",
  ],
  variants: [
    {
      id: "default",
      ourExport: "uml",
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
      name: "multiple-blocks",
      markdown:
        "@startuml\nA -> B\n@enduml\n\nA paragraph between two diagrams.\n\n@startuml\nC -> D\n@enduml\n\n@startuml\nE -> F\n@enduml",
    },
    { name: "empty-block", markdown: "@startuml\n@enduml" },
    { name: "body-with-blank-lines", markdown: "@startuml\n\nAlice -> Bob\n\n@enduml" },
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
      name: "list-item",
      markdown: "- @startuml\n  Bob -> Alice : hello\n  @enduml",
      note: "The current package strips the list indentation from the diagram source (`getLines` with `blkIndent` plus `dedent`), while the reference slices `state.src` and keeps the two leading spaces. The list structure and the token map are identical.",
    },
    {
      name: "list-item-unclosed",
      markdown: "- @startuml\n  Bob -> Alice : hello\n- second item",
      note: "Both sides auto-close the unclosed block at the end of the list item and produce the same map; the current package strips the item indentation from the source while the reference keeps it.",
    },
    {
      name: "blockquote",
      markdown: "> @startuml\n> Bob -> Alice : hello\n> @enduml",
      note: "The reference slices `state.src` without removing blockquote markers, so the `> ` prefix leaks into the diagram source; the current package strips it through `getLines`. The blockquote structure is identical.",
    },
    {
      name: "nested-blockquote",
      markdown: "> > @startuml\n> > Bob -> Alice : hello\n> > @enduml",
      note: "Same cause as `blockquote`: the reference keeps both `> > ` prefixes in the diagram source, the current package strips both quote levels. The nested blockquote structure is identical.",
    },
    {
      name: "indented-marker",
      markdown: "  @startuml\n  Bob -> Alice : hello\n  @enduml",
      note: "Both sides accept the two-space indented marker, but `dedent` removes the indentation of the content line in the current package while the reference keeps the line as written.",
    },
    {
      name: "indented-content",
      markdown: "@startuml\n  Alice -> Bob\n    note right\n  Bob -> Carol\n@enduml",
      note: "The current package removes the common indentation of the diagram body, the reference keeps every line as written. `dedent` preserves the relative indentation, so the drawing itself is unchanged.",
    },
    {
      name: "title",
      markdown: "@startuml My title\nBob -> Alice : hello\n@enduml",
      note: "The current base keeps the raw marker suffix (including the separating space) as `info`; the reference removes that space and inline-parses the suffix for its alt text, which is the title compared here.",
    },
    {
      name: "title-inline-markup",
      markdown: "@startuml **Flow** chart\nBob -> Alice : hello\n@enduml",
      note: "Besides the separating space, the reference inline-parses the title, so `**Flow**` disappears from its alt text; the current base keeps the raw markers in `info`.",
    },
    {
      name: "title-only-space",
      markdown: "@startuml \nA -> B\n@enduml",
      note: 'The marker is followed by a single space, so the suffix is `" "`: the current base keeps it, while the reference unconditionally drops the first suffix character and ends up with an empty alt text.',
    },
    {
      name: "odd-marker-suffix",
      markdown: "@startumlExtra\nA -> B\n@enduml",
      note: "`@startumlExtra` still matches the opening marker as a prefix on both sides and both report the suffix `Extra` in `info`, but the reference unconditionally drops the first suffix character for its alt text (`xtra`), while the current base keeps the raw suffix as the title.",
    },
    { name: "escaped-marker", markdown: "\\@startuml\nBob -> Alice\n@enduml" },
    {
      name: "closing-marker-indented",
      markdown: "@startuml\nBob -> Alice : hello\n  @enduml",
      note: "Both sides reject a closing marker indented deeper than the opening one, keep the line as diagram content and auto-close the block at the end of the document.",
    },
    {
      name: "closing-marker-trailing-text",
      markdown: "@startuml\nBob -> Alice : hello\n@enduml extra",
      note: "Both sides require the closing marker line to contain only spaces after the marker, so the line stays in the diagram source and the block is auto-closed at the end of the document.",
    },
    { name: "marker-not-at-line-start", markdown: "Text before @startuml\nBob -> Alice\n@enduml" },
    {
      name: "content-escaping",
      markdown: '@startuml\nAlice -> Bob : a < b && c > d "quoted"\n@enduml',
    },
    {
      name: "adjacent-blocks",
      markdown: "@startuml\nA -> B\n@enduml\n@startuml\nC -> D\n@enduml",
    },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b\n\n```js\nconst value = 1;\n```",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-blocks",
      sizes: [128, 256, 512, 1024],
      build: (size) => "@startuml\nAlice -> Bob : hello\n@enduml\n\n".repeat(size),
    },
    {
      name: "long-block-body",
      sizes: [128, 256, 512, 1024],
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
