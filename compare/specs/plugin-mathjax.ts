import { sortAttributes } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Generated per-formula wrapper of the reference output: `<span id="mjx-<hash>"><style>…</style>` */
const REFERENCE_FORMULA_OPEN = /\s*<span id="mjx-[0-9a-z]+">\s*<style>[\s\S]*?<\/style>\s*/gu;

/** One rendered formula container of either implementation */
const FORMULA_CONTAINER = /<mjx-container\b[^>]*>[\s\S]*?<\/mjx-container>/gu;

/** Assistive MathML emitted inside a formula container */
const ASSISTIVE_MATHML = /<mjx-assistive-mml\b[^>]*>(?<mathml>[\s\S]*?)<\/mjx-assistive-mml>/u;

/** `<pre>` blocks, whose whitespace is meaningful */
const PRE_BLOCK = /(?<pre><pre\b[\s\S]*?<\/pre>)/gu;

/**
 * Collapse HTML whitespace, leaving `<pre>` content untouched
 *
 * @param html - Rendered HTML
 * @returns HTML with collapsed whitespace
 */
const collapseWhitespaceOutsidePre = (html: string): string =>
  html
    .split(PRE_BLOCK)
    .map((part, index) => (index % 2 === 0 ? part.replaceAll(/\s+/gu, " ") : part))
    .join("");

/**
 * Replace one formula container by a canonical marker holding its assistive MathML
 *
 * @param container - `<mjx-container>` output of one formula
 * @returns Canonical formula marker
 */
const formulaToMarker = (container: string): string => {
  // `display="true"` marks block math on the container of both implementations
  const display = /^<mjx-container\b[^>]*\sdisplay="true"/u.test(container);
  const mathml = (ASSISTIVE_MATHML.exec(container)?.groups?.mathml ?? "")
    // MathJax 4 metadata (`data-latex`, `data-mjx-*`, `data-break-align`)
    .replaceAll(/\sdata-[\w-]+="[^"]*"/gu, "")
    // MathJax 4 emits presentational `<mstyle>` wrappers for alignment/script level
    .replaceAll(/<\/?mstyle\b[^>]*>/gu, "");

  return `<math-formula kind="${display ? "display" : "inline"}">${mathml}</math-formula>`;
};

/**
 * Normalize the rendered output of both implementations
 *
 * The reference wraps every formula in a generated `<span id="mjx-<hash>">` holding the full SVG
 * stylesheet inline, while the current package returns the stylesheet once through
 * `getMathjax(md).outputStyle()`. Both sides render with different MathJax majors and font
 * packages, so the SVG path data is presentational; the assistive MathML of every formula is
 * compared instead.
 *
 * @param html - Rendered HTML
 * @returns Normalized HTML
 */
