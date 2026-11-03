import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";

import { resolvePlugin } from "../loader.ts";
import type { CompareRenderer, ComparisonSpec, PluginModule } from "../types.ts";
import { defineComparison } from "../types.ts";

/**
 * Serialize one token and its inline children into a stable string
 *
 * Math token content is trimmed at the edges: the reference keeps the leading whitespace of the
 * first block line and drops the trailing newline, while the current package keeps the trailing
 * newline and the untrimmed first line. KaTeX receives the same formula either way, so only the
 * edge formatting is normalized here.
 *
 * @param tokens - Tokens to serialize
 * @param indent - Indentation of the current nesting level
 * @returns Comparable token description
 */
const serializeTokens = (tokens: readonly Token[], indent = ""): string =>
  tokens
    .map((token) => {
      const content = token.type.startsWith("math_") ? token.content.trim() : token.content;
      const markup = token.markup ? `{${token.markup}}` : "";
      const line = `${indent}${token.type}${markup}:${JSON.stringify(content)}`;

      return token.children ? `${line}\n${serializeTokens(token.children, `${indent}  `)}` : line;
    })
    .join("\n");

/**
 * Deterministic stub renderer for the required `render` option
 *
 * The comparison never reaches a renderer: the token stream is compared right after parsing.
 *
 * @param content - Tex content
 * @param displayMode - Whether the formula is display mode
 * @returns Stable placeholder
 */
const stubRender = (content: string, displayMode: boolean): string =>
  displayMode ? `\\[${content}\\]` : `\\(${content}\\)`;

/**
 * Create a renderer that compares the parsed token stream instead of rendered output
 *
 * `@mdit/plugin-tex` is a fork of `markdown-it-katex` with a pluggable renderer, so the two plugins
 * cannot be compared through their rendered HTML: the current package requires a `render` option
 * and the reference always renders with KaTeX. Both sides are parsed with the same markdown-it core
 * and the resulting token stream (including text tokens, so literal `$` handling is compared too)
 * is serialized instead.
 *
 * @param module - Loaded plugin module
 * @param exportName - Plugin export name
 * @param options - Options passed to the plugin
 * @returns A renderer that parses markdown and dumps the token stream
 */
const createTokenRenderer = (
  module: PluginModule,
  exportName: string,
  options?: unknown,
): CompareRenderer => {
  const plugin = resolvePlugin(module, exportName);
  const md = new MarkdownIt();

  md.use(plugin, options);

  return (markdown) => serializeTokens(md.parse(markdown, {}));
};

