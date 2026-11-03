import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Benchmark cases, one per committed corpus file */
const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-sub/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-sub",
  reference: "markdown-it-sub",
  notes: [
    {
      en: "Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.",
      zh: "两个包都没有选项，两侧均未传入选项；两个渲染器都使用 markdown-it 的默认选项。",
    },
    {
      en: "The package uses the shared linear inline rule; like the reference it scans to the next marker, rejects unescaped whitespace in the content and unescapes backslash escapes. Every correctness case renders identical HTML, so no case is a documented difference.",
      zh: "该包使用共享的线性行内规则；与参考包一样，它会扫描到下一个标记、拒绝内容中未转义的空白并反转义反斜杠转义。所有正确性用例渲染出的 HTML 完全相同，因此没有用例属于已记录差异。",
    },
    {
      en: "Scaling: the scanner stops at the next marker character, so repeated unmatched openers do not rescan the remaining line, and `long-inline-run` scans its content once. `inline-subscripts`, `unmatched-openers` and `long-inline-run` all fit a near-linear exponent on both sides; no superlinear path was found.",
      zh: "扩展性：扫描器在下一个标记字符处停止，因此重复的未匹配开标记不会重新扫描该行剩余部分，`long-inline-run` 也只扫描其内容一次。`inline-subscripts`、`unmatched-openers` 和 `long-inline-run` 在两侧的拟合指数都接近线性；未发现超线性路径。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "sub",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  testSuiteSkips: [],
  correctness: [
    { name: "basic", markdown: "H~2~0" },
    { name: "inline-sentence", markdown: "Water is H~2~O at room temperature." },
    { name: "empty-markers", markdown: "~~" },
    { name: "empty-with-space", markdown: "~ ~" },
    { name: "whitespace-inside", markdown: "~foo bar~" },
    { name: "escaped-space", markdown: String.raw`~foo\ bar\ baz~` },
    { name: "escaped-closing", markdown: String.raw`~foo\~` },
    { name: "escaped-opening", markdown: String.raw`\~foo~` },
    { name: "multiple-backslashes", markdown: String.raw`~foo\\\\\ bar~` },
    { name: "other-markers", markdown: "~foo^bar~ baz~" },
    { name: "nested-emphasis", markdown: "**~foo~ bar**" },
    { name: "nested-markers", markdown: "~outer ~inner~ outer~" },
    { name: "inside-emphasis", markdown: "*H~2~O*" },
    { name: "inside-strong", markdown: "**H~2~O**" },
    { name: "inside-inline-code", markdown: "`H~2~O`" },
    { name: "code-inside", markdown: "~H`2`O~" },
    { name: "inside-link", markdown: "[H~2~O](https://example.com)" },
    { name: "link-inside", markdown: "~[link](https://example.com)~" },
    { name: "unclosed", markdown: "~unclosed" },
    { name: "adjacent", markdown: "~a~~b~" },
    { name: "punctuation", markdown: "a~b~c, (H~2~O)." },
    { name: "multiline", markdown: "~multi\nline~" },
    { name: "inside-code-fence", markdown: "```md\nH~2~O\n```" },
    {
      name: "no-syntax",
      markdown: "# Plain heading\n\nA plain paragraph with ~ and ~~ symbols.\n\n- a\n- b",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-subscripts",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"~word~ ".repeat(size)}\n`,
    },
    {
      name: "unmatched-openers",
      sizes: [500, 1000, 2000, 4000],
      build: (size) => `${"~word ".repeat(size)}\n`,
    },
    {
      name: "long-inline-run",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `~${"word".repeat(size)}~\n`,
    },
  ],
});

export default spec;
