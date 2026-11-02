import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-ins/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-ins",
  reference: "markdown-it-ins",
  notes: [
    {
      en: "Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.",
      zh: "两个包都不接受选项，两侧均不传选项；两个渲染器都使用 markdown-it 的默认选项。",
    },
    {
      en: "The package registers the shared nested inline rule with doubled `++` markers, like the reference; both follow the CommonMark emphasis delimiter rules and relocate the lone marker of odd-length runs. Every correctness case renders identical HTML, so no case is a documented difference.",
      zh: "本包与参考包一样，使用双 `++` 标记注册共享的嵌套行内规则；两者都遵循 CommonMark 强调定界符规则，并会移动奇数长度标记串中落单的标记。所有正确性用例渲染出的 HTML 完全相同，因此没有用例是已记录差异。",
    },
    {
      en: "Scaling: both implementations consume each marker run once and move the lone marker of an odd-length run within a single run of adjacent close tags. `inline-insertions`, `unmatched-openers` and `nested-odd-markers` all fit a near-linear exponent on both sides; no superlinear path was found.",
      zh: "扩展性：两个实现都只消费每个标记串一次，并在单次相邻闭合标签串内移动奇数长度标记串中落单的标记。`inline-insertions`、`unmatched-openers` 和 `nested-odd-markers` 在两侧的拟合指数都接近线性；未发现超线性路径。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "ins",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    { name: "basic", markdown: "++inserted++" },
    { name: "inline-sentence", markdown: "The migration guide is ++ready to read++." },
    { name: "empty-markers", markdown: "++++" },
    { name: "empty-with-space", markdown: "++ ++" },
    { name: "single-marker", markdown: "+inserted+" },
    { name: "whitespace-inside", markdown: "++ inserted ++" },
    { name: "whitespace-newline", markdown: "++multi\nline++" },
    { name: "escaped-opening", markdown: String.raw`\++inserted++` },
    { name: "escaped-closing", markdown: String.raw`++inserted\++` },
    { name: "nested", markdown: "++++foo++ bar++" },
    { name: "nested-outer", markdown: "++foo ++bar++ baz++" },
    { name: "nested-emphasis", markdown: "++**bold** and *italic*++" },
    { name: "inside-emphasis", markdown: "**++inserted++**" },
    { name: "inside-inline-code", markdown: "`++inserted++`" },
    { name: "inside-code-fence", markdown: "```md\n++not inserted++\n```" },
    { name: "inside-link", markdown: "[++inserted++](https://example.com)" },
    {
      name: "inside-link-destination",
      markdown: "[link](https://example.com/++path++)",
    },
    { name: "unclosed", markdown: "++unclosed" },
    { name: "single-plus-inside", markdown: "++a+ b++" },
    { name: "punctuation", markdown: "(++inserted++), a++b++c and .++d++." },
    { name: "triple-markers", markdown: "x +++foo+++" },
    { name: "link-priority", markdown: "[++link]()++" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with + and ++ symbols.\n\n- a\n- b",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-insertions",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"++word++ ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"++word ".repeat(size)}\n`,
    },
    {
      name: "nested-odd-markers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"++".repeat(size)}a${"+".repeat(2 * size + 1)}\n`,
    },
  ],
});

export default spec;
