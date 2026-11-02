import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-mark/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-mark",
  reference: "markdown-it-mark",
  notes: [
    {
      en: "Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.",
      zh: "两个包都没有选项，双方也都不传入选项；两个渲染器都使用 markdown-it 的默认选项。",
    },
    {
      en: "The package registers the shared nested inline rule with doubled `==` markers, like the reference; both follow the CommonMark emphasis delimiter rules and relocate the lone marker of odd-length runs. Every correctness case renders identical HTML, so no case is a documented difference.",
      zh: "本包与参考包一样，使用双 `==` 标记注册共享的嵌套行内规则；双方都遵循 CommonMark 的强调定界符规则，并会重新安置奇数长度标记串中落单的标记。所有正确性用例渲染出的 HTML 完全相同，因此没有用例属于已记录差异。",
    },
    {
      en: "Scaling: both implementations consume each marker run once and move the lone marker of an odd-length run within a single run of adjacent close tags. `inline-marks`, `unmatched-openers` and `nested-odd-markers` all fit a near-linear exponent on both sides; no superlinear path was found.",
      zh: "伸缩性：两个实现都只遍历每个标记串一次，并在相邻结束标签的同一段范围内移动奇数长度标记串中落单的标记。`inline-marks`、`unmatched-openers` 和 `nested-odd-markers` 在双方拟合出的指数都接近线性；未发现超线性路径。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "mark",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    { name: "basic", markdown: "==marked==" },
    { name: "inline-sentence", markdown: "The migration guide is ==ready to read==." },
    { name: "empty-markers", markdown: "====" },
    { name: "empty-with-space", markdown: "== ==" },
    { name: "single-marker", markdown: "=marked=" },
    { name: "whitespace-inside", markdown: "== marked ==" },
    { name: "whitespace-newline", markdown: "==multi\nline==" },
    { name: "escaped-opening", markdown: String.raw`\==marked==` },
    { name: "escaped-closing", markdown: String.raw`==marked\==` },
    { name: "nested", markdown: "====foo== bar==" },
    { name: "nested-outer", markdown: "==foo ==bar== baz==" },
    { name: "nested-emphasis", markdown: "==**bold** and *italic*==" },
    { name: "inside-emphasis", markdown: "**==marked==**" },
    { name: "inside-inline-code", markdown: "`==marked==`" },
    { name: "inside-code-fence", markdown: "```md\n==not marked==\n```" },
    { name: "inside-link", markdown: "[==marked==](https://example.com)" },
    {
      name: "inside-link-destination",
      markdown: "[link](https://example.com/==path==)",
    },
    { name: "unclosed", markdown: "==unclosed" },
    { name: "single-equal-inside", markdown: "==a= b==" },
    { name: "punctuation", markdown: "(==marked==), a==b==c and .==d==." },
    { name: "triple-markers", markdown: "x ===foo===" },
    { name: "link-priority", markdown: "[==link]()==" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with = and == symbols.\n\n- a\n- b",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-marks",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"==word== ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"==word ".repeat(size)}\n`,
    },
    {
      name: "nested-odd-markers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"==".repeat(size)}a${"=".repeat(2 * size + 1)}\n`,
    },
  ],
});

export default spec;
