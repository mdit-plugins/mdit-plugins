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
      en: "The reference removes the marker from the first inline token and keeps the surrounding blockquote content. An alert whose first content line is empty therefore leaves an empty `<p></p>`, and a nested blockquote is hoisted into the alert. The current package consumes the marker line before parsing the body, so they are recorded as the `marker-line-empty-paragraph` and `nested-blockquote-structure` reference errors.",
      zh: "参考包从第一个内联 token 中移除标记，并保留其周围的 blockquote 内容。因此，首个内容行为空的告警会留下空的 `<p></p>`，嵌套的 blockquote 会被提升到告警内。当前包在解析正文前消费标记行，因此它们被记录为 `marker-line-empty-paragraph` 和 `nested-blockquote-structure` 两个参考包错误。",
    },
    {
      en: "Parse-level differences are documented rather than normalized: the reference supports a custom title from trailing text (`> [!note] Title`), accepts a marker without any body, treats `\\[!note]` as an alert, and finds a marker in the first inline token even after another block such as `<hr>`. The current package requires the marker line to contain only the marker, requires body content, and honors the escaped bracket; these differences are recorded as the `empty-alert-body`, `custom-title`, `escaped-marker` and `marker-after-block` issues.",
      zh: "解析层面的差异只记录而不归一化：参考包支持用尾随文本自定义标题（`> [!note] Title`），接受没有正文的标记，把 `\\[!note]` 视为告警，并且即使标记前还有 `<hr>` 等其他块，也能在第一个内联 token 中找到标记。当前包要求标记行只包含标记、要求有正文，并尊重转义的方括号；这些差异记录为 `empty-alert-body`、`custom-title`、`escaped-marker` 和 `marker-after-block` 问题。",
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
  issues: [
    {
      id: "title-token-representation",
      category: "difference",
      note: {
        en: "The rendered HTML matches, but the reference reuses the blockquote paragraph as the title and maps the marker line on `alert_open`, while the current package emits a dedicated `alert_title` token for it.",
        zh: "渲染结果一致，但参考包复用 blockquote 段落作为标题、把标记行映射到 `alert_open`，当前包则用独立的 `alert_title` token 承载该映射。",
      },
    },
    {
      id: "title-casing",
      category: "difference",
      note: {
        en: "The reference lowercases the written name before capitalizing the default title (`[!TIP]` → `Tip`), while the current package preserves the written casing (`TIP`); this is an intentional title style difference.",
        zh: "参考包把写出的名称转为小写后再首字母大写（`[!TIP]` → `Tip`），当前包保留写出的大小写（`TIP`），属有意的标题样式差异。",
      },
    },
    {
      id: "marker-line-empty-paragraph",
      category: "reference-error",
      note: {
        en: "The reference strips the marker from the first inline token but keeps its paragraph, so the marker line or an empty quoted line leaves a meaningless `<p></p>` before the body; the current package consumes the marker line.",
        zh: "参考包只从首个内联 token 中移除标记、却保留其段落，因此标记行或空引用行会在正文前留下无意义的 `<p></p>`；当前包会消费标记行。",
      },
    },
    {
      id: "nested-blockquote-structure",
      category: "reference-error",
      note: {
        en: "With a nested blockquote the reference emits its alert `</div>` before the inner `</blockquote>` (and converts the outer quote for `> > [!note]`), producing unbalanced markup; the current package keeps the tags balanced.",
        zh: "遇到嵌套 blockquote 时，参考包会先输出告警 `</div>` 再输出内层 `</blockquote>`（并且对 `> > [!note]` 转换外层引用），产生不配对的标记；当前包保持标签配对。",
      },
    },
    {
      id: "empty-alert-body",
      category: "difference",
      note: {
        en: "The reference accepts a marker without a body and renders an empty alert, while the current package requires at least one body line and keeps the marker as a literal blockquote; both are valid syntax designs.",
        zh: "参考包接受没有正文的标记并渲染空告警，当前包要求至少一行正文、把标记保留为普通 blockquote；两种语法设计都成立。",
      },
    },
    {
      id: "custom-title",
      category: "difference",
      note: {
        en: "The reference treats trailing text after the marker as a custom title (`> [!note] Title`), while the current package requires the marker to occupy the line by itself; this is a reference-only syntax extension.",
        zh: "参考包把标记后的尾随文本当作自定义标题（`> [!note] Title`），当前包要求标记独占一行；这是参考包独有的语法扩展。",
      },
    },
    {
      id: "escaped-marker",
      category: "reference-error",
      note: {
        en: "The reference's marker pattern accepts an optional backslash, so the escaped `\\[!note]` still becomes an alert; the current package treats it as literal text as the markdown escaping convention requires.",
        zh: "参考包的标记正则接受可选的反斜杠，因此转义的 `\\[!note]` 仍会被解析为告警；当前包按 markdown 转义约定将其视为字面文本。",
      },
    },
    {
      id: "marker-after-block",
      category: "reference-error",
      note: {
        en: "The reference searches the whole first inline token, so a marker on a later blockquote line (e.g. after `<hr>`) still becomes an alert and the preceding block is moved inside it; the current package only accepts the marker on the blockquote's first line.",
        zh: "参考包在整个首个内联 token 中搜索标记，因此 blockquote 后续行（如 `<hr>` 之后）的标记仍会变成告警，前面的块被移入告警内部；当前包只接受 blockquote 首行的标记。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "alert.spec.ts",
      name: "should support non-ASCII alert names",
      category: "feature-gap",
      why: {
        en: "This package provides the `alertNames` option for custom and non-ASCII alert names; the reference only accepts its fixed `markers` list and has no equivalent option.",
        zh: "本包提供 `alertNames` 选项自定义告警名称（含非 ASCII 名称），参考包只接受固定的 `markers` 列表，无对应选项。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should escape alert name in title render",
      category: "feature-gap",
      why: {
        en: "This test uses the `alertNames` option to register a custom marker and checks how its name is escaped; the reference has no custom-name option.",
        zh: "该测试使用 `alertNames` 选项注册自定义标记并检查名称转义，参考包没有自定义名称选项。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should not break out of class attribute with quotes in alert name",
      category: "feature-gap",
      why: {
        en: "This test registers a marker with quotes through the `alertNames` option and checks the generated class attribute; the reference cannot register custom names.",
        zh: "该测试通过 `alertNames` 选项注册含引号的标记并检查生成的 class 属性，参考包无法注册自定义名称。",
      },
    },
    {
      file: "alert.spec.ts",
      name: "should support customize options",
      category: "feature-gap",
      why: {
        en: "This package provides the `openRenderer` / `closeRenderer` / `titleRenderer` hooks; the reference always renders its own alert markup and has no renderer hooks.",
        zh: "本包提供 `openRenderer` / `closeRenderer` / `titleRenderer` 渲染钩子，参考包始终渲染自己的告警标记，没有对应钩子。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "should not register the rule twice when installed twice",
      category: "feature-gap",
      why: {
        en: "The reference does not guard repeated installation and registers its core rule again (the test counts this package's block rule instead), but repeated installation still renders correctly.",
        zh: "参考包未防范多次安装，会重复注册 core 规则（测试断言的则是本包的块级规则数量），但重复安装后渲染结果仍正确。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "should keep the first installation's parse options",
      category: "feature-gap",
      why: {
        en: "This package supports the `alertNames` / `deep` options and keeps the first installation's options; the reference has neither option and no first-install contract.",
        zh: "本包支持 `alertNames` / `deep` 选项并在重复安装时保留首次选项，参考包没有这些选项，也没有首次安装优先的约定。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "should keep the first installation's renderers",
      category: "feature-gap",
      why: {
        en: "This package provides the renderer hooks and keeps the first installation's renderers; the reference has no renderer hooks.",
        zh: "本包提供渲染钩子并保留首次安装的渲染器，参考包没有对应钩子。",
      },
    },
  ],
  correctness: [
    { name: "note", markdown: "> [!note]\n> Some text", issue: "title-token-representation" },
    { name: "tip", markdown: "> [!tip]\n> Some tip", issue: "title-token-representation" },
    {
      name: "important",
      markdown: "> [!important]\n> Important",
      issue: "title-token-representation",
    },
    {
      name: "warning",
      markdown: "> [!warning]\n> Warning\n> second line",
      issue: "title-token-representation",
    },
    { name: "caution", markdown: "> [!caution]\n> Caution", issue: "title-token-representation" },
    { name: "mixed-case", markdown: "> [!Note]\n> body", issue: "title-token-representation" },
    { name: "uppercase", markdown: "> [!TIP]\n> body", issue: "title-casing" },
    { name: "unknown-type", markdown: "> [!danger]\n> body" },
    {
      name: "multiline-body",
      markdown: "> [!warning]\n> first line\n> second line",
      issue: "title-token-representation",
    },
    {
      name: "inline-markup",
      markdown: "> [!note]\n> **bold** and [link](https://example.com)",
      issue: "title-token-representation",
    },
    {
      name: "list-body",
      markdown: "> [!note]\n> - a\n> - b",
      issue: "marker-line-empty-paragraph",
    },
    {
      name: "nested-blockquote",
      markdown: "> [!note]\n> > nested quote",
      issue: "nested-blockquote-structure",
    },
    {
      name: "nested-alert",
      markdown: "> > [!note]\n> > nested alert",
      issue: "nested-blockquote-structure",
    },
    {
      name: "inside-list",
      markdown: "- > [!note]\n  > in list",
      issue: "title-token-representation",
    },
    {
      name: "multiple-alerts",
      markdown: "> [!note]\n> first\n\n> [!tip]\n> second",
      issue: "title-token-representation",
    },
    { name: "empty-body", markdown: "> [!note]", issue: "empty-alert-body" },
    {
      name: "empty-quoted-body",
      markdown: "> [!note]\n>\n> body",
      issue: "marker-line-empty-paragraph",
    },
    { name: "custom-title", markdown: "> [!note] Custom title\n> body", issue: "custom-title" },
    {
      name: "trailing-spaces",
      markdown: "> [!note]   \n> body",
      issue: "title-token-representation",
    },
    { name: "escaped-bracket", markdown: "> \\[!note]\n> body", issue: "escaped-marker" },
    { name: "escaped-bang", markdown: "> [\\!note]\n> body" },
    { name: "unterminated-marker", markdown: "> [!note\n> body" },
    {
      name: "hr-before-marker",
      markdown: "> ***\n> [!note]\n> body",
      issue: "marker-after-block",
    },
    {
      name: "indented-marker",
      markdown: ">    [!note]\n> body",
      issue: "title-token-representation",
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
