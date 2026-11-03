import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Benchmark cases, one per committed corpus file */
const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-spoiler/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-spoiler",
  reference: "markdown-it-spoiler",
  notes: [
    {
      en: 'The current package adds `tabindex="-1"` to the spoiler element by default for keyboard accessibility. The variant sets `attrs` to `[["class", "spoiler"]]` so that the compared markup is the reference\'s `<span class="spoiler">`; the accessibility attribute is an intentional addition and is not part of this comparison.',
      zh: '当前包默认给 spoiler 元素加上 `tabindex="-1"` 以支持键盘可访问性。该变体将 `attrs` 设为 `[["class", "spoiler"]]`，使参与比较的标记与参考包的 `<span class="spoiler">` 一致；可访问性属性是有意新增的，不属于本次比较范围。',
    },
    {
      en: "The reference exposes a `frontPriorMode` option that controls where an odd leftover marker is placed. The current package has no counterpart, so both sides are compared in the reference's default mode (`frontPriorMode: false`); the odd-length marker cases cover that mode.",
      zh: "参考包提供 `frontPriorMode` 选项，用于控制奇数个剩余标记的放置位置。当前包没有对应选项，因此两侧都在参考包的默认模式（`frontPriorMode: false`）下比较；奇数长度标记的用例覆盖了该模式。",
    },
    {
      en: "All correctness cases render identical HTML, so no output normalization beyond the harness default (attribute order) is applied.",
      zh: "所有正确性用例渲染出的 HTML 完全相同，因此除测试框架默认的属性顺序归一化外，未做其他输出归一化。",
    },
    {
      en: "Scaling: both implementations consume each marker run once and relocate lone odd markers within a single run of adjacent close tags, so `inline-spoilers`, `unmatched-openers` and `nested-odd-markers` all grow linearly; no superlinear path was found.",
      zh: "扩展性：两种实现都只消费每个标记序列一次，并在单个相邻闭合标签序列内重新定位落单的奇数标记，因此 `inline-spoilers`、`unmatched-openers` 和 `nested-odd-markers` 均为线性增长；未发现超线性路径。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "spoiler",
      referenceExport: "default",
      ourOptions: { attrs: [["class", "spoiler"]] },
    },
  ],
  testSuiteSkips: [
    {
      file: "spoiler.spec.ts",
      name: "spoiler with attrs factory",
      category: "feature-gap",
      why: {
        en: 'Exercises this fork\'s `attrs` option, including the factory form; the reference accepts no options and hard-codes `class="spoiler"`.',
        zh: '覆盖本 fork 的 `attrs` 选项（包括工厂形式）；参考包不接受任何选项，并硬编码 `class="spoiler"`。',
      },
    },
  ],
  correctness: [
    { name: "basic", markdown: "!!spoiler!!" },
    { name: "inline-sentence", markdown: "VuePress Theme Hope is !!powerful!!." },
    { name: "multiline", markdown: "!!multi\nline spoiler!!" },
    { name: "nested-markup", markdown: "!!**bold** and *italic* and `code`!!" },
    { name: "link-inside", markdown: "!![link](https://example.com)!!" },
    { name: "nested-spoilers", markdown: "!!outer !!inner!! outer!!" },
    { name: "adjacent", markdown: "!!a!! !!b!!" },
    { name: "empty-pair", markdown: "!!!!" },
    { name: "single-marker", markdown: "a ! b" },
    { name: "unclosed", markdown: "!!unclosed" },
    { name: "closing-only", markdown: "unopened!!" },
    { name: "odd-run", markdown: "!!!!!text!!!!" },
    { name: "leading-odd", markdown: "!!!spoiler!!" },
    { name: "trailing-odd", markdown: "!!spoiler!!!" },
    { name: "escaped-open", markdown: String.raw`\!!escaped!!` },
    { name: "escaped-marker", markdown: String.raw`!!a\!b!!` },
    { name: "blockquote", markdown: "> !!quoted!!" },
    { name: "list", markdown: "- !!item one!!\n- !!item two!!" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with an exclamation mark!\n\n- a\n- b",
    },
    { name: "code-fence", markdown: "```md\n!!not a spoiler!!\n```" },
    { name: "inline-code", markdown: "`!!not a spoiler!!`" },
    { name: "punctuation", markdown: "!!a!!, !b! and !!c!!." },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-spoilers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"!!word!! ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"!!word ".repeat(size)}\n`,
    },
    {
      name: "nested-odd-markers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"!!".repeat(size)}a${"!".repeat(2 * size + 1)}\n`,
    },
  ],
});

export default spec;
