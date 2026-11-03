import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-ruby/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-ruby",
  reference: "markdown-it-ruby",
  notes: [
    {
      en: "The current package and the installed reference use different dividers: this package implements `{ruby base:ruby text}` (the upstream syntax that the fork was based on), while the installed `markdown-it-ruby@1.1.2` implements DenDenMarkdown's `{ruby base|ruby text}`. This is a real behavioral difference, not a normalization, so every case that renders ruby on one side renders plain text on the other and references the `divider-syntax` issue.",
      zh: "当前包与已安装的参考包使用不同的分隔符：本包实现 `{ruby base:ruby text}`（fork 所基于的上游语法），而已安装的 `markdown-it-ruby@1.1.2` 实现 DenDenMarkdown 的 `{ruby base|ruby text}`。这是真实的行为差异，不是归一化，因此每个在一侧渲染 ruby 的用例在另一侧都会渲染为纯文本，并引用 `divider-syntax` 问题。",
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
  issues: [
    {
      id: "divider-syntax",
      category: "difference",
      note: {
        en: "Intentional syntax difference: this package splits ruby on `:` (and per base character), while the reference splits on `|`; each case therefore renders ruby on one side and plain text on the other. Both divider conventions are valid designs.",
        zh: "有意的语法差异：本包用 `:` 分割 ruby（并按 base 字符拆分），参考包用 `|` 分割；因此每个用例在一侧渲染 ruby，另一侧渲染纯文本。两种分隔符约定都是合理的设计。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "should not register the inline rule twice",
      category: "internal",
      why: {
        en: "Inspects this fork's inline rule registration internals (`md.inline.ruler.__rules__`) to assert the rule is registered once; the reference has no registration guard.",
        zh: "检查本 fork 的规则注册内部实现（`md.inline.ruler.__rules__`），断言行内规则只注册一次；参考包没有注册守卫。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "should render the same output when used twice",
      category: "feature-gap",
      why: {
        en: "Asserts this fork's install guard and `:` divider output; the reference has no guard for repeated `.use()` and does not parse `:` at all.",
        zh: "断言本 fork 的安装守卫和 `:` 分隔符输出；参考包没有重复 `.use()` 的守卫，也完全不解析 `:`。",
      },
    },
  ],
  correctness: [
    {
      name: "documented-syntax",
      markdown: "{中国:zhōng|guó}",
      issue: "divider-syntax",
    },
    {
      name: "upstream-syntax",
      markdown: "{漢字|かんじ}",
      issue: "divider-syntax",
    },
    {
      name: "simple-ruby",
      markdown: "{ruby base:ruby text}",
      issue: "divider-syntax",
    },
    {
      name: "equal-length-pairs",
      markdown: "{鬼門:き|もん}",
      issue: "divider-syntax",
    },
    {
      name: "wrapped-in-strong",
      markdown: "**{ruby base:ruby text}**",
      issue: "divider-syntax",
    },
    {
      name: "inline-markup-inside-ruby",
      markdown: "{**ruby base**:ruby text}",
      issue: "divider-syntax",
    },
    {
      name: "inline-markup-in-ruby-text",
      markdown: "{ruby base:**ruby text**}",
      issue: "divider-syntax",
    },
    {
      name: "empty-ruby-segment",
      markdown: "{ab:|b}",
      issue: "divider-syntax",
    },
    {
      name: "extra-colon",
      markdown: "{a:b:c}",
      issue: "divider-syntax",
    },
    {
      name: "escaped-backslash",
      markdown: String.raw`{a\\:b}`,
      issue: "divider-syntax",
    },
    {
      name: "in-table-cell",
      markdown: "| a | b |\n| - | - |\n| {中:zhōng} | x |\n",
      issue: "divider-syntax",
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
