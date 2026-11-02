import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-attrs/${kind}-${size}.md`,
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
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      why: {
        en: "Asserts the internal `attrs` core-rule count and that a second installation keeps the first parse options; the reference re-registers its rule and has no idempotent-install contract.",
        zh: "该文件断言内部 `attrs` core 规则的数量，以及第二次安装保留首次解析选项的行为；参考包会重新注册规则，也没有幂等安装的约定。",
      },
    },
    {
      file: "options.spec.ts",
      name: "",
      why: {
        en: "Uses this fork's option names (`rule`, `allowed`); the reference only accepts `allowedAttributes` / `allowedAttributeValues` and has no rule filter, so the options are ignored and the assertions never exercise reference behavior.",
        zh: "该文件使用本 fork 的选项名（`rule`、`allowed`）；参考包只接受 `allowedAttributes` / `allowedAttributeValues`，且没有规则过滤，因此这些选项会被忽略，断言不会作用于参考行为。",
      },
    },
    {
      file: "parseAttrs.spec.ts",
      name: "",
      why: {
        en: "Tests the fork-only `parseAttrs` helper; the reference exports only the plugin function, so the shim has no `parseAttrs` and the file cannot run.",
        zh: "该文件测试仅本 fork 提供的 `parseAttrs` 辅助函数；参考包只导出插件函数，shim 没有 `parseAttrs`，因此文件无法运行。",
      },
    },
    {
      file: "security.spec.ts",
      name: "should only keep data urls accepted by markdown-it",
      why: {
        en: "Calls the fork-only `parseAttrs` helper, which the reference does not export, so the assertion cannot run; the rendering-level security differences stay counted.",
        zh: "该测试调用仅本 fork 提供的 `parseAttrs` 辅助函数，参考包没有该导出，因此断言无法运行；渲染层面的安全差异仍计入统计。",
      },
    },
    {
      file: "security.spec.ts",
      name: "should drop dangerous attrs in programmatic parsing",
      why: {
        en: "Calls the fork-only `parseAttrs` helper, which the reference does not export, so the assertion cannot run; the rendering-level security differences stay counted.",
        zh: "该测试调用仅本 fork 提供的 `parseAttrs` 辅助函数，参考包没有该导出，因此断言无法运行；渲染层面的安全差异仍计入统计。",
      },
    },
    {
      file: "security.spec.ts",
      name: "should keep normal attributes in programmatic parsing",
      why: {
        en: "Calls the fork-only `parseAttrs` helper, which the reference does not export, so the assertion cannot run; the rendering-level security differences stay counted.",
        zh: "该测试调用仅本 fork 提供的 `parseAttrs` 辅助函数，参考包没有该导出，因此断言无法运行；渲染层面的安全差异仍计入统计。",
      },
    },
    {
      file: "security.spec.ts",
      name: "should not let allowed option bypass the safety filter",
      why: {
        en: "Calls the fork-only `parseAttrs` helper, which the reference does not export, so the assertion cannot run; the rendering-level security differences stay counted.",
        zh: "该测试调用仅本 fork 提供的 `parseAttrs` 辅助函数，参考包没有该导出，因此断言无法运行；渲染层面的安全差异仍计入统计。",
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