const normalizeMathjaxOutput = (html: string): string => {
  let result = html
    .replaceAll(REFERENCE_FORMULA_OPEN, " ")
    .replaceAll(FORMULA_CONTAINER, formulaToMarker)
    // Closing tag of the reference wrapper, now empty
    .replaceAll(/(?<formula><\/math-formula>)\s*<\/span>/gu, "$<formula>");

  result = collapseWhitespaceOutsidePre(result);
  // The reference template pads every formula with newlines; that padding is not content
  result = result.replaceAll(
    /\s*(?<formula><math-formula\b[^>]*>[\s\S]*?<\/math-formula>)\s*/gu,
    "$<formula>",
  );
  result = sortAttributes(result);

  return result.trim();
};

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    targetMs: 100,
    file: `corpora/plugin-mathjax/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-mathjax",
  reference: "markdown-it-mathjax3",
  notes: [
    {
      en: "The synchronous entry is compared (`installSyncMathjax`, also exported as `mathjax`): the reference renders synchronously and the async entry of the current package exposes a different API (it takes a MathJax instance instead of plugin options). The sync entry renders MathJax in a worker thread and blocks on one IPC round-trip per document (plus one reset round-trip); the reference typesets in-process through `deasync`.",
      zh: "对比的是同步入口（`installSyncMathjax`，也以 `mathjax` 导出）：参考包同步渲染，而当前包的异步入口暴露的是另一套 API（它接收 MathJax 实例而不是插件选项）。同步入口在工作线程中渲染 MathJax，并按文档阻塞一次 IPC 往返（外加一次重置往返）；参考包则通过 `deasync` 在进程内排版。",
    },
    {
      en: 'Equivalent options: `{ output: "svg" }` (the current default) matches the reference, which only produces SVG. Both sides use `$` / `$$` delimiters only (`delimiters: "dollars"`, `mathFence: false`, `allowInlineWithSpace: false`) and render assistive MathML by default (`a11y: true`). The default `renderStrategy: "batch"` converts every formula of a document (one worker batch), the same number of MathJax conversions as the reference performs per formula.',
      zh: '等价选项：`{ output: "svg" }`（当前包的默认值）与参考包匹配，后者只生成 SVG。双方都只使用 `$` / `$$` 定界符（`delimiters: "dollars"`、`mathFence: false`、`allowInlineWithSpace: false`），并默认渲染辅助 MathML（`a11y: true`）。默认的 `renderStrategy: "batch"` 会一次转换文档中的所有公式（一个 worker 批次），与参考包逐公式执行的 MathJax 转换次数相同。',
    },
    {
      en: 'Normalization: the reference wraps every formula in `<span id="mjx-<hash>"><style>…full MathJax stylesheet…</style> formula </span>`. The id and the inlined CSS are generated per formula (the current package returns the stylesheet once through `getMathjax(md).outputStyle()`), so the wrapper and its template whitespace are normalized away.',
      zh: '归一化：参考包把每个公式包在 `<span id="mjx-<hash>"><style>…完整 MathJax 样式表…</style> formula </span>` 中。id 和内联 CSS 是按公式生成的（当前包通过 `getMathjax(md).outputStyle()` 只返回一次样式表），因此该包装器及其模板空白会被归一化掉。',
    },
    {
      en: "Normalization: formulas are compared by their assistive MathML instead of the SVG, because the current package renders with MathJax 4 (`@mathjax/src` + the newcm font) while the reference bundles MathJax 3 (`mathxyjax3`'s `tex-svg-full`). SVG paths, widths and `viewBox` values therefore differ by font version by design. Generated `data-*` metadata attributes and presentational `<mstyle>` wrappers are dropped; the MathML tree, its text and MathJax error content stay visible.",
      zh: "归一化：公式改为比较其辅助 MathML，而不是 SVG，因为当前包使用 MathJax 4（`@mathjax/src` + newcm 字体）渲染，而参考包捆绑的是 MathJax 3（`mathxyjax3` 的 `tex-svg-full`）。因此 SVG 路径、宽度和 `viewBox` 值按设计会因字体版本而不同。生成的 `data-*` 元数据属性和表现性的 `<mstyle>` 包装器会被移除；MathML 树、其文本以及 MathJax 错误内容仍然保留可见。",
    },
    {
      en: "The reference duplicates its whole stylesheet inside every formula (about 4 KiB per formula), which is why its raw output is much larger per formula; that is a known output-size difference of the reference wrapper, not a rendering difference.",
      zh: "参考包在每个公式中重复整份样式表（每个公式约 4 KiB），这就是它每个公式的原始输出大得多的原因；这是参考包包装器的已知输出体积差异，不是渲染差异。",
    },
    {
      en: "Scaling series: `inline-formulas`, `unmatched-dollars` and `block-fences` check the delimiter scans of the reference (its `math_inline` rescan of `$` candidates and the block loop over `$$` fences); all three fit an exponent near 1 on both sides. `unclosed-block` targets the reference's `math_block` rule: without a closing `$$` it still pushes a display-math token that swallows the rest of the document, so MathJax lays out the whole remaining file as one formula and the measured cost grows superlinearly (fitted exponent ~1.4-1.5), while the current package falls back to a paragraph and stays linear.",
      zh: "伸缩序列：`inline-formulas`、`unmatched-dollars` 和 `block-fences` 检查参考包的定界符扫描（其 `math_inline` 对 `$` 候选的重新扫描，以及针对 `$$` 围栏的块循环）；三者在双方拟合出的指数都接近 1。`unclosed-block` 针对参考包的 `math_block` 规则：没有结束的 `$$` 时，它仍会推入一个吞掉文档剩余部分的显示公式 token，于是 MathJax 把整个剩余文件排版成一个公式，测得的开销呈超线性增长（拟合指数约 1.4-1.5），而当前包回退为段落并保持线性。",
    },
  ],
  variants: [
    {
      id: "sync",
      ourExport: "installSyncMathjax",
      referenceExport: "default",
      ourOptions: { output: "svg" },
      referenceOptions: {},
    },
  ],
  normalize: normalizeMathjaxOutput,
  testSuiteExports: { mathjax: "default" },
  issues: [
    {
      id: "inline-word-boundary",
      category: "reference-error",
      note: {
        en: "The reference delimiter check only rejects spaces and trailing digits, so it parses math next to word characters (`a$x$b`); the current package requires non-word characters around both `$` delimiters so currency and word-embedded dollars stay literal.",
        zh: "参考包的分隔符检查只排除空格和紧随的数字，因此会把紧邻单词字符的 `$` 解析为公式（`a$x$b`）；当前包要求两个 `$` 两侧均为非单词字符，以免货币金额和单词内的 `$` 被解析。",
      },
    },
    {
      id: "block-swallow",
      category: "reference-error",
      note: {
        en: "The reference `$$` block rule emits a display formula even without a closing fence or with trailing content on the line, swallowing the rest of the document/line into the formula; the current package only opens a block when a closing `$$` exists and keeps trailing content as a paragraph.",
        zh: "参考包的 `$$` 块规则在没有闭合围栏或行尾仍有内容时也会输出显示公式，把文档/该行剩余内容吞入公式；当前包只在存在闭合 `$$` 时开启块，并让行尾内容保持为段落。",
      },
    },
    {
      id: "inline-literal-gap",
      category: "reference-error",
      note: {
        en: "The reference inline rule gives up on the whole formula at the first `$` that cannot close (such as a whitespace-surrounded `$` inside `\\text{…}`) and leaves the line literal; the current package treats it as literal TeX content and keeps scanning for the closing `$`.",
        zh: "参考包的行内规则在遇到第一个无法闭合的 `$`（例如 `\\text{…}` 中被空白包围的 `$`）时就放弃整个公式并保留字面文本；当前包将其视为字面 TeX 内容并继续扫描闭合 `$`。",
      },
    },
    {
      id: "mathml-text-split",
      category: "difference",
      note: {
        en: "`\\tag{1}` is laid out identically, but MathJax 4 splits the tag into one `<mtext>` per character in the assistive MathML while MathJax 3 emits a single `<mtext>(1)</mtext>`; only the MathML text-node representation differs.",
        zh: "`\\tag{1}` 的排版结果相同，但在辅助 MathML 中 MathJax 4 把标签拆成每个字符一个 `<mtext>`，而 MathJax 3 输出单个 `<mtext>(1)</mtext>`；仅 MathML 文本节点的表示不同。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "a11y.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Tests the fork-only async MathJax API (`createMathjaxInstance`) and its assistive-MathML switch; the reference only exposes the synchronous plugin.",
        zh: "测试 fork 专有的异步 MathJax API（`createMathjaxInstance`）及其辅助 MathML 开关；参考包只提供同步插件。",
      },
    },
    {
      file: "font.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Tests custom SVG/CHTML font data through the fork-only async API; the reference has no async instance or font-data option.",
        zh: "通过 fork 专有的异步 API 测试自定义 SVG/CHTML 字体数据；参考包没有异步实例或字体数据选项。",
      },
    },
    {
      file: "html.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Tests CHTML output through the fork-only async API; the reference is a synchronous SVG-only plugin.",
        zh: "通过 fork 专有的异步 API 测试 CHTML 输出；参考包是只输出 SVG 的同步插件。",
      },
    },
    {
      file: "svg.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Tests SVG output through the fork-only async API; the reference is a synchronous plugin without `createMathjaxInstance`.",
        zh: "通过 fork 专有的异步 API 测试 SVG 输出；参考包是同步插件，没有 `createMathjaxInstance`。",
      },
    },
    {
      file: "session.spec.ts",
      name: "",
      category: "internal",
      why: {
        en: "Tests the internal `createSession` module, which only exists in this fork; the reference has no session abstraction.",
        zh: "测试本 fork 独有的内部 `createSession` 模块；参考包没有会话抽象。",
      },
    },
    {
      file: "tex.spec.ts",
      name: "",
      category: "internal",
      why: {
        en: "Tests the internal TeX package resolver (`../src/tex/`); the reference has no equivalent module.",
        zh: "测试内部 TeX 宏包解析器（`../src/tex/`）；参考包没有等价模块。",
      },
    },
    {
      file: "tex-packages.spec.ts",
      name: "",
      category: "internal",
      why: {
        en: "Tests the internal TeX package list and loaders (`../src/tex/`), which have no reference counterpart.",
        zh: "测试内部 TeX 宏包列表与加载器（`../src/tex/`），参考包没有对应实现。",
      },
    },
    {
      file: "security.spec.ts",
      name: "html TeX package gating (async)",
      category: "feature-gap",
      why: {
        en: "Tests HTML/TeX package gating through the fork-only async API; the reference only exposes the synchronous plugin. The sync gating tests stay counted.",
        zh: "通过 fork 专有的异步 API 测试 HTML/TeX 宏包门控；参考包只提供同步插件。同步门控测试仍计入统计。",
      },
    },
    {
      file: "state.spec.ts",
      name: "mathjax state isolation async",
      category: "feature-gap",
      why: {
        en: "Tests TeX state isolation of the fork-only async API; the reference has no async instance whose reset behavior could be compared. The sync state tests stay counted.",
        zh: "测试 fork 专有异步 API 的 TeX 状态隔离；参考包没有可对比 reset 行为的异步实例。同步状态测试仍计入统计。",
      },
    },
    {
      file: "state.spec.ts",
      name: "mathjax state isolation sync reset and clearStyle should not throw",
      category: "internal",
      why: {
        en: "Only asserts that the internal `reset`/`clearStyle` helpers of `getMathjax` do not throw; the reference exposes no state helper object.",
        zh: "仅断言 `getMathjax` 的内部 `reset`/`clearStyle` 辅助方法不抛错；参考包不提供状态辅助对象。",
      },
    },
  ],
  correctness: [
    { name: "inline-simple", markdown: "Inline $x^2$ math." },
    {
      name: "inline-tex-commands",
      markdown: String.raw`$\sum_{i=1}^{n} i^2$ and $\int_0^1 x\,dx$`,
    },
    { name: "inline-frac", markdown: String.raw`Text with $\frac{a}{b}$ and $\alpha$.` },
    { name: "inline-text", markdown: String.raw`$\text{hello world}$` },
    { name: "inline-mhchem", markdown: String.raw`$\ce{H2O}$` },
    { name: "display-fence", markdown: "$$\nx^2 + y^2 = z^2\n$$" },
    { name: "display-single-line", markdown: "$$x^2$$" },
    { name: "display-multi-formula", markdown: "$$\na\n$$\n\n$$\nb\n$$" },
    { name: "display-in-blockquote", markdown: "> $$\n> x\n> $$" },
    { name: "display-in-list", markdown: "- item\n\n  $$\n  x\n  $$" },
    { name: "no-math", markdown: "# Plain heading\n\nA plain paragraph with 100% plain text." },
    { name: "empty-document", markdown: "\n" },
    { name: "unmatched-inline", markdown: "Unmatched $x end." },
    { name: "escaped-dollar", markdown: String.raw`Escaped \$x\$ here.` },
    { name: "code-span", markdown: "`$x$` is code" },
    { name: "fence-code", markdown: "```\n$x$\n```" },
    { name: "math-fence-language", markdown: "```math\nx\n```" },
    { name: "tex-error", markdown: String.raw`Error $\frac{$ end.` },
    { name: "plain-dollar-currency", markdown: "Price $5 and $10 dollars." },
    {
      name: "tag-numbered",
      markdown: String.raw`$$\tag{1} x = y$$`,
      issue: "mathml-text-split",
    },
    {
      name: "inline-adjacent-word",
      markdown: "a$x$b",
      issue: "inline-word-boundary",
    },
    {
      name: "block-unclosed",
      markdown: "$$\nunclosed block\n",
      issue: "block-swallow",
    },
    {
      name: "block-trailing-inline",
      markdown: "$$a=1$$ and $b=2$",
      issue: "block-swallow",
    },
    {
      name: "escaped-backslash-dollar",
      markdown: String.raw`$a\\$b`,
      issue: "inline-word-boundary",
    },
    {
      name: "text-with-dollar",
      markdown: String.raw`$a \text{ $ b}$`,
      issue: "inline-literal-gap",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-formulas",
      sizes: [32, 64, 128, 256],
      build: (size) => "$x^2$ ".repeat(size),
    },
    {
      name: "unmatched-dollars",
      sizes: [1024, 2048, 4096, 8192],
      build: (size) => "$1 ".repeat(size),
    },
    {
      name: "block-fences",
      sizes: [32, 64, 128, 256],
      build: (size) => "$$\nx\n$$\n\n".repeat(size),
    },
    {
      name: "unclosed-block",
      sizes: [256, 512, 1024, 2048],
      build: (size) => `$$\n${"text line\n".repeat(size)}`,
    },
  ],
});

export default spec;
