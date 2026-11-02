import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-ruby/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-ruby",
  reference: "markdown-it-ruby",
  notes: [
    {
      en: "The current package and the installed reference use different dividers: this package implements `{ruby base:ruby text}` (the upstream syntax that the fork was based on), while the installed `markdown-it-ruby@1.1.2` implements DenDenMarkdown's `{ruby base|ruby text}`. This is a real behavioral difference, not a normalization, so every case that renders ruby on one side renders plain text on the other and carries a `note`.",
      zh: "当前包与已安装的参考包使用不同的分隔符：本包实现 `{ruby base:ruby text}`（fork 所基于的上游语法），而已安装的 `markdown-it-ruby@1.1.2` 实现 DenDenMarkdown 的 `{ruby base|ruby text}`。这是真实的行为差异，不是归一化，因此每个在一侧渲染 ruby 的用例在另一侧都会渲染为纯文本，并带有 `note`。",
    },
    {
      en: "The reference has an `rp` option (`[open, close]`). This package does not implement it, so the reference is left at its default `rp: []`, which renders no `<rp>` elements and matches the current package's output shape.",
      zh: "参考包有一个 `rp` 选项（`[open, close]`）。本包未实现它，因此参考包保持默认的 `rp: []`，不会渲染任何 `<rp>` 元素，与当前包的输出形状一致。",
    },
    {
      en: "The reference renders empty rubies such as `{ab:|}` (base `ab:`, empty `<rt></rt>`) because it only splits on `|`; this package rejects empty `|`-separated segments and empty ruby text, which is covered by `empty-ruby-segment`.",
      zh: "参考包会渲染 `{ab:|}` 这类空 ruby（base 为 `ab:`，空的 `<rt></rt>`），因为它只按 `|` 分割；本包会拒绝空的 `|` 分隔段和空 ruby 文本，`empty-ruby-segment` 用例覆盖了这一点。",
    },
    {
      en: "Because the syntax differs, every benchmark corpus mixes both divider styles: each side parses its own syntax and only scans over the other side's lines. Throughput ratios therefore compare equivalent mixtures, not identical parse work.",
      zh: "由于语法不同，每个基准语料都混合了两种分隔符风格：每一侧解析自己的语法，只是扫描另一侧的文本行。因此吞吐量比值比较的是等价的混合语料，而不是完全相同的解析工作量。",
    },
    {
      en: "`unmatched-openers` (an opening `{` with no divider and no closing brace at all) stays quadratic on both sides, because both scan forward to the end of the inline content. `dense-documented-syntax` is linear for this package but quadratic for the reference, and `upstream-syntax` is linear for this package because the fork now stops at the first closing brace before the divider.",
      zh: "`unmatched-openers`（只有开头 `{`，既没有分隔符也没有结束花括号）在双方都保持二次复杂度，因为双方都会向前扫描到行内内容末尾。`dense-documented-syntax` 对本包是线性、对参考包是二次，而 `upstream-syntax` 对本包是线性，因为 fork 现在会在分隔符之前的第一个结束花括号处停止。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "ruby",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      why: {
        en: "Checks this fork's install bookkeeping: that the inline rule is registered only once and that calling `.use(ruby)` twice is a no-op. The reference has no registration guard, the comparison installs the plugin once, and the render assertion uses this package's `:` divider, so the file only covers internal install behavior.",
        zh: "检查本 fork 的安装簿记：行内规则只注册一次，且重复调用 `.use(ruby)` 是空操作。参考包没有注册守卫，对比只安装一次插件，且渲染断言使用本包的 `:` 分隔符，因此该文件只覆盖内部安装行为。",
      },
    },
  ],
  correctness: [
    {
      name: "documented-syntax",
      markdown: "{中国:zhōng|guó}",
      note: {
        en: "The reference splits on `|`, not on `:`: it renders `中国:zhōng` as the base text with `guó` as ruby text, while this package splits the base per character and pairs `中`/`zhōng` and `国`/`guó`.",
        zh: "参考包按 `|` 而不是 `:` 分割：它把 `中国:zhōng` 渲染为 base 文本、把 `guó` 渲染为 ruby 文本，而本包按字符拆分 base，并配对 `中`/`zhōng` 与 `国`/`guó`。",
      },
    },
    {
      name: "upstream-syntax",
      markdown: "{漢字|かんじ}",
      note: {
        en: "This package does not recognize the upstream `|` divider, so it leaves the construct as plain text; the reference renders it as ruby.",
        zh: "本包不识别上游的 `|` 分隔符，因此将该结构保留为纯文本；参考包会将其渲染为 ruby。",
      },
    },
    {
      name: "simple-ruby",
      markdown: "{ruby base:ruby text}",
      note: {
        en: "Same divider difference: this package renders ruby, the reference leaves the text untouched.",
        zh: "同样的分隔符差异：本包渲染 ruby，参考包保持文本不变。",
      },
    },
    {
      name: "equal-length-pairs",
      markdown: "{鬼門:き|もん}",
      note: {
        en: "Divider difference: this package splits per character into two `<rt>` pairs, while the reference does not recognize `:` as the divider.",
        zh: "分隔符差异：本包按字符拆分成两对 `<rt>`，而参考包不把 `:` 识别为分隔符。",
      },
    },
    {
      name: "wrapped-in-strong",
      markdown: "**{ruby base:ruby text}**",
      note: {
        en: "Divider difference inside emphasis; both sides keep the surrounding `**` markup.",
        zh: "强调内部的同一分隔符差异；双方都保留外层的 `**` 标记。",
      },
    },
    {
      name: "inline-markup-inside-ruby",
      markdown: "{**ruby base**:ruby text}",
      note: {
        en: "Divider difference: this package parses inline markup inside the base text, the reference leaves the whole construct as text with the emphasis parsed normally.",
        zh: "分隔符差异：本包会解析 base 文本内部的行内标记，参考包则把整个结构当作文本，并正常解析其中的强调。",
      },
    },
    {
      name: "inline-markup-in-ruby-text",
      markdown: "{ruby base:**ruby text**}",
      note: {
        en: "Divider difference: this package parses inline markup inside the ruby text, the reference leaves the construct as text.",
        zh: "分隔符差异：本包会解析 ruby 文本内部的行内标记，参考包则把该结构当作文本。",
      },
    },
    {
      name: "empty-ruby-segment",
      markdown: "{ab:|b}",
      note: {
        en: "This package rejects empty `|`-separated segments and leaves the source as text; the reference sees no `:` divider, treats `ab:` as base text and renders an empty `<rt></rt>`.",
        zh: "本包拒绝空的 `|` 分隔段并保留源文本；参考包看不到 `:` 分隔符，把 `ab:` 当作 base 文本，并渲染空的 `<rt></rt>`。",
      },
    },
    {
      name: "extra-colon",
      markdown: "{a:b:c}",
      note: {
        en: "This package keeps everything after the first `:` as ruby text; the reference does not recognize `:` and leaves the source as text.",
        zh: "本包保留第一个 `:` 之后的所有内容作为 ruby 文本；参考包不识别 `:`，保留源文本。",
      },
    },
    {
      name: "escaped-backslash",
      markdown: String.raw`{a\\:b}`,
      note: {
        en: "This package treats `\\\\` as an escaped backslash and the following `:` as the divider; the reference does not parse `:` at all.",
        zh: "本包把 `\\\\` 视为转义反斜杠，并把其后的 `:` 作为分隔符；参考包完全不解析 `:`。",
      },
    },
    {
      name: "in-table-cell",
      markdown: "| a | b |\n| - | - |\n| {中:zhōng} | x |\n",
      note: {
        en: "Divider difference: this package renders ruby inside the table cell, the reference keeps the source text.",
        zh: "分隔符差异：本包在表格单元格内渲染 ruby，参考包保留源文本。",
      },
    },
    {
      name: "no-ruby-syntax",
      markdown: "# Plain heading\n\nLore ipsum dolor sit amet.\n\n- a\n- b\n",
    },
    {
      name: "escaped-opening",
      markdown: String.raw`\{ruby base:ruby text}`,
    },
    {
      name: "escaped-divider",
      markdown: String.raw`{ruby base\:ruby text}`,
    },
    {
      name: "escaped-closing",
      markdown: String.raw`{ruby base:ruby text\}`,
    },
    { name: "empty-ruby-text", markdown: "{abc:}" },
    { name: "empty-braces", markdown: "{}" },
    { name: "colon-only", markdown: "{:}" },
    { name: "empty-base", markdown: "{:a}" },
    { name: "unclosed", markdown: "{abc:def" },
    {
      name: "plain-colons",
      markdown: "A paragraph with a time 12:30 and a ratio 3:4.\n",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "unmatched-openers",
      sizes: [256, 512, 1024, 2048],
      build: (size) => `${"{".repeat(size)}x\n`,
    },
    {
      name: "dense-documented-syntax",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"{a:b} ".repeat(size)}\n`,
    },
    {
      name: "upstream-syntax",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"{a|b} ".repeat(size)}\n`,
    },
  ],
});

export default spec;
