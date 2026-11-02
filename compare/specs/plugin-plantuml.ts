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

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-plantuml/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-plantuml",
  reference: "markdown-it-plantuml",
  normalize: normalizePlantumlHtml,
  notes: [
    {
      en: "Both packages parse `@startuml` … `@enduml` blocks and render an `<img>` whose `src` points at a PlantUML server. The current package compresses with its platform deflate implementation (Node: `node:zlib`, browser: pako) and its own base64 variant, while the reference package ships its own deflate implementation, so the encoded URLs are not byte-comparable by design. The source generators are replaced through the documented hooks: `srcGetter` returns the token content on the current side and `generateSource` returns the diagram code on the reference side. The compared `src` is therefore the decoded diagram source (the text that would be compressed into the URL), not the encoded URL. No PlantUML server is contacted and no request is made while rendering.",
      zh: "两个包都解析 `@startuml` … `@enduml` 块，并渲染一个 `src` 指向 PlantUML 服务器的 `<img>`。当前包使用其平台相关的 deflate 实现（Node：`node:zlib`，浏览器：pako）和自己实现的 base64 变体进行压缩，而参考包自带 deflate 实现，因此编码后的 URL 按设计无法逐字节比较。两侧的源生成器都通过文档化的钩子替换：当前包的 `srcGetter` 返回 token 内容，参考包的 `generateSource` 返回图表代码。因此比较的 `src` 是解码后的图表源（即将被压缩进 URL 的文本），而不是编码后的 URL。渲染过程中不会联系 PlantUML 服务器，也不会发起请求。",
    },
    {
      en: "The current package parses through `@mdit/plugin-uml` and extracts block content with `state.getLines` plus `dedent`, while the reference slices `state.src` itself. As a result the reference keeps the raw indentation of indented blocks and lists (and even the `>` prefix of blockquotes) in the diagram source, whereas the current package strips it. The `list-item`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` cases document this; block structure itself is identical.",
      zh: "当前包通过 `@mdit/plugin-uml` 解析，并用 `state.getLines` 加 `dedent` 提取块内容，而参考包直接切取 `state.src`。因此参考包会在图表源中保留缩进块和列表的原始缩进（甚至 blockquote 的 `>` 前缀），而当前包会将其去除。`list-item`、`blockquote`、`nested-blockquote`、`indented-marker` 和 `indented-content` 用例记录了这一点；块结构本身完全相同。",
    },
    {
      en: "An untitled diagram gets a different default alt text from each package (`PlantUML Diagram` vs `uml diagram`). Both are arbitrary fallbacks, so the current wording is normalized to the reference one before comparing; explicit titles are not normalized. Attribute order is normalized as well.",
      zh: "无标题图表的默认 alt 文本在两个包中不同（`PlantUML Diagram` 与 `uml diagram`）。两者都是任意选择的回退文案，因此比较前会把当前的文案归一化为参考包的文案；显式标题不做归一化。属性顺序也会归一化。",
    },
    {
      en: "Explicit titles differ by design: the current package uses the raw marker suffix (including the separating space after `@startuml`) and does not inline-parse it, while the reference drops that space and inline-parses the title, so emphasis and code markers disappear from its alt text. The `title`, `title-inline-markup` and `title-html` cases document this.",
      zh: "显式标题按设计不同：当前包使用原始的标记后缀（包括 `@startuml` 后的分隔空格）且不做行内解析，而参考包会去掉该空格并对标题做行内解析，因此强调和代码标记会从它的 alt 文本中消失。`title`、`title-inline-markup` 和 `title-html` 用例记录了这一点。",
    },
    {
      en: "The default renderer of each package is kept; only the `src` generator is replaced. Alt text, HTML escaping, block structure and the number of rendered images are therefore compared as produced by both plugins.",
      zh: "每个包的默认渲染器保持不变，只替换 `src` 生成器。因此 alt 文本、HTML 转义、块结构以及渲染出的图片数量都按两个插件实际产出的结果比较。",
    },
    {
      en: "Benchmarks run through the same deterministic renderers, so they measure parsing and markup generation only: the deflate + base64 encoders are bypassed on both sides and are not part of the throughput numbers. The `heavy` corpora contain many diagrams, so their ratios also reflect the reference's per-block document split described below. Corpora stay modest (normal ≈ 1/4/12 KB with one diagram per section, heavy ≈ 0.7/3/9 KB with four diagrams per section).",
      zh: "基准测试通过相同的确定性渲染器运行，因此只测量解析和标记生成：两侧的 deflate + base64 编码器都被绕过，不计入吞吐量。`heavy` 语料包含大量图表，因此其比值也反映了下文所述参考包按块切分文档的行为。语料保持较小规模（normal 约 1/4/12 KB，每节一个图表；heavy 约 0.7/3/9 KB，每节四个图表）。",
    },
    {
      en: "Scaling: the reference extracts every block with `state.src.split('\\n')`, so each diagram costs O(document size) and many diagrams cost O(blocks × document), i.e. quadratic (`many-diagrams`, and `unmatched-openers`, which places one unclosed marker inside every list item so each item auto-closes its own block). The current package slices only the block lines with `state.getLines` and stays linear in the number of diagrams. `long-diagram-body` is linear on both sides; no superlinear path was found in the current package. Encoding cost is excluded from all series.",
      zh: "伸缩性：参考包用 `state.src.split('\\n')` 提取每个块，因此每个图表的开销为 O(文档大小)，大量图表的开销为 O(块数 × 文档大小)，即二次（`many-diagrams`，以及 `unmatched-openers`，后者在每个列表项中放置一个未闭合标记，使每个列表项各自自动闭合一个块）。当前包只用 `state.getLines` 切取块所在行，在图表数量上保持线性。`long-diagram-body` 在双方都是线性；当前包未发现超线性路径。所有序列都不计入编码开销。",
    },
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
  testSuiteSkips: [
    {
      file: "customBase64.spec.ts",
      name: "",
      why: {
        en: "Tests this package's internal PlantUML base64 encoder (`../src/customBase64.js`), an implementation helper that the reference replaces with its own deflate encoder; it is not part of the compared plugin behavior.",
        zh: "测试本包内部的 PlantUML base64 编码器（`../src/customBase64.js`），参考包用自带的 deflate 编码器替代了它；它不属于被对比的插件行为。",
      },
    },
    {
      file: "deflate-browser.spec.ts",
      name: "",
      why: {
        en: "Tests this package's internal browser deflate implementation (`../src/deflate/browser.js`), a build/packaging helper with no reference counterpart.",
        zh: "测试本包内部的浏览器 deflate 实现（`../src/deflate/browser.js`），它是构建/打包辅助模块，参考包没有对应实现。",
      },
    },
    {
      file: "plantuml.spec.ts",
      name: "should parse custom uml",
      why: {
        en: "Uses this fork's `name` option to switch the markers to `@startjson`/`@endjson`; the reference has no `name` option for custom diagram markers, so the assertion only exercises a fork-only option shape.",
        zh: "使用本 fork 的 `name` 选项把标记切换为 `@startjson`/`@endjson`；参考包没有用于自定义图表标记的 `name` 选项，因此该断言只覆盖 fork 专有的选项形式。",
      },
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
      note: {
        en: "The current package strips the list indentation from the diagram source, while the reference keeps the two leading spaces of the content line. The rendered list and `<img>` structure are identical.",
        zh: "当前包会从图表源中去掉列表缩进，而参考包保留内容行的两个前导空格。渲染出的列表和 `<img>` 结构完全相同。",
      },
    },
    {
      name: "blockquote",
      markdown: "> @startuml\n> Bob -> Alice : hello\n> @enduml",
      note: {
        en: "The reference slices `state.src` without removing blockquote markers, so the `>` prefix leaks into the diagram source; the current package dedents the quoted lines. The blockquote structure is identical.",
        zh: "参考包直接切取 `state.src`，未移除 blockquote 标记，因此 `>` 前缀会泄漏到图表源中；当前包会对引用行做 dedent。blockquote 结构完全相同。",
      },
    },
    {
      name: "nested-blockquote",
      markdown: "> > @startuml\n> > Bob -> Alice : hello\n> > @enduml",
      note: {
        en: "Same cause as `blockquote`: the reference keeps every `>` prefix in the diagram source, while the current package strips both quote levels. The nested blockquote structure is identical.",
        zh: "原因与 `blockquote` 相同：参考包在图表源中保留每个 `>` 前缀，而当前包会去掉两层引用标记。嵌套 blockquote 结构完全相同。",
      },
    },
    {
      name: "indented-marker",
      markdown: "  @startuml\n  Bob -> Alice : hello\n  @enduml",
      note: {
        en: "Both sides accept the two-space indented marker, but the reference keeps the indentation of the content line in the diagram source and the current package strips it with `dedent`.",
        zh: "双方都接受两空格缩进的标记，但参考包在图表源中保留内容行的缩进，当前包则用 `dedent` 将其去掉。",
      },
    },
    {
      name: "indented-content",
      markdown: "@startuml\n  Alice -> Bob\n    note right\n  Bob -> Carol\n@enduml",
      note: {
        en: "The current package removes the common indentation of the diagram body, while the reference keeps every line as written. The relative indentation is preserved by `dedent`, so the drawing itself is unchanged.",
        zh: "当前包会移除图表主体的公共缩进，而参考包按原样保留每一行。`dedent` 保留了相对缩进，因此图形本身不变。",
      },
    },
    {
      name: "title",
      markdown: "@startuml My title\nBob -> Alice : hello\n@enduml",
      note: {
        en: "The current package uses the raw marker suffix as alt, including the separating space after `@startuml`; the reference removes that space and inline-parses the title.",
        zh: "当前包把原始标记后缀作为 alt，包括 `@startuml` 后的分隔空格；参考包会去掉该空格并对标题做行内解析。",
      },
    },
    {
      name: "title-inline-markup",
      markdown: "@startuml **Flow** chart\nBob -> Alice : hello\n@enduml",
      note: {
        en: "Besides the separating space, the reference inline-parses the title, so `**Flow**` becomes `Flow` in alt; the current package keeps the raw markers.",
        zh: "除了分隔空格外，参考包还会对标题做行内解析，因此 `**Flow**` 在 alt 中变为 `Flow`；当前包保留原始标记。",
      },
    },
    {
      name: "title-html",
      markdown: "@startuml <b>Flow</b> chart\nBob -> Alice : hello\n@enduml",
      note: {
        en: "Only the separating space differs: the reference inline-parses `<b>` but keeps it as text in the alt attribute, so both sides end up with the same escaped HTML.",
        zh: "只有分隔空格不同：参考包会行内解析 `<b>`，但在 alt 属性中将其保留为文本，因此双方最终得到相同的转义 HTML。",
      },
    },
    {
      name: "closing-marker-indented",
      markdown: "@startuml\nBob -> Alice : hello\n  @enduml",
      note: {
        en: "Both sides reject a closing marker that is indented deeper than the opening one, keep the line as diagram content and auto-close the block at the end of the document.",
        zh: "双方都拒绝比开始标记缩进更深的结束标记，将该行保留为图表内容，并在文档末尾自动闭合该块。",
      },
    },
    {
      name: "closing-marker-trailing-text",
      markdown: "@startuml\nBob -> Alice : hello\n@enduml extra",
      note: {
        en: "Both sides require the closing marker line to contain only spaces after the marker, so the line stays in the diagram source and the block is auto-closed at the end of the document.",
        zh: "双方都要求结束标记行在标记之后只包含空格，因此该行会留在图表源中，并在文档末尾自动闭合该块。",
      },
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
