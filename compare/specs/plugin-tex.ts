import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";

import { resolvePlugin } from "../loader.ts";
import type { CompareRenderer, ComparisonNote, ComparisonSpec, PluginModule } from "../types.ts";
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

/** Why tests that assert our render callback output are skipped */
const renderCallbackWhy: ComparisonNote = {
  en: "Asserts the output of our required `render` callback; the reference always renders KaTeX and has no renderer hook.",
  zh: "断言本包必需的 `render` 回调输出；参考包始终渲染 KaTeX，没有渲染器钩子。",
};

/** Why bracket-delimiter tests cannot run against the reference */
const bracketWhy: ComparisonNote = {
  en: "Covers our bracket delimiters (`\\(...\\)` / `\\[...\\]`); the reference implements no bracket syntax.",
  zh: "覆盖本包的方括号分隔符（`\\(...\\)` / `\\[...\\]`）；参考包没有实现方括号语法。",
};

/** Why allow-space mode tests cannot run against the reference */
const allowSpaceWhy: ComparisonNote = {
  en: "Covers our `allowInlineWithSpace` option; the reference has no equivalent option.",
  zh: "覆盖本包的 `allowInlineWithSpace` 选项；参考包没有对应选项。",
};

/** Why math-fence tests cannot run against the reference */
const mathFenceWhy: ComparisonNote = {
  en: "Covers our `mathFence` option; the reference has no math-fence rule.",
  zh: "覆盖本包的 `mathFence` 选项；参考包没有数学围栏规则。",
};

/** Why the required-option test cannot run against the reference */
const renderOptionWhy: ComparisonNote = {
  en: "Covers our required `render` option and its validation; the reference always renders KaTeX and accepts no renderer.",
  zh: "覆盖本包必需的 `render` 选项及其校验；参考包始终渲染 KaTeX，不接受渲染器。",
};

