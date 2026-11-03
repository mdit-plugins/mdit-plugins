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

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-alert/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-alert",
  reference: "markdown-it-github-alerts",
  notes: [
    {
      en: "`deep: true` is enabled on the current package because the reference transforms every outermost blockquote after block parsing and therefore recognizes alerts at any nesting depth; the comparison covers nested blockquotes and alerts inside list items.",
      zh: "当前包启用了 `deep: true`，因为参考包在块解析后转换每个最外层 blockquote，从而能识别任意嵌套深度上的告警；对比覆盖了嵌套 blockquote 和列表项内的告警。",
    },
    {
      en: "The reference's default GitHub SVG icons are disabled with `icons: {}` because the current package has no icon option. This is a documented default-markup difference, not a normalization: with default options the reference title contains an inline `<svg>`, while the current title contains only text.",
      zh: "参考包默认的 GitHub SVG 图标通过 `icons: {}` 禁用，因为当前包没有图标选项。这是已记录的默认标记差异，而非归一化：使用默认选项时，参考包的标题包含内联 `<svg>`，当前包的标题则只包含文本。",
    },
    {
      en: "`deep: true` and `icons: {}` were measured to be irrelevant for the throughput gap: enabling `deep` costs about 1.6% only on the heavy corpus (one nested alert per unit) and 0% on the normal corpus, and disabling the reference icons changes the reference throughput by about 0.2%. The benchmark difference therefore follows the implementations, not the option mapping.",
      zh: "经测量，`deep: true` 和 `icons: {}` 与吞吐量差距无关：启用 `deep` 仅在 heavy 语料（每个单元含一个嵌套告警）上带来约 1.6% 的开销，在 normal 语料上为 0%；禁用参考包图标使参考包吞吐量变化约 0.2%。因此基准测试差异来自实现本身，而不是选项映射。",
    },
    {
      en: "Whitespace between block-level tags is normalized because the reference renders its opening `<div>` and title `<p>` without newlines while the current package uses markdown-it's default block renderer; attribute order is normalized by the shared normalizer as well. Text content and code whitespace are preserved.",
      zh: "块级标签之间的空白会被归一化，因为参考包渲染其起始 `<div>` 和标题 `<p>` 时不带换行，而当前包使用 markdown-it 的默认块渲染器；属性顺序也由共享归一化器归一化。文本内容和代码中的空白保持不变。",
    },
    {
      en: "The reference removes the marker from the first inline token and keeps the surrounding blockquote content. An alert whose first content line is empty therefore leaves an empty `<p></p>`, and a nested blockquote is hoisted into the alert. The current package consumes the marker line before parsing the body, so those structural differences remain visible in the `list-body`, `nested-blockquote`, `empty-quoted-body` and `nested-alert` cases.",
      zh: "参考包从第一个内联 token 中移除标记，并保留其周围的 blockquote 内容。因此，首个内容行为空的告警会留下空的 `<p></p>`，嵌套的 blockquote 会被提升到告警内。当前包在解析正文前消费标记行，所以这些结构差异仍会体现在 `list-body`、`nested-blockquote`、`empty-quoted-body` 和 `nested-alert` 用例中。",
    },
    {
      en: "Parse-level differences are documented rather than normalized: the reference supports a custom title from trailing text (`> [!note] Title`), accepts a marker without any body, treats `\\[!note]` as an alert, and finds a marker in the first inline token even after another block such as `<hr>`. The current package requires the marker line to contain only the marker, requires body content, and honors the escaped bracket. See the matching diff cases.",
      zh: "解析层面的差异只记录而不归一化：参考包支持用尾随文本自定义标题（`> [!note] Title`），接受没有正文的标记，把 `\\[!note]` 视为告警，并且即使标记前还有 `<hr>` 等其他块，也能在第一个内联 token 中找到标记。当前包要求标记行只包含标记、要求有正文，并尊重转义的方括号。参见对应的 diff 用例。",
    },
    {
      en: "Default title casing differs: the reference lowercases the marker before capitalizing it (`[!TIP]` → `Tip`), while the current package capitalizes the written name and preserves its casing (`[!TIP]` → `TIP`).",
      zh: "默认标题的大小写处理不同：参考包先把标记转为小写再首字母大写（`[!TIP]` → `Tip`），当前包则把写出的名称首字母大写并保留原有大小写（`[!TIP]` → `TIP`）。",
    },
    {
      en: "Both sides use the same five case-insensitive alert names and the default `markdown-alert` class prefix. The reference's `classPrefix` / `titles` options and the current package's `openRenderer` / `closeRenderer` / `titleRenderer` hooks have no counterpart on the other side and are left at their defaults.",
      zh: "双方使用相同的五个不区分大小写的告警名称和默认的 `markdown-alert` 类前缀。参考包的 `classPrefix` / `titles` 选项与当前包的 `openRenderer` / `closeRenderer` / `titleRenderer` 钩子在对方都没有对应项，均保持默认值。",
    },
    {
      en: "Scaling: the reference scans a blockquote's token range once per outermost blockquote and the current package scans each alert body once, so `alert-rows`, `long-alert-body` and `nested-alerts` all grow linearly; no superlinear path was found.",
      zh: "扩展性：参考包对每个最外层 blockquote 扫描一次其 token 范围，当前包对每个告警正文扫描一次，因此 `alert-rows`、`long-alert-body` 和 `nested-alerts` 均呈线性增长；未发现超线性路径。",
    },
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
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      why: {
        en: "Asserts the internal `alert` block-rule count and that a second installation keeps the first parse options and renderers; the reference re-registers its rule on every install and has no idempotent-install contract.",
        zh: "该文件断言内部 `alert` 块级规则的数量，以及第二次安装保留首次解析选项与渲染器的行为；参考包每次安装都会重新注册规则，也没有幂等安装的约定。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should support non-ASCII alert names",
      why: {
        en: "Uses the fork-only `alertNames` option; the reference only accepts `markers` and has no option to add custom names, so it never parses the custom marker and the assertion only covers this package's option.",
        zh: "该测试使用仅本 fork 提供的 `alertNames` 选项；参考包只接受 `markers`，没有添加自定义名称的选项，因此不会解析该自定义标记，断言只覆盖了本包的选项。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should escape alert name in title render",
      why: {
        en: "Uses the fork-only `alertNames` option to add a custom marker and asserts how its name is escaped; the reference has no custom-name option (`markers` only accepts its fixed marker list), so no reference escaping behavior is exercised.",
        zh: "该测试使用仅本 fork 提供的 `alertNames` 选项添加自定义标记并断言其名称的转义；参考包没有自定义名称选项（`markers` 只接受固定标记列表），因此没有覆盖参考包的转义行为。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should not break out of class attribute with quotes in alert name",
      why: {
        en: "Uses the fork-only `alertNames` option to add a marker containing quotes and asserts the generated class attribute; the reference cannot register custom names, so the assertion only covers this package's escaping of `alertNames`.",
        zh: "该测试使用仅本 fork 提供的 `alertNames` 选项添加包含引号的标记并断言生成的 class 属性；参考包无法注册自定义名称，因此断言只覆盖本包对 `alertNames` 的转义。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should support customize options",
      why: {
        en: "Uses the fork-only `openRenderer` / `closeRenderer` / `titleRenderer` hooks; the reference always renders its default wrapper and title markup and ignores these options, so the assertion only covers this package's renderer API.",
        zh: "该测试使用仅本 fork 提供的 `openRenderer` / `closeRenderer` / `titleRenderer` 钩子；参考包始终渲染默认的包裹与标题标记并忽略这些选项，因此断言只覆盖本包的渲染器 API。",
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
      note: {
        en: "The reference lowercases the alert name before capitalizing the default title, so `[!TIP]` renders `Tip`; the current package preserves the written casing and renders `TIP`.",
        zh: "参考包在生成默认标题前先把告警名称转为小写，因此 `[!TIP]` 渲染为 `Tip`；当前包保留写出的名称大小写，渲染为 `TIP`。",
      },
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
      note: {
        en: "The reference keeps the marker line's empty paragraph and emits `<p></p>` before the list; the current package consumes the marker line and starts the body with the list.",
        zh: "参考包保留标记行的空段落，在列表前输出 `<p></p>`；当前包消费标记行，正文直接从列表开始。",
      },
    },
    {
      name: "nested-blockquote",
      markdown: "> [!note]\n> > nested quote",
      note: {
        en: "The reference keeps an empty `<p></p>` for the marker line and closes the hoisted alert `<div>` before the nested `</blockquote>`; the current package keeps the nested blockquote inside the alert with balanced tags.",
        zh: "参考包为标记行保留一个空 `<p></p>`，并在嵌套 `</blockquote>` 之前关闭被提升的告警 `<div>`；当前包把嵌套 blockquote 留在告警内部，标签保持配对。",
      },
    },
    {
      name: "nested-alert",
      markdown: "> > [!note]\n> > nested alert",
      note: {
        en: "The reference transforms the outermost blockquote because its first inline token starts with the marker, leaving the inner blockquote inside the alert; the current package (`deep: true`) transforms the inner blockquote and keeps the outer quote.",
        zh: "参考包转换最外层 blockquote，因为其第一个内联 token 以标记开头，从而把内层 blockquote 留在告警内部；当前包（`deep: true`）转换内层 blockquote，并保留外层引用。",
      },
    },
    { name: "inside-list", markdown: "- > [!note]\n  > in list" },
    { name: "multiple-alerts", markdown: "> [!note]\n> first\n\n> [!tip]\n> second" },
    {
      name: "empty-body",
      markdown: "> [!note]",
      note: {
        en: "The reference accepts a marker with no body and renders an empty alert; the current package requires at least one body line, so the marker stays a literal blockquote.",
        zh: "参考包接受没有正文的标记并渲染空告警；当前包要求至少一行正文，因此该标记仍为普通 blockquote。",
      },
    },
    {
      name: "empty-quoted-body",
      markdown: "> [!note]\n>\n> body",
      note: {
        en: "The reference keeps an empty paragraph for the empty quoted line before the body; the current package consumes the marker line and emits only the body paragraph.",
        zh: "参考包为空引用行保留一个空段落；当前包消费标记行，只输出正文段落。",
      },
    },
    {
      name: "custom-title",
      markdown: "> [!note] Custom title\n> body",
      note: {
        en: "The reference treats trailing text after the marker as a custom title; the current package rejects the marker when anything but spaces follows `]`, so it stays a literal blockquote.",
        zh: "参考包把标记后的尾随文本视为自定义标题；当前包在 `]` 后除空格还有任何内容时拒绝该标记，因此它仍为普通 blockquote。",
      },
    },
    { name: "trailing-spaces", markdown: "> [!note]   \n> body" },
    {
      name: "escaped-bracket",
      markdown: "> \\[!note]\n> body",
      note: {
        en: "The reference's regex accepts an optional backslash before `[`, so `\\[!note]` is still parsed as an alert; the current package treats the escaped bracket as literal text, as documented.",
        zh: "参考包的正则接受 `[` 前的可选反斜杠，因此 `\\[!note]` 仍会被解析为告警；当前包则按文档将转义的方括号视为字面文本。",
      },
    },
    { name: "escaped-bang", markdown: "> [\\!note]\n> body" },
    { name: "unterminated-marker", markdown: "> [!note\n> body" },
    {
      name: "hr-before-marker",
      markdown: "> ***\n> [!note]\n> body",
      note: {
        en: "The reference searches the first inline token of the blockquote and therefore finds the marker after an `<hr>`; the current package only accepts the marker on the first line of the blockquote.",
        zh: "参考包搜索 blockquote 的第一个内联 token，因此能找到 `<hr>` 之后的标记；当前包只接受 blockquote 第一行上的标记。",
      },
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