/** Benchmark cases, one per committed corpus file */
const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    targetMs: 100,
    file: `corpora/plugin-tex/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-tex",
  reference: "markdown-it-katex",
  normalize: (output) => output,
  notes: [
    {
      en: "`@mdit/plugin-tex` is a fork of `markdown-it-katex` with a pluggable renderer and a required `render` option, so rendered output is not comparable: the reference always renders KaTeX HTML while this package delegates rendering. Both sides are compared on the parsed token stream instead (token type, markup, content, and text tokens, so differences in literal `$` handling are visible).",
      zh: "`@mdit/plugin-tex` 是 `markdown-it-katex` 的分支，渲染器可插拔且必须提供 `render` 选项，因此无法比较渲染输出：参考包始终渲染 KaTeX HTML，而当前包把渲染委托出去。两侧改为比较解析后的 token 流（token 类型、markup、content 以及文本 token，因此字面量 `$` 处理上的差异可见）。",
    },
    {
      en: "The required `render` option of the current package is set to a deterministic stub (`\\(...\\)` / `\\[...\\]`). It is never invoked because the comparison reads the parsed tokens instead of rendering them, so no real KaTeX work happens on either side.",
      zh: "当前包必需的 `render` 选项被设为一个确定性的桩函数（`\\(...\\)` / `\\[...\\]`）。由于比较读取的是解析后的 token 而非渲染结果，该函数从未被调用，两侧都不会执行真正的 KaTeX 计算。",
    },
    {
      en: "Math token content is compared after trimming edge whitespace. The reference trims the first line of a block formula and drops the trailing newline, while the current package preserves both; both implementations pass the same formula payload to their renderer, so the edge formatting is not a behavioral difference and the case `block-edge-space` is reported as an exact match.",
      zh: "数学 token 的内容在去掉首尾空白后比较。参考包会裁掉块级公式首行的空白并丢弃末尾换行，当前包则两者都保留；两种实现传给渲染器的公式载荷相同，因此边缘格式不属于行为差异，`block-edge-space` 用例被报告为完全一致。",
    },
    {
      en: "Edge formatting aside, the token streams match on inline math, `$$` fences, escaping, unmatched delimiters, an effectively empty document, and markdown constructs that must not be parsed as math (code spans, fences). Labels are not implemented by either plugin, so no `math_block_label` tokens are compared.",
      zh: "除边缘格式外，两侧 token 流在行内公式、`$$` 围栏、转义、未匹配分隔符、实际为空的文档以及不应被解析为数学的 Markdown 结构（行内代码、围栏代码块）上完全一致。两个插件都未实现标签，因此没有比较 `math_block_label` token。",
    },
    {
      en: "Documented differences, inherited from the current fork's stricter delimiter rules: opening `$` needs a non-word character before it and closing `$` needs a non-word character after it (`$a$b`, `a$x$`), an inline `$` surrounded by whitespace inside a formula is treated as literal and scanning continues (`$\\text{a $ b}$`), a closing `$` may not be immediately followed by another `$` (`$a$$b$`), a single-line `$$...$$` followed by inline content is not a block (`$$a$$ tail`), and `$$` alone is not a math block.",
      zh: "已记录差异源自当前分支更严格的分隔符规则：开 `$` 前必须是单词字符以外的字符，闭 `$` 后必须是单词字符以外的字符（`$a$b`、`a$x$`）；公式内被空白包围的行内 `$` 视为字面量并继续扫描（`$\\text{a $ b}$`）；闭 `$` 后不能紧跟另一个 `$`（`$a$$b$`）；单行 `$$...$$` 后接行内内容时不构成块（`$$a$$ tail`）；单独的 `$$` 不是数学块。",
    },
    {
      en: "Fork-only behavior is not compared because the reference has no equivalent option: bracket delimiters (`\\(...\\)` / `\\[...\\]`), `mathFence` (```` ```math ````), `allowInlineWithSpace`, and the `render` callback itself.",
      zh: "以下仅当前分支具备的行为因参考包没有对应选项而不参与比较：方括号分隔符（`\\(...\\)` / `\\[...\\]`）、`mathFence`（```` ```math ````）、`allowInlineWithSpace` 以及 `render` 回调本身。",
    },
    {
      en: "Benchmarks measure parsing only on both sides (the stub renderer is never called and the reference renderer is not invoked), so the two sides do the same work. The corpora stay small on purpose: 24 inline formulas for `normal/large` and 24 inline plus 8 display formulas for `heavy/large`.",
      zh: "基准测试在两侧都只测量解析（桩渲染器从不被调用，参考包的渲染器也不会被调用），因此两侧做的工作相同。语料刻意保持较小：`normal/large` 含 24 个行内公式，`heavy/large` 含 24 个行内公式和 8 个块级公式。",
    },
    {
      en: "Scaling series probe the delimiter scanners: many unmatched `$$` fence lines (the paragraph terminator probes the block rule once per line; the current package memoizes unsuccessful closing-marker look-aheads and stays linear, while the reference short-circuits in silent mode and then consumes the rest of the document as a single block), many inline formulas, and many closed multi-line `$$` fences (the reference re-scans the document prefix to find the closing line).",
      zh: "扩展性系列针对分隔符扫描器：大量未匹配的 `$$` 围栏行（段落终止判断每行都会探测一次块级规则；当前包会缓存失败的闭合标记前瞻并保持线性，而参考包在 silent 模式下提前返回，随后把文档剩余部分当作单个块消费）、大量行内公式，以及大量成对的跨行 `$$` 围栏（参考包会重新扫描文档前缀以寻找闭合行）。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "tex",
      referenceExport: "default",
      ourOptions: { render: stubRender },
      referenceOptions: {},
      createOurRenderer: (module) => createTokenRenderer(module, "tex", { render: stubRender }),
      createReferenceRenderer: (module) => createTokenRenderer(module, "default", {}),
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      why: {
        en: "Asserts this fork's installation bookkeeping: the registered rule names, that repeated `.use(tex)` calls keep the first renderer and `render` function, and the validation order of the required `render` option. The reference installs a different rule set without these guards, so the whole file only covers internal installation behavior.",
        zh: "断言本 fork 的安装簿记：注册的规则名、重复调用 `.use(tex)` 时保留首次渲染器与 `render` 函数，以及必需 `render` 选项的校验顺序。参考包安装的是另一套规则且没有这些守卫，因此整个文件只覆盖内部安装行为。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "config should require render option",
      why: {
        en: "Only asserts that the fork's required `render` option throws when omitted; the reference has no `render` option and never validates it, so the assertion can neither pass nor describe reference behavior.",
        zh: "只断言本 fork 必需的 `render` 选项在缺省时抛错；参考包没有 `render` 选项也不会校验它，因此该断言既无法通过，也无法描述参考行为。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "allowSpace mode",
      why: {
        en: "Covers the fork-only `allowInlineWithSpace` mode, which relaxes the delimiter boundary checks. The reference has no such mode, so these cases only exercise an option it does not provide.",
        zh: "覆盖仅本 fork 提供的 `allowInlineWithSpace` 模式，它放宽了分隔符边界检查。参考包没有该模式，因此这些用例只覆盖了它不提供的选项。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "bracket mode",
      why: {
        en: "Covers the fork-only bracket delimiters (`\\(...\\)` and `\\[...\\]`); the reference implements no bracket syntax and treats those delimiters as plain text, so no reference behavior is exercised.",
        zh: "覆盖仅本 fork 提供的方括号分隔符（`\\(...\\)` 与 `\\[...\\]`）；参考包没有实现方括号语法，会把这些分隔符当作纯文本，因此没有覆盖到参考行为。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "should render math fence",
      why: {
        en: "Covers the fork-only `mathFence` option: the reference has no math-fence rule and renders a `math` fenced block as an ordinary code fence.",
        zh: "覆盖仅本 fork 提供的 `mathFence` 选项：参考包没有数学围栏规则，会把 `math` 围栏块渲染为普通代码围栏。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "should handle math fence with spaces in info",
      why: {
        en: "Same fork-only `mathFence` option: the reference keeps the fence as a code block and has no math-fence info-string handling.",
        zh: "同样是仅本 fork 提供的 `mathFence` 选项：参考包把围栏保留为代码块，也没有数学围栏 info 字符串的处理。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "should handle coverage edge cases for bracket rules",
      why: {
        en: "Covers edge cases of the fork-only bracket block rule; the reference does not implement bracket delimiters at all.",
        zh: "覆盖仅本 fork 提供的方括号块级规则的边界情况；参考包完全没有实现方括号分隔符。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "should handle silent mode for inline rules",
      why: {
        en: "The dollar assertions pass; the failure comes only from the bracket assertions (`\\(a=1\\)`), a fork-only syntax the reference leaves as text.",
        zh: "美元分隔符断言均通过；失败只来自方括号断言（`\\(a=1\\)`），这是参考包不解析、仅本 fork 提供的语法。",
      },
    },
    {
      file: "tex.spec.ts",
      name: String.raw`both syntaxes: \(`,
      why: {
        en: "The `\\(a=1\\)` half of the both-delimiter mode; the reference has no bracket syntax, so only the fork-only delimiter is exercised. The dollar cases of the same describe stay counted.",
        zh: "双分隔符模式中的 `\\(a=1\\)` 部分；参考包没有方括号语法，因此只覆盖了本 fork 专有的分隔符。同一 describe 中的美元用例仍计入统计。",
      },
    },
    {
      file: "tex.spec.ts",
      name: String.raw`both block syntaxes: \[`,
      why: {
        en: "The `\\[a=1\\]` half of the both-delimiter block mode; the reference never parses bracket blocks, so only the fork-only delimiter is exercised. The dollar cases of the same describe stay counted.",
        zh: "双分隔符块级模式中的 `\\[a=1\\]` 部分；参考包从不解析方括号块，因此只覆盖了本 fork 专有的分隔符。同一 describe 中的美元用例仍计入统计。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should continue a tab-indented bracket block in a list item",
      why: {
        en: "Uses the fork-only bracket block syntax (`\\[...\\]`); the reference leaves it as a paragraph, so no `math_block` token content exists to compare.",
        zh: "使用仅本 fork 提供的方括号块语法（`\\[...\\]`）；参考包把它当作段落，因此没有可对比的 `math_block` token 内容。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should preserve trailing whitespace in bracket blocks",
      why: {
        en: "Uses the fork-only bracket block syntax (`\\[...\\]`); the reference does not produce a block token for it, so the trailing-whitespace assertion cannot be compared.",
        zh: "使用仅本 fork 提供的方括号块语法（`\\[...\\]`）；参考包不会为其生成块级 token，因此无法对比尾随空白断言。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should handle trailing whitespace consistently for single-line blocks",
      why: {
        en: "The single-line `$$` assertion passes; only the `\\[a   \\]` half fails because the reference does not parse bracket blocks.",
        zh: "单行 `$$` 断言通过；只有 `\\[a   \\]` 部分失败，因为参考包不解析方括号块。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should end single-line and multi-line content with a newline",
      why: {
        en: "The `$$` assertions pass; only the `\\[...\\]` assertions fail because the reference does not parse bracket blocks.",
        zh: "`$$` 断言通过；只有 `\\[...\\]` 断言失败，因为参考包不解析方括号块。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should keep empty single-line and multi-line content empty",
      why: {
        en: "The `$$` assertions pass; only the `\\[...\\]` assertions fail because the reference does not parse bracket blocks.",
        zh: "`$$` 断言通过；只有 `\\[...\\]` 断言失败，因为参考包不解析方括号块。",
      },
    },
    {
      file: "block-silent.spec.ts",
      name: "should still split the paragraph when the block is closed",
      why: {
        en: "Uses the fork-only bracket block rule (`\\[...\\]`); the reference treats the block as paragraph text, so the silent-mode paragraph split cannot be compared.",
        zh: "使用仅本 fork 提供的方括号块规则（`\\[...\\]`）；参考包把该块当作段落文本，因此无法对比 silent 模式下的段落切分。",
      },
    },
    {
      file: "block-silent.spec.ts",
      name: "should still parse a closed multi-line block",
      why: {
        en: "Same fork-only bracket block rule: the reference never parses a `\\[ ... \\]` block, so the closed-block assertion cannot be compared.",
        zh: "同样是仅本 fork 提供的方括号块规则：参考包从不解析 `\\[ ... \\]` 块，因此无法对比闭合块断言。",
      },
    },
    {
      file: "posmax.spec.ts",
      name: "bracket delimiters should still parse inline tex inside link labels",
      why: {
        en: "The bracket variant of this posMax case; the reference does not implement bracket delimiters, so the link-label assertion only exercises fork-only syntax. The dollar variants stay counted.",
        zh: "该 posMax 用例的方括号变体；参考包没有实现方括号分隔符，因此链接标签断言只覆盖本 fork 专有语法。美元变体仍计入统计。",
      },
    },
    {
      file: "unclosed-block.spec.ts",
      name: String.raw`should still render a closed \[ block`,
      why: {
        en: "Only the fork-only bracket block syntax is tested here; the reference never parses `\\[...\\]` as math, so the closed-block assertion cannot be compared. The `$$` unclosed-block cases stay counted.",
        zh: "此处只测试仅本 fork 提供的方括号块语法；参考包从不把 `\\[...\\]` 解析为数学，因此无法对比闭合块断言。`$$` 未闭合块用例仍计入统计。",
      },
    },
  ],
  correctness: [
    { name: "inline-basic", markdown: "$a+b$" },
    { name: "inline-in-text", markdown: "The value $x^2$ is positive." },
    { name: "inline-multiple", markdown: "Given $a$ and $b$ and $c$, conclude." },
    { name: "inline-escaped-dollar", markdown: String.raw`A price of $\$5$ is cheap.` },
    { name: "inline-escaped-text", markdown: String.raw`Literal \$not math\$ delimiters.` },
    { name: "inline-word-price", markdown: "It costs $5 or $6 today, nothing more." },
    { name: "block-single-line", markdown: "$$a=1$$" },
    { name: "block-multiline", markdown: "$$\na+b\n$$" },
    { name: "block-empty-lines", markdown: "$$\n\n$$" },
    { name: "block-edge-space", markdown: "$$ a $$" },
    { name: "block-closing-content", markdown: "$$\na + b\nc = d $$" },
    { name: "block-in-document", markdown: "Before.\n\n$$\n\\frac{1}{2}\n$$\n\nAfter." },
    { name: "inline-in-emphasis", markdown: "*emphasized $x$ and $y$ here*" },
    { name: "inline-in-link", markdown: "[$x$](https://example.com)" },
    {
      name: "markdown-structure",
      markdown: "- item with $a$\n- item with $b$\n\n> quote with $c$",
    },
    { name: "code-not-math", markdown: "`$code$` and\n\n```tex\n$a$\n```" },
    { name: "no-math-baseline", markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b" },
    { name: "empty-document", markdown: "\n" },
    {
      name: "word-boundary-close",
      markdown: "$a$b",
      note: {
        en: "The current fork requires a non-word character after the closing `$`, so `$a$b` stays literal text; the reference closes the formula before `b`.",
        zh: "当前分支要求闭 `$` 后为非单词字符，因此 `$a$b` 保持为字面文本；参考包会在 `b` 之前闭合公式。",
      },
    },
    {
      name: "word-boundary-open",
      markdown: "a$x$",
      note: {
        en: "The current fork requires a non-word character before the opening `$`, so `a$x$` stays literal text; the reference parses the formula.",
        zh: "当前分支要求开 `$` 前为非单词字符，因此 `a$x$` 保持为字面文本；参考包会将其解析为公式。",
      },
    },
    {
      name: "adjacent-dollar-inline",
      markdown: "$a$$b$",
      note: {
        en: "The current fork never closes a formula when the closing `$` is immediately followed by another `$`, so the whole line stays literal; the reference parses `$a$` and `$b$` as two formulas.",
        zh: "当闭 `$` 后紧跟另一个 `$` 时，当前分支不会闭合公式，因此整行保持为字面文本；参考包会把 `$a$` 和 `$b$` 解析为两个公式。",
      },
    },
    {
      name: "literal-gap-inline",
      markdown: String.raw`$\text{a $ b}$`,
      note: {
        en: "The current fork treats a space-surrounded `$` inside a formula as literal content and keeps scanning for the closing delimiter; the reference gives up at the first `$` that cannot close and emits literal text.",
        zh: "当前分支将公式内被空格包围的 `$` 视为字面内容并继续扫描闭合分隔符；参考包在第一个无法闭合的 `$` 处放弃，并输出字面文本。",
      },
    },
    {
      name: "block-trailing-content",
      markdown: "$$a$$ tail",
      note: {
        en: "A single-line `$$...$$` followed by non-whitespace content is deliberately not treated as a block by the current fork (the trailing content stays a paragraph); the reference swallows the entire line into one display formula.",
        zh: "单行 `$$...$$` 后接非空白内容时，当前分支有意不将其视为块（后续内容仍为段落）；参考包会把整行吞入一个块级公式。",
      },
    },
    {
      name: "block-trailing-inline-math",
      markdown: "$$a$$ $b$",
      note: {
        en: "Same as `block-trailing-content`: the current fork falls back to a paragraph and parses `$b$` as inline math, while the reference emits one display formula containing the whole line.",
        zh: "与 `block-trailing-content` 相同：当前分支回退为段落并将 `$b$` 解析为行内公式，而参考包输出一个包含整行的块级公式。",
      },
    },
    {
      name: "empty-block-fence",
      markdown: "$$",
      note: {
        en: "The current fork only emits a math block when a closing `$$` exists; the reference emits an empty `math_block` token for a lone `$$`.",
        zh: "当前分支仅在存在闭合 `$$` 时输出数学块；参考包会为单独的 `$$` 输出一个空的 `math_block` token。",
      },
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "unmatched-block-fence",
      sizes: [128, 256, 512, 1024],
      build: (size) => "$$ a\n".repeat(size),
    },
    {
      name: "inline-formulas",
      sizes: [64, 128, 256, 512],
      build: (size) => "$x+1$ ".repeat(size),
    },
    {
      name: "multiline-block-fences",
      sizes: [64, 128, 256, 512],
      build: (size) => "$$\na = 1\n$$\n\n".repeat(size),
    },
  ],
});

export default spec;