/** Why installation tests cannot run against the reference */
const installInternalWhy: ComparisonNote = {
  en: "Asserts our rule names, renderer bookkeeping and repeat-install guards; the reference registers a different rule set.",
  zh: "断言本包的规则名、渲染器簿记与重复安装守卫；参考包注册的是另一套规则。",
};

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
      en: "The token-stream differences are grouped under five root causes: the reference ignores word boundaries around `$` (`$a$b`, `a$x$`), gives up on a `$` surrounded by whitespace inside a formula (`$\\text{a $ b}$`), swallows trailing content after a single-line `$$...$$` (`$$a$$ tail`), and emits an empty block for a lone `$$` — all reference errors — while refusing to close a formula before another `$` (`$a$$b$`) is our intentional stricter delimiter design and an accepted difference.",
      zh: "token 流差异归为五个根因：参考包忽略 `$` 两侧的单词边界（`$a$b`、`a$x$`）、在公式内被空白包围的 `$` 处放弃（`$\\text{a $ b}$`）、将单行 `$$...$$` 后的内容吞入块中（`$$a$$ tail`），并为单独的 `$$` 输出空块——这些都属参考包错误；而本分支在闭 `$` 后紧跟另一个 `$` 时不闭合（`$a$$b$`）是有意采用的更严格分隔符设计，属于可接受差异。",
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
  issues: [
    {
      id: "delimiter-word-boundary",
      category: "reference-error",
      note: {
        en: "The reference does not enforce word boundaries around `$`: it opens a formula after a word character (`a$x$`) and closes one before a word character (`$a$b`), so inline math is parsed inside words where the fork keeps literal text.",
        zh: "参考包不检查 `$` 两侧的单词边界：它会在单词字符后开启公式（`a$x$`）、在单词字符前闭合公式（`$a$b`），因此会在单词内部解析行内公式，而本分支保持字面文本。",
      },
    },
    {
      id: "literal-dollar-content",
      category: "reference-error",
      note: {
        en: "When a `$` inside a formula is surrounded by whitespace, the reference gives up on the whole expression and emits literal text; the fork treats that `$` as content and keeps scanning to the real closing delimiter.",
        zh: "当公式内的 `$` 两侧均为空白时，参考包会放弃整个表达式并输出字面文本；本分支把该 `$` 视为内容并继续扫描到真正的闭分隔符。",
      },
    },
    {
      id: "block-trailing-content",
      category: "reference-error",
      note: {
        en: "For a single-line `$$...$$` followed by more text, the reference swallows the rest of the line into one display formula; the fork keeps the text as a paragraph and still parses following inline math.",
        zh: "对于后面还有其他文本的单行 `$$...$$`，参考包会把该行剩余内容吞入一个块级公式；本分支将文本保留为段落，并继续解析后面的行内公式。",
      },
    },
    {
      id: "empty-block-fence",
      category: "reference-error",
      note: {
        en: "A lone `$$` is emitted by the reference as an empty `math_block` token; the fork only creates a block when a closing `$$` exists and keeps the lone marker as text.",
        zh: "参考包会为单独的 `$$` 输出空的 `math_block` token；本分支仅在存在闭合 `$$` 时创建块，并把单独的标记保留为文本。",
      },
    },
    {
      id: "adjacent-dollar",
      category: "difference",
      note: {
        en: "A closing `$` immediately followed by another `$` never closes in the fork, so `$a$$b$` stays literal; the reference parses two inline formulas. This is an intentional, stricter delimiter design.",
        zh: "本分支中闭 `$` 后紧跟另一个 `$` 时不会闭合，因此 `$a$$b$` 保持字面文本；参考包将其解析为两个行内公式。这是有意采用的更严格分隔符设计。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      category: "internal",
      why: installInternalWhy,
    },
    {
      file: "tex.spec.ts",
      name: "config should require render option",
      category: "feature-gap",
      why: renderOptionWhy,
    },
    {
      file: "tex.spec.ts",
      name: "allowSpace mode",
      category: "feature-gap",
      why: allowSpaceWhy,
    },
    {
      file: "tex.spec.ts",
      name: "bracket mode",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should render math fence",
      category: "feature-gap",
      why: mathFenceWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle math fence with spaces in info",
      category: "feature-gap",
      why: mathFenceWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle coverage edge cases for bracket rules",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle silent mode for inline rules",
      category: "feature-gap",
      why: {
        en: "The dollar assertions pass; only the bracket assertions fail, and the reference has no bracket syntax.",
        zh: "美元断言通过；只有方括号断言失败，因为参考包没有方括号语法。",
      },
    },
    {
      file: "tex.spec.ts",
      name: String.raw`both syntaxes: \(`,
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "tex.spec.ts",
      name: String.raw`both block syntaxes: \[`,
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "block-content.spec.ts",
      name: "should continue a tab-indented bracket block in a list item",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "block-content.spec.ts",
      name: "should preserve trailing whitespace in bracket blocks",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "block-content.spec.ts",
      name: "should handle trailing whitespace consistently for single-line blocks",
      category: "feature-gap",
      why: {
        en: "The `$$` assertions pass; only the bracket half fails because the reference has no bracket syntax.",
        zh: "`$$` 断言通过；只有方括号部分失败，因为参考包没有方括号语法。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should end single-line and multi-line content with a newline",
      category: "feature-gap",
      why: {
        en: "The `$$` assertions pass; only the bracket half fails because the reference has no bracket syntax.",
        zh: "`$$` 断言通过；只有方括号部分失败，因为参考包没有方括号语法。",
      },
    },
    {
      file: "block-content.spec.ts",
      name: "should keep empty single-line and multi-line content empty",
      category: "feature-gap",
      why: {
        en: "The `$$` assertions pass; only the bracket half fails because the reference has no bracket syntax.",
        zh: "`$$` 断言通过；只有方括号部分失败，因为参考包没有方括号语法。",
      },
    },
    {
      file: "block-silent.spec.ts",
      name: "should still split the paragraph when the block is closed",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "block-silent.spec.ts",
      name: "should still parse a closed multi-line block",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "posmax.spec.ts",
      name: "bracket delimiters should still parse inline tex inside link labels",
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "unclosed-block.spec.ts",
      name: String.raw`should still render a closed \[ block`,
      category: "feature-gap",
      why: bracketWhy,
    },
    {
      file: "tex.spec.ts",
      name: "inline tex rendering dollar mode basic rendering",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should not cross a link boundary when scanning for closing $",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle complex escape sequences",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "inline tex rendering both mode basic rendering",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "block tex rendering dollar mode basic rendering",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "block tex rendering dollar mode positioning and context",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should keep existing single-line block behavior",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "block tex rendering dollar mode unicode whitespace after closing marker",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "block tex rendering both mode basic rendering",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "mixed syntax in blocks",
      category: "feature-gap",
      why: {
        en: "Asserts our render callback output and uses bracket block syntax; the reference renders KaTeX and has no bracket syntax.",
        zh: "断言本包 `render` 回调输出并使用方括号块语法；参考包渲染 KaTeX 且没有方括号语法。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "should handle special characters in inline rendering",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should default to dollars when delimiters is not specified",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle text with math in link context",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle silent mode for block rules",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "tex.spec.ts",
      name: "should handle negative indent",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "unclosed-block.spec.ts",
      name: "should still render a closed $$ block",
      category: "feature-gap",
      why: renderCallbackWhy,
    },
    {
      file: "posmax.spec.ts",
      name: "dollar delimiters should still parse inline tex inside link labels",
      category: "feature-gap",
      why: renderCallbackWhy,
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
    { name: "word-boundary-close", markdown: "$a$b", issue: "delimiter-word-boundary" },
    { name: "word-boundary-open", markdown: "a$x$", issue: "delimiter-word-boundary" },
    { name: "adjacent-dollar-inline", markdown: "$a$$b$", issue: "adjacent-dollar" },
    {
      name: "literal-gap-inline",
      markdown: String.raw`$\text{a $ b}$`,
      issue: "literal-dollar-content",
    },
    { name: "block-trailing-content", markdown: "$$a$$ tail", issue: "block-trailing-content" },
    {
      name: "block-trailing-inline-math",
      markdown: "$$a$$ $b$",
      issue: "block-trailing-content",
    },
    { name: "empty-block-fence", markdown: "$$", issue: "empty-block-fence" },
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
