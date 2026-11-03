import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-cjk-friendly/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-cjk-friendly",
  reference: "markdown-it-cjk-friendly",
  notes: [
    {
      en: "The current package is a rewrite of the reference implementation and implements the same CJK-friendly CommonMark amendments. Both are installed with their defaults, so the comparison is a direct behavior check of the delimiter-run handling.",
      zh: "当前包是参考实现的重写版本，实现了相同的 CJK 友好 CommonMark 修正。两者都使用默认配置安装，因此对比直接检验分隔符串的处理行为。",
    },
    {
      en: "Only delimiter runs adjacent to CJK characters are affected; Latin-only documents keep the plain markdown-it output on both sides.",
      zh: "只有与 CJK 字符相邻的分隔符串会受影响；纯拉丁文文档在两侧都保持普通 markdown-it 的输出。",
    },
    {
      en: "The reference is used by VuePress' markdown extensions, so the installed 3.0.0 is the version that ships in the ecosystem. The `many-delimiters` series is linear in the number of delimiter runs and `long-text` exercises the flanking scan on a single line.",
      zh: "参考包被 VuePress 的 Markdown 扩展使用，安装的 3.0.0 即生态中实际发布的版本。`many-delimiters` 系列随分隔符串数量线性增长，`long-text` 系列检验单行上的侧翼扫描。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "cjkFriendly",
      referenceExport: "default",
    },
  ],
  correctness: [
    {
      name: "strong-kana",
      markdown: "これは**私のやりたかったこと。**だからするの。\n",
    },
    {
      name: "strong-after-punctuation",
      markdown: "カッコに注意**（太字にならない）**文が続く場合に要警戒。\n",
    },
    {
      name: "strong-mixed-latin",
      markdown: "**C#**や**F#**は**「.NET」**というプラットフォーム上で動作します。\n",
    },
    {
      name: "emphasis-kana",
      markdown: "*これは私のやりたいこと。*だからするの。\n",
    },
    { name: "latin-only", markdown: "**bold** text and *italic*.\n" },
    { name: "cjk-then-latin", markdown: "**日本語**English\n" },
    { name: "latin-then-cjk", markdown: "English**日本語**\n" },
    { name: "link-text", markdown: "[**強調**](https://example.com)\n" },
    { name: "nested-emphasis", markdown: "**これは *入れ子* です**\n" },
    { name: "code-span-inside", markdown: "先頭の**`コード`も注意。**\n" },
    { name: "intraword-cjk", markdown: "あ**い**う\n" },
    { name: "quotes", markdown: "「**強調**」\n" },
    {
      name: "chinese",
      markdown: "**推荐几个框架：**React、Vue等前端框架。\n",
    },
    { name: "korean", markdown: "**한국어**입니다.\n" },
    { name: "trailing-punctuation", markdown: "**終わり。**次\n" },
    { name: "escaped-marker", markdown: "\\**あ**\n" },
    { name: "underscore-strong", markdown: "__CJK強調__です\n" },
    { name: "multiple-paragraphs", markdown: "**あ。**\n\n**い。**\n" },
    { name: "heading", markdown: "# **見出し**です\n" },
    { name: "blockquote", markdown: "> **引用**です\n" },
    { name: "list-item", markdown: "- **項目**です\n" },
    { name: "unmatched-delimiter", markdown: "**あ。\n" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-delimiters",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"あ**い。**う\n".repeat(size)}\n`,
    },
    {
      name: "punctuation-dense",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"「**あ。**」".repeat(size)}\n`,
    },
    {
      name: "long-text",
      sizes: [256, 512, 1024, 2048],
      build: (size) => `${"あい。".repeat(size)}**強調**${"うえ。".repeat(size)}\n`,
    },
  ],
});

export default spec;
