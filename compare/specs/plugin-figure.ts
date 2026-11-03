import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-figure/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-figure",
  reference: "markdown-it-image-figures",
  notes: [
    {
      en: '`focusable` is disabled because the current package adds `tabindex="0"` to the image, while the reference `tabindex` option numbers figures from `1`; the reference option is therefore not used.',
      zh: '`focusable` 设为 `false`，因为当前包会给图片添加 `tabindex="0"`，而参考包的 `tabindex` 选项从 `1` 开始为 figure 编号；因此不使用参考包的该选项。',
    },
    {
      en: 'The current package derives `<figcaption>` from the image `title` and falls back to the `alt` text; `markdown-it-image-figures` has no fallback mode, so `figcaption: "title"` is compared and alt-only images are documented as a difference.',
      zh: '当前包从图片 `title` 生成 `<figcaption>`，并回退到 `alt` 文本；`markdown-it-image-figures` 没有回退模式，因此只对比 `figcaption: "title"`，仅有 alt 的图片被记录为差异。',
    },
    {
      en: "The current package skips hidden paragraphs (tight list items) so that a `<figcaption>` is never emitted without its `<figure>` wrapper; the reference converts images in tight list items without a `<figure>` wrapper. Documented in `tight-list-image`.",
      zh: "当前包会跳过隐藏段落（紧凑列表项），从而绝不在没有 `<figure>` 包裹的情况下输出 `<figcaption>`；参考包会转换紧凑列表项中的图片，但不生成 `<figure>` 包裹。已在 `tight-list-image` 中记录。",
    },
    {
      en: "`moveAttrs` is not compared: for `true` the current package copies non-native image attributes to `<figure>` and keeps them on the image, for a pattern list it moves them (the image loses them), and it merges `class`/`style` values. The reference `copyAttrs` copies every matching attribute to `<figure>` and keeps the original order on the image, which is not equivalent.",
      zh: "不对比 `moveAttrs`：取 `true` 时当前包将非原生图片属性复制到 `<figure>` 并保留在图片上，取模式列表时则移动这些属性（图片不再保留），并合并 `class`/`style` 值。参考包的 `copyAttrs` 会把每个匹配属性复制到 `<figure>`，并在图片上保留原始顺序，两者并不等价。",
    },
    {
      en: "Reference-only options (`dataType`, `link`, `tabindex`, `lazy`, `async`, `classes`, `removeSrc`) have no equivalent and are not compared.",
      zh: "仅参考包支持的选项（`dataType`、`link`、`tabindex`、`lazy`、`async`、`classes`、`removeSrc`）没有对应实现，因此不参与对比。",
    },
    {
      en: "Scaling: the reference core rule walks the token stream once and calls `md.parseInline` once per caption, so the work is linear in the document size and caption length; all three series measure ~1 (no superlinear behavior was found in the upstream implementation).",
      zh: "扩展性：参考包的核心规则只遍历一次 token 流，并为每个 caption 调用一次 `md.parseInline`，因此工作量与文档大小和 caption 长度成线性关系；三个序列的拟合指数均约为 1（上游实现中未发现超线性行为）。",
    },
    {
      en: "Attribute order is normalized.",
      zh: "属性顺序已归一化。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "figure",
      referenceExport: "default",
      ourOptions: { focusable: false },
      referenceOptions: { figcaption: "title" },
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      why: {
        en: "Asserts that the internal core rule named `figure` is registered exactly once; the reference registers a differently named rule and has no idempotent-install contract.",
        zh: "该测试断言名为 `figure` 的内部 core 规则只注册一次；参考包注册的规则名称不同，也没有幂等安装的约定。",
      },
    },
    {
      file: "figure.spec.ts",
      name: "should keep an existing tabindex",
      why: {
        en: 'The test helper inserts attributes with `md.core.ruler.before("figure", ...)`; the reference registers its rule as `image_figures`, so the helper cannot run.',
        zh: '测试辅助函数用 `md.core.ruler.before("figure", ...)` 插入属性；参考包的规则名为 `image_figures`，因此该辅助函数无法运行。',
      },
    },
    {
      file: "figure.spec.ts",
      name: "moveAttrs",
      why: {
        en: "`moveAttrs` is a fork-only option: the reference only has `copyAttrs` with different copy/move and merge semantics, so these attribute-merging tests have no reference equivalent and are documented as not compared.",
        zh: "`moveAttrs` 是仅本包提供的选项：参考包只有复制/移动与合并语义均不同的 `copyAttrs`，这些属性合并测试没有参考对应物，已记录为不参与对比。",
      },
    },
  ],
  correctness: [
    { name: "figure-title", markdown: '![Alt](image.png "Caption")' },
    {
      name: "figure-title-with-markup",
      markdown: '![Alt](image.png "*emph*, **strong** and `code`")',
    },
    {
      name: "figure-title-with-html",
      markdown: '![Alt](image.png "a < b & c")',
    },
    {
      name: "figure-title-with-quotes",
      markdown: String.raw`![Alt](image.png "A \"quoted\" title")`,
    },
    {
      name: "figure-alt-only",
      markdown: "![Alt text](image.png)",
      note: {
        en: 'The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.',
        zh: '当前包回退使用 alt 文本作为 caption，而参考包在 `figcaption: "title"` 下不输出 `<figcaption>`。',
      },
    },
    { name: "figure-empty-alt", markdown: "![](image.png)" },
    {
      name: "linked-image",
      markdown: '[![Alt](image.png "Caption")](https://example.com)',
    },
    {
      name: "linked-image-alt-only",
      markdown: "[![Alt text](image.png)](https://example.com)",
      note: {
        en: 'The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.',
        zh: '当前包回退使用 alt 文本作为 caption，而参考包在 `figcaption: "title"` 下不输出 `<figcaption>`。',
      },
    },
    { name: "inline-image", markdown: "Text with ![img](a.png) in the middle." },
    {
      name: "tight-list-image",
      markdown: '- ![Alt](image.png "Caption")',
      note: {
        en: "The current package skips images inside hidden (tight list) paragraphs, so the paragraph is untouched; the reference converts it and emits a `<figcaption>` without a `<figure>` wrapper.",
        zh: "当前包会跳过隐藏（紧凑列表）段落中的图片，因此该段落保持原样；参考包会进行转换，并输出不带 `<figure>` 包裹的 `<figcaption>`。",
      },
    },
    {
      name: "loose-list-image",
      markdown: '- ![Alt](image.png "Caption")\n\n- second item',
    },
    { name: "blockquote-image", markdown: '> ![Alt](image.png "Caption")' },
    { name: "table-image", markdown: '| A |\n|---|\n| ![Alt](image.png "Caption") |' },
    { name: "heading-image", markdown: '# ![Alt](image.png "Caption")' },
    {
      name: "reference-image",
      markdown: '![Alt][ref]\n\n[ref]: image.png "Caption"',
    },
    {
      name: "multiple-figures",
      markdown: '![One](1.png "First")\n\n![Two](2.png "Second")',
    },
    { name: "two-images-inline", markdown: '![a](1.png) ![b](2.png "T")' },
    { name: "escaped-image", markdown: String.raw`\![Alt](image.png "Caption")` },
    { name: "code-fence-image", markdown: '```\n![Alt](image.png "Caption")\n```' },
    { name: "empty-input", markdown: "\n" },
    { name: "no-figure-syntax", markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-figures",
      sizes: [64, 128, 256, 512],
      build: (size) => '![Alt](image.png "Caption")\n\n'.repeat(size),
    },
    {
      name: "long-captions",
      sizes: [64, 128, 256, 512],
      build: (size) =>
        `${Array.from({ length: size }, (_, index) => `![Alt](image${index}.png "${"caption text ".repeat(8)}")`).join("\n\n")}\n`,
    },
    {
      name: "linked-figures",
      sizes: [64, 128, 256, 512],
      build: (size) => '[![Alt](image.png "Caption")](https://example.com/)\n\n'.repeat(size),
    },
  ],
});

export default spec;
