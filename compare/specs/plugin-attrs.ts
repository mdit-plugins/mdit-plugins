import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-attrs/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-attrs",
  reference: "markdown-it-attrs",
  notes: [
    {
      en: "`fenceAttrsOnPre` is set to `false` on the current package so that fence attrs are placed on `<code>`, matching the reference default.",
      zh: "当前包将 `fenceAttrsOnPre` 设为 `false`，使围栏属性放在 `<code>` 上，与参考包的默认行为一致。",
    },
    {
      en: "Table extension rules (`rowspan` / `colspan` cells) are not compared because the reference does not implement them.",
      zh: "不比较表格扩展规则（`rowspan` / `colspan` 单元格），因为参考包未实现它们。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "attrs",
      referenceExport: "default",
      ourOptions: { fenceAttrsOnPre: false },
      referenceOptions: {},
    },
  ],
  issues: [
    {
      id: "table-meta-key",
      category: "difference",
      note: {
        en: "Both packages store the table column count on the table token's `meta` for their cell-span rules, but under different keys (reference `colsnum`, current `columnCount`); the rendered HTML matches.",
        zh: "两个包都为单元格跨列规则把表格列数写入表格 token 的 `meta`，但键名不同（参考包 `colsnum`，当前包 `columnCount`）；渲染结果一致。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "should not register the rule twice when installed twice",
      category: "feature-gap",
      why: {
        en: "The reference does not guard repeated installation and registers its core rule again under a different name (`curly_attributes`), but repeated installation still renders correctly; this package registers the `attrs` rule once.",
        zh: "参考包未防范多次安装，会以不同名称（`curly_attributes`）重复注册 core 规则，但重复安装后渲染结果仍正确；本包只注册一次 `attrs` 规则。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "should keep the first installation's parse options",
      category: "feature-gap",
      why: {
        en: "This package supports the `rule` option and keeps the first installation's options; the reference has no `rule` option and applies both installations' options.",
        zh: "本包支持 `rule` 选项并在重复安装时保留首次选项，参考包没有 `rule` 选项，且两次安装的配置都会生效。",
      },
    },
    {
      file: "options.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "This package provides the `rule` / `allowed` options for rule and attribute filtering; the reference only accepts `allowedAttributes` / `allowedAttributeValues` and has no rule filter.",
        zh: "本包提供 `rule` / `allowed` 选项用于规则与属性过滤，参考包只接受 `allowedAttributes` / `allowedAttributeValues`，没有规则过滤功能。",
      },
    },
    {
      file: "parseAttrs.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "This package additionally exports the `parseAttrs` parsing helper; the reference only exports the plugin function, so the shim has no `parseAttrs`.",
        zh: "本包额外导出 `parseAttrs` 解析辅助函数，参考包只导出插件函数，shim 中没有 `parseAttrs`。",
      },
    },
    {
      file: "security.spec.ts",
      name: "should only keep data urls accepted by markdown-it",
      category: "feature-gap",
      why: {
        en: "This test calls the `parseAttrs` helper, which the reference does not export; the rendering-level security differences stay counted.",
        zh: "该测试调用本包导出的 `parseAttrs` 辅助函数，参考包没有该导出；渲染层面的安全差异仍计入统计。",
      },
    },
    {
      file: "security.spec.ts",
      name: "programmatic parsing",
      category: "feature-gap",
      why: {
        en: "These tests call the `parseAttrs` helper, which the reference does not export; the rendering-level security differences stay counted.",
        zh: "这些测试调用本包导出的 `parseAttrs` 辅助函数，参考包没有该导出；渲染层面的安全差异仍计入统计。",
      },
    },
    {
      file: "security.spec.ts",
      name: "should not let allowed option bypass the safety filter",
      category: "feature-gap",
      why: {
        en: "This test calls the `parseAttrs` helper with this package's `allowed` option, which the reference does not provide.",
        zh: "该测试用本包的 `allowed` 选项调用 `parseAttrs` 辅助函数，参考包没有提供这些能力。",
      },
    },
  ],
  correctness: [
    { name: "heading-id", markdown: "## Hello World {#say-hello-world}" },
    {
      name: "heading-multiple-attrs",
      markdown: "## Hello {#heading .big data-level=2}",
    },
    { name: "inline-image", markdown: "![img](link/to/image.png){.full-width}" },
    { name: "inline-code", markdown: "Text with `inline code`{.code data-lang=js}." },
    { name: "inline-emphasis", markdown: "Text with *emphasis*{.italic} and **bold**{.bold}." },
    {
      name: "inline-link",
      markdown: '[link](https://example.com){.link target=_blank aria-label="example"}',
    },
    {
      name: "block-paragraph",
      markdown:
        'A paragraph with some text. {#p .a .b align=center data-value="content with spaces"}',
    },
    { name: "block-leading", markdown: "{.lead}\nA paragraph with a leading attrs block." },
    { name: "list-item", markdown: "- first item {.first}\n- second item {.second}" },
    {
      name: "nested-list",
      markdown: "- first item {.first}\n  - nested item {.nested}\n- second item",
    },
    {
      name: "table",
      markdown: "| A | B |\n|---|---|\n| 1 | 2 |\n\n{.table border=1}",
      issue: "table-meta-key",
    },
    { name: "fence", markdown: "```js {.hl data-lang=javascript}\nconst a = 1;\n```" },
    { name: "fence-info-string", markdown: "```js title=example\nconst a = 1;\n```" },
    { name: "horizontal-rule", markdown: "--- {.horizontal}" },
    { name: "softbreak", markdown: "first line  \n{.break}\nsecond line" },
    { name: "escaped-attrs", markdown: String.raw`A paragraph with escaped \{#not-an-id} attrs.` },
    { name: "empty-attrs", markdown: "A paragraph with empty attrs {}. " },
    { name: "no-attrs", markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b" },
    { name: "multiline-paragraph", markdown: "line one\nline two\nline three {.last}" },
    { name: "blockquote", markdown: "> quoted text {.quote}" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "inline-attrs",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"word {.cls} ".repeat(size)}\n`,
    },
    {
      name: "unmatched-braces",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"{".repeat(size)}text\n`,
    },
    {
      name: "heading-attrs",
      sizes: [64, 128, 256, 512],
      build: (size) =>
        Array.from({ length: size }, (_, index) => `## Heading ${index} {#id-${index} .cls}`).join(
          "\n",
        ),
    },
  ],
});

export default spec;
