import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-cjk-breaks/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-cjk-breaks",
  reference: "markdown-it-cjk-breaks",
  notes: [
    {
      en: "The current package is a rewrite of the reference implementation. Both are installed with their defaults and no options are involved, so the comparison is a direct behavior check of the soft-break handling.",
      zh: "当前包是参考实现的重写版本。两者都使用默认配置安装，不涉及选项，因此对比直接检验软换行的处理行为。",
    },
    {
      en: "The reference only rewrites `softbreak` tokens into text; the current package also runs as a core rule and keeps the same token stream, which is why the token comparison also reports equal output.",
      zh: "参考包只把 `softbreak` token 改写为文本；当前包同样作为 core 规则运行并保持相同的 token 流，因此 token 对比结果也一致。",
    },
    {
      en: "Benchmarks measure the complete core-rule pass; the `many-softbreaks` series is linear in the number of soft breaks, and `long-line` exercises the per-character East Asian width lookup on a single line.",
      zh: "基准测试测量完整的 core 规则处理；`many-softbreaks` 系列随软换行数量线性增长，`long-line` 系列检验单行上逐字符的东亚宽度查询。",
    },
  ],
  testSuiteSkips: [
    {
      file: "cjkBreaks.spec.ts",
      name: "inline token processing",
      why: {
        en: "This test calls the internal `processInlines` helper that is exported for tests only; the reference package exposes the plugin alone, so the helper has no counterpart.",
        zh: "该测试调用了仅为测试导出的内部 `processInlines` 辅助函数；参考包只导出插件本身，没有对应的辅助函数。",
      },
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "cjkBreaks",
      referenceExport: "default",
    },
  ],
  correctness: [
    { name: "cjk-japanese", markdown: "あおえ\nいう\n" },
    { name: "cjk-han-kana", markdown: "漢字\nかな\n" },
    { name: "fullwidth-punctuation", markdown: "！＂＃\n＄％\n" },
    { name: "halfwidth-kana", markdown: "ｱｵｴ\nｲｳ\n" },
    { name: "astral-cjk", markdown: "𩸽\n🈀\n" },
    { name: "zwsp-before-break", markdown: "foo\u200B\nbar\n" },
    { name: "zwsp-after-break", markdown: "foo\n\u200Bbar\n" },
    { name: "zwsp-both-sides", markdown: "foo\u200B\nbar\n\u200Bbaz\n" },
    { name: "latin-kept", markdown: "foo\nbar\n" },
    { name: "cjk-latin-kept", markdown: "あ\nabc\n" },
    { name: "cjk-emoji-kept", markdown: "あ\n😀\n" },
    { name: "inline-emphasis", markdown: "**あ**\n**い**\n" },
    { name: "inline-code", markdown: "`あ`\n`い`\n" },
    { name: "inline-link", markdown: "[あ](https://example.com)\nい\n" },
    { name: "inline-image", markdown: "![あ](x.png)\nい\n" },
    { name: "hardbreak-kept", markdown: "あ  \nい\n" },
    { name: "trailing-space", markdown: "あ \nい\n" },
    { name: "multiple-paragraphs", markdown: "あ\nい\n\nう\nえ\n" },
    { name: "blockquote", markdown: "> あ\n> い\n" },
    { name: "list-item", markdown: "- あ\n  い\n" },
    { name: "heading", markdown: "# あ\nい\n" },
    { name: "code-block-kept", markdown: "```\nあ\nい\n```\n" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-softbreaks",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"あ\nい\n".repeat(size)}\n`,
    },
    {
      name: "long-line",
      sizes: [256, 512, 1024, 2048],
      build: (size) => `${"あい".repeat(size)}\n`,
    },
    {
      name: "mixed-inline-tokens",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"**あ**\n`い`\n".repeat(size)}\n`,
    },
  ],
});

export default spec;
