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

/** Benchmark cases, one per committed corpus file */
const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-uml/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-uml",
  reference: "markdown-it-plantuml",
  normalize: (output) => output,
  notes: [
    {
      en: '`@mdit/plugin-uml` is the generalized base implementation of `markdown-it-plantuml`: it contains the same `@`-marker block rule, line scanning and auto-close rules, with the marker names, the token name and the renderer turned into options. This spec compares only that base block parser; the PlantUML image and encoder layer is out of scope and is disabled on both sides. The marker options are mapped 1:1 — the current side is configured with `{ name: "uml", open: "startuml", close: "enduml", renderer }` and the reference with `{ openMarker: "@startuml", closeMarker: "@enduml", generateSource, render }` — and each plugin registers its rule before `fence` with the same `alt` list, so the two parsers see the same block boundaries.',
      zh: '`@mdit/plugin-uml` 是 `markdown-it-plantuml` 的泛化基础实现：它包含相同的 `@` 标记块规则、行扫描与自动闭合规则，只是把标记名、token 名和渲染器变为选项。本规范只比较该基础块解析器；PlantUML 图片与编码器层不在范围内，且在两侧都被禁用。标记选项一一对应——当前包侧配置为 `{ name: "uml", open: "startuml", close: "enduml", renderer }`，参考包侧配置为 `{ openMarker: "@startuml", closeMarker: "@enduml", generateSource, render }`——两个插件都在 `fence` 之前注册各自规则并使用相同的 `alt` 列表，因此两个解析器看到的块边界一致。',
    },
    {
      en: "Rendering is replaced by a deterministic dump on both sides: `blocks=N` followed by the document HTML of the shared markdown-it renderer, with every plugin block token serialized as `block markup=… params=… title=… map=… content=…` (strings JSON-quoted). The output is compared byte for byte (`normalize` is the identity function), because the only real differences are inside that record and the surrounding HTML comes from the same markdown-it core. No encoder, server URL or network access is involved on either side: the current `renderer` option and the reference `render` option return the record, and the reference `generateSource` returns the diagram source unchanged instead of the deflate + base64 server URL.",
      zh: "两侧都用确定性的转储代替渲染：先输出 `blocks=N`，再输出共享 markdown-it 渲染器的文档 HTML，每个插件块 token 序列化为 `block markup=… params=… title=… map=… content=…`（字符串用 JSON 引号包裹）。输出按字节比较（`normalize` 为恒等函数），因为真正的差异只存在于该记录内部，而外围 HTML 来自同一个 markdown-it 核心。两侧都不涉及编码器、服务器 URL 或网络访问：当前包的 `renderer` 选项与参考包的 `render` 选项都返回该记录，参考包的 `generateSource` 直接返回图表源码，而不是 deflate + base64 的服务器 URL。",
    },
    {
      en: "The reference never stores the diagram source on its token: the block rule passes it to `generateSource` and keeps the result in the `src` attribute, while `token.content` stays empty. The current base stores it in `token.content`. The identity `generateSource` is therefore both the replacement for the encoder and the way the reference's extracted source is read back for the record; the `src`/`alt` attributes and the `<img>` tag are not compared (the current base pushes a placeholder `<uml>` token without attributes, and the image markup is the layer this spec excludes).",
      zh: "参考包从不把图表源码存到 token 上：块规则将其传给 `generateSource`，并把结果保存在 `src` 属性中，而 `token.content` 保持为空。当前基础包则存入 `token.content`。因此恒等 `generateSource` 既替代了编码器，也是回读参考包提取出的源码以写入该记录的手段；`src`/`alt` 属性和 `<img>` 标签不参与比较（当前基础包压入的是不带属性的占位 `<uml>` token，而图片标记属于本规范排除的层次）。",
    },
    {
      en: "The reference hard-codes the token type `uml_diagram`, which is also its renderer key. In the current package both are the `name` option (`uml` here, which is also the name `@mdit/plugin-plantuml` passes). The record prints a canonical `block` marker instead of the literal token type so that this naming difference does not mask the field-by-field comparison; the serializer of each side is installed as the renderer rule for its own token type, so a token of an unexpected type would not be rendered at all.",
      zh: "参考包硬编码 token 类型 `uml_diagram`，它同时也是其渲染器键。当前包中两者都是 `name` 选项（此处为 `uml`，也是 `@mdit/plugin-plantuml` 传入的名字）。记录中打印规范的 `block` 标记而非字面 token 类型，以免这一命名差异掩盖逐字段比较；每侧的序列化器都安装为自己 token 类型的渲染器规则，因此类型不符的 token 根本不会被渲染。",
    },
    {
      en: "Titles are handled differently by the two implementations. The reference derives an `alt` inside the block rule: it drops the first character of the marker suffix (`params.slice(1)`, assuming a separating space) and inline-parses the rest into `token.children`, falling back to the fixed `uml diagram` when the suffix is empty. The current base derives nothing: it exposes the raw suffix as `token.info` and leaves titles to the renderer (`@mdit/plugin-plantuml` uses that raw suffix as the image alt text). The compared `title` field is therefore the raw `info` on the current side and the inline-rendered alt text on the reference side; the fixed `uml diagram` fallback is not compared because it is an arbitrary label of the disabled image layer (the `plugin-plantuml` comparison covers it). `title`, `title-inline-markup`, `title-only-space` and `odd-marker-suffix` document the remaining differences.",
      zh: "两种实现对标题的处理不同。参考包在块规则内生成 `alt`：去掉标记后缀的第一个字符（`params.slice(1)`，假定存在分隔空格），将剩余部分行内解析到 `token.children`，后缀为空时回退为固定的 `uml diagram`。当前基础包不做任何推导：它把原始后缀暴露为 `token.info`，把标题留给渲染器（`@mdit/plugin-plantuml` 就用该原始后缀作为图片 alt 文本）。因此参与比较的 `title` 字段在当前包侧是原始 `info`，在参考包侧是行内渲染后的 alt 文本；固定的 `uml diagram` 回退值不参与比较，因为它属于被禁用的图片层的任意标签（由 `plugin-plantuml` 的比较覆盖）。`title`、`title-inline-markup`、`title-only-space` 和 `odd-marker-suffix` 记录了其余差异。",
    },
    {
      en: "The body is extracted differently: the current package calls `state.getLines(startLine + 1, nextLine, state.blkIndent, false)` and `dedent`, while the reference slices the raw document with `state.src.split('\\n').slice(startLine + 1, nextLine).join('\\n')`. Both agree on the line range, the auto-close rules, the block count, the `markup` and the token `map` in every case; they disagree on the text. The reference keeps the indentation of list items and of indented blocks and even the `>` prefixes of blockquotes, while the current package strips the container prefixes and the common indentation. `list-item`, `list-item-unclosed`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` document this; the block structure around the diagrams is identical in all of them.",
      zh: "正文提取方式不同：当前包调用 `state.getLines(startLine + 1, nextLine, state.blkIndent, false)` 和 `dedent`，参考包则用 `state.src.split('\\n').slice(startLine + 1, nextLine).join('\\n')` 切分原始文档。所有用例中，两者对行范围、自动闭合规则、块数量、`markup` 和 token `map` 的判断一致，但文本内容不同。参考包保留列表项和缩进块的缩进，甚至保留块引用的 `>` 前缀，而当前包会去掉容器前缀和公共缩进。`list-item`、`list-item-unclosed`、`blockquote`、`nested-blockquote`、`indented-marker` 和 `indented-content` 记录了这一点；这些用例中图表周围的块结构完全相同。",
    },
    {
      en: "Both sides reject a closing marker that is indented deeper than the opening one or followed by non-space text, keep that line as diagram content and auto-close the block at the end of the parent; `closing-marker-indented` and `closing-marker-trailing-text` pin this down. Markers inside fences and indented code blocks are not parsed by either side (both rules sit between `code` and `fence`), and an escaped (`\\@startuml`) or mid-line marker stays paragraph text on both sides.",
      zh: "两侧都会拒绝缩进比开标记更深或后接非空白文本的闭标记，将其保留为图表内容，并在父级结束时自动闭合块；`closing-marker-indented` 和 `closing-marker-trailing-text` 固定了这一行为。围栏代码块和缩进代码块内的标记两侧都不解析（两个规则都位于 `code` 与 `fence` 之间），转义（`\\@startuml`）或位于行中的标记在两侧都保持为段落文本。",
    },
    {
      en: "Benchmarks use the same deterministic dump, so they measure block parsing and the shared markdown-it rendering only; the deflate + base64 encoder and the network are excluded on both sides. The `heavy` corpora contain four diagrams per section rather than one, so their ratios also include the reference's per-block whole-document split described below.",
      zh: "基准测试使用相同的确定性转储，因此只测量块解析和共享的 markdown-it 渲染；deflate + base64 编码器与网络在两侧都被排除。`heavy` 语料每个小节包含四个图表而不是一个，因此其比值还包含下文所述参考包按块切分整个文档的开销。",
    },
    {
      en: "Scaling: the reference extracts every block with `state.src.split('\\n')`, so each block costs O(document) and many blocks cost O(blocks × document) — quadratic. `many-blocks` and `unmatched-openers` (every list item opens a block that is auto-closed by the next item) target that; `long-block-body` is linear on both sides and serves as the baseline. The current package slices only the block lines with `state.getLines` and stays linear in the number of blocks; no superlinear path was found in it.",
      zh: "扩展性：参考包用 `state.src.split('\\n')` 提取每个块，因此单个块的成本为 O(document)，块很多时为 O(blocks × document)——即二次。`many-blocks` 和 `unmatched-openers`（每个列表项都开启一个块，并由下一项自动闭合）针对这一点；`long-block-body` 在两侧都是线性的，作为基线。当前包只用 `state.getLines` 切出块所在行，在块数量上保持线性；未在其内部发现超线性路径。",
    },
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
      note: {
        en: "The current package strips the list indentation from the diagram source (`getLines` with `blkIndent` plus `dedent`), while the reference slices `state.src` and keeps the two leading spaces. The list structure and the token map are identical.",
        zh: "当前包会去掉图表源码中的列表缩进（`getLines` 配合 `blkIndent` 加上 `dedent`），而参考包切分 `state.src` 并保留两个前导空格。列表结构和 token map 完全相同。",
      },
    },
    {
      name: "list-item-unclosed",
      markdown: "- @startuml\n  Bob -> Alice : hello\n- second item",
      note: {
        en: "Both sides auto-close the unclosed block at the end of the list item and produce the same map; the current package strips the item indentation from the source while the reference keeps it.",
        zh: "两侧都会在列表项结束时自动闭合未闭合的块，并产生相同的 map；当前包会去掉条目缩进，而参考包保留。",
      },
    },
    {
      name: "blockquote",
      markdown: "> @startuml\n> Bob -> Alice : hello\n> @enduml",
      note: {
        en: "The reference slices `state.src` without removing blockquote markers, so the `>` prefix leaks into the diagram source; the current package strips it through `getLines`. The blockquote structure is identical.",
        zh: "参考包切分 `state.src` 时不移除块引用标记，因此 `>` 前缀会泄漏到图表源码中；当前包通过 `getLines` 将其去掉。块引用结构完全相同。",
      },
    },
    {
      name: "nested-blockquote",
      markdown: "> > @startuml\n> > Bob -> Alice : hello\n> > @enduml",
      note: {
        en: "Same cause as `blockquote`: the reference keeps both `> >` prefixes in the diagram source, the current package strips both quote levels. The nested blockquote structure is identical.",
        zh: "与 `blockquote` 原因相同：参考包在图表源码中保留两个 `> >` 前缀，当前包去掉这两层引用。嵌套块引用结构完全相同。",
      },
    },
    {
      name: "indented-marker",
      markdown: "  @startuml\n  Bob -> Alice : hello\n  @enduml",
      note: {
        en: "Both sides accept the two-space indented marker, but `dedent` removes the indentation of the content line in the current package while the reference keeps the line as written.",
        zh: "两侧都接受缩进两个空格的标记，但当前包会用 `dedent` 去掉内容行的缩进，而参考包按原样保留该行。",
      },
    },
    {
      name: "indented-content",
      markdown: "@startuml\n  Alice -> Bob\n    note right\n  Bob -> Carol\n@enduml",
      note: {
        en: "The current package removes the common indentation of the diagram body, the reference keeps every line as written. `dedent` preserves the relative indentation, so the drawing itself is unchanged.",
        zh: "当前包会去掉图表正文的公共缩进，参考包则按原样保留每一行。`dedent` 保留相对缩进，因此图形本身不变。",
      },
    },
    {
      name: "title",
      markdown: "@startuml My title\nBob -> Alice : hello\n@enduml",
      note: {
        en: "The current base keeps the raw marker suffix (including the separating space) as `info`; the reference removes that space and inline-parses the suffix for its alt text, which is the title compared here.",
        zh: "当前基础包把原始标记后缀（含分隔空格）保留为 `info`；参考包去掉该空格并对后缀做行内解析以生成 alt 文本，也就是这里比较的 title。",
      },
    },
    {
      name: "title-inline-markup",
      markdown: "@startuml **Flow** chart\nBob -> Alice : hello\n@enduml",
      note: {
        en: "Besides the separating space, the reference inline-parses the title, so `**Flow**` disappears from its alt text; the current base keeps the raw markers in `info`.",
        zh: "除分隔空格外，参考包还会对标题做行内解析，因此 `**Flow**` 从 alt 文本中消失；当前基础包在 `info` 中保留原始标记。",
      },
    },
    {
      name: "title-only-space",
      markdown: "@startuml \nA -> B\n@enduml",
      note: {
        en: 'The marker is followed by a single space, so the suffix is `" "`: the current base keeps it, while the reference unconditionally drops the first suffix character and ends up with an empty alt text.',
        zh: '标记后只有一个空格，因此后缀为 `" "`：当前基础包保留它，而参考包无条件丢弃后缀的第一个字符，最终得到空的 alt 文本。',
      },
    },
    {
      name: "odd-marker-suffix",
      markdown: "@startumlExtra\nA -> B\n@enduml",
      note: {
        en: "`@startumlExtra` still matches the opening marker as a prefix on both sides and both report the suffix `Extra` in `info`, but the reference unconditionally drops the first suffix character for its alt text (`xtra`), while the current base keeps the raw suffix as the title.",
        zh: "两侧都会把 `@startumlExtra` 按前缀匹配为开标记，并在 `info` 中报告后缀 `Extra`，但参考包会无条件丢弃后缀第一个字符得到 alt 文本（`xtra`），而当前基础包把原始后缀保留为 title。",
      },
    },
    { name: "escaped-marker", markdown: "\\@startuml\nBob -> Alice\n@enduml" },
    {
      name: "closing-marker-indented",
      markdown: "@startuml\nBob -> Alice : hello\n  @enduml",
      note: {
        en: "Both sides reject a closing marker indented deeper than the opening one, keep the line as diagram content and auto-close the block at the end of the document.",
        zh: "两侧都会拒绝缩进比开标记更深的闭标记，将该行保留为图表内容，并在文档结束时自动闭合块。",
      },
    },
    {
      name: "closing-marker-trailing-text",
      markdown: "@startuml\nBob -> Alice : hello\n@enduml extra",
      note: {
        en: "Both sides require the closing marker line to contain only spaces after the marker, so the line stays in the diagram source and the block is auto-closed at the end of the document.",
        zh: "两侧都要求闭标记行中标记之后只能有空格，因此该行留在图表源码中，块在文档结束时自动闭合。",
      },
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
