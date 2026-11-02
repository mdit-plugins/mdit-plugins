import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-img-size/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-img-size",
  reference: "markdown-it-imsize",
  notes: [
    {
      en: "Only the deprecated `legacyImgSize` variant is compared: `imgSize` (`![alt =100x200](url)`) and `obsidianImgSize` (`![alt|100x200](url)`) are extensions of this package with no equivalent in `markdown-it-imsize`.",
      zh: "只对比已废弃的 `legacyImgSize` 变体：`imgSize`（`![alt =100x200](url)`）和 `obsidianImgSize`（`![alt|100x200](url)`）是本包的扩展，`markdown-it-imsize` 没有对应实现。",
    },
    {
      en: "The current package treats a dimension whose numeric value is `0` as unspecified and rejects a size whose width and height are both `0`; the reference emits the literal `0`. `zero-width`, `zero-height`, `zero-both` and `zero-percent-width` document this.",
      zh: "当前包将数值为 `0` 的维度视为未指定，并拒绝宽高均为 `0` 的尺寸；参考包会原样输出 `0`。`zero-width`、`zero-height`、`zero-both` 和 `zero-percent-width` 记录了这一点。",
    },
    {
      en: "The current package accepts a single trailing `%` per dimension (the documented syntax); the reference's number scanner accepts `%` anywhere, so `=5%0x3%0` is parsed by the reference only. Documented in `percent-in-middle`.",
      zh: "当前包对每个维度只接受一个末尾 `%`（文档中的语法）；参考包的数字扫描器接受任意位置的 `%`，因此 `=5%0x3%0` 只有参考包会解析。已在 `percent-in-middle` 中记录。",
    },
    {
      en: "The current package accepts any whitespace before the size specification, while the reference requires a literal space (its check is `charCodeAt(pos - 1) === 0x20`); `tab-before-size` is therefore parsed by the current package only.",
      zh: "当前包接受尺寸规格前的任意空白，而参考包要求一个字面空格（其检查为 `charCodeAt(pos - 1) === 0x20`）；因此 `tab-before-size` 只有当前包会解析。",
    },
    {
      en: "The reference `autofill` option is not compared: it reads image files from disk (`image-size`) and its output depends on the filesystem.",
      zh: "不对比参考包的 `autofill` 选项：它会从磁盘读取图片文件（`image-size`），输出依赖文件系统。",
    },
    {
      en: "Scaling: the reference image rule re-attempts `parseLinkLabel` for every `![` opener and parses every label again; malformed sizes fall back to the core image rule. markdown-it caches `skipToken` positions, so all series stay ~linear (no superlinear behavior was found in the upstream implementation).",
      zh: "扩展性：参考包的图片规则会为每个 `![` 起始符重新尝试 `parseLinkLabel`，并再次解析每个 label；格式错误的尺寸会回退到核心 image 规则。markdown-it 会缓存 `skipToken` 位置，因此所有序列都保持近似线性（上游实现中未发现超线性行为）。",
    },
    {
      en: "Attribute order is normalized.",
      zh: "属性顺序已归一化。",
    },
  ],
  variants: [
    {
      id: "legacy",
      ourExport: "legacyImgSize",
      referenceExport: "default",
    },
  ],
  correctness: [
    { name: "width-and-height", markdown: "![Alt](image.png =100x200)" },
    { name: "width-only", markdown: "![Alt](image.png =100x)" },
    { name: "height-only", markdown: "![Alt](image.png =x200)" },
    { name: "title-and-size", markdown: '![Alt](image.png "Title" =100x200)' },
    { name: "percent-width", markdown: "![Alt](image.png =50%x300)" },
    { name: "percent-height", markdown: "![Alt](image.png =100x50%)" },
    {
      name: "zero-width",
      markdown: "![Alt](image.png =0x200)",
      note: {
        en: 'The current package drops a `0` width (treated as unspecified), the reference emits `width="0"`.',
        zh: '当前包会丢弃 `0` 宽度（视为未指定），参考包输出 `width="0"`。',
      },
    },
    {
      name: "zero-height",
      markdown: "![Alt](image.png =100x0)",
      note: {
        en: 'The current package drops a `0` height (treated as unspecified), the reference emits `height="0"`.',
        zh: '当前包会丢弃 `0` 高度（视为未指定），参考包输出 `height="0"`。',
      },
    },
    {
      name: "zero-both",
      markdown: "![Alt](image.png =0x0)",
      note: {
        en: 'The current package rejects an all-zero size and leaves the markdown unparsed as an image, the reference renders the image with `width="0" height="0"`.',
        zh: '当前包拒绝全零尺寸，并把该 Markdown 保留为未解析的图片语法；参考包会渲染图片并输出 `width="0" height="0"`。',
      },
    },
    {
      name: "zero-percent-width",
      markdown: "![Alt](image.png =0%x200)",
      note: {
        en: 'The current package treats `0%` as an unspecified width, the reference emits `width="0%"`.',
        zh: '当前包将 `0%` 视为未指定宽度，参考包输出 `width="0%"`。',
      },
    },
    {
      name: "percent-in-middle",
      markdown: "![Alt](image.png =5%0x3%0)",
      note: {
        en: "The reference number scanner accepts `%` anywhere in a dimension, while the current package only accepts one trailing `%`.",
        zh: "参考包的数字扫描器接受尺寸中任意位置的 `%`，而当前包只接受一个末尾 `%`。",
      },
    },
    {
      name: "tab-before-size",
      markdown: "![Alt](image.png\t=100x200)",
      note: {
        en: "The current package accepts a tab before the size, the reference only accepts a literal space.",
        zh: "当前包接受尺寸前的制表符，参考包只接受字面空格。",
      },
    },
    { name: "no-size", markdown: "![Alt](image.png)" },
    { name: "malformed-size", markdown: "![Alt](image.png =100)" },
    { name: "malformed-trailing-x", markdown: "![Alt](image.png =x100x200)" },
    {
      name: "no-space-before-size",
      markdown: "![Alt](image.png=100x200)",
    },
    {
      name: "reference-image",
      markdown: '![Alt][ref]\n\n[ref]: image.png "Title"',
    },
    {
      name: "inline-image",
      markdown: "Text ![Alt](image.png =100x200) here",
    },
    {
      name: "multiple-images",
      markdown: "![a](1.png =10x20) ![b](2.png =30x)",
    },
    {
      name: "size-before-title",
      markdown: '![Alt](image.png =100x200 "Title")',
    },
    {
      name: "newline-before-size",
      markdown: "![Alt](image.png\n=100x200)",
    },
    {
      name: "leading-space-in-destination",
      markdown: "![Alt]( image.png =100x200)",
    },
    { name: "escaped-image", markdown: String.raw`\![Alt](image.png =100x200)` },
    { name: "empty-input", markdown: "\n" },
    {
      name: "no-size-syntax",
      markdown: "# Title\n\nParagraph with [link](https://example.com) and ![image](a.png).",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "sized-images",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"![Alt](image.png =100x200) ".repeat(size)}\n`,
    },
    {
      name: "malformed-sizes",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"![Alt](image.png =100) ".repeat(size)}\n`,
    },
    {
      name: "unmatched-labels",
      sizes: [64, 128, 256, 512],
      build: (size) => `${"![a ".repeat(size)}\n`,
    },
  ],
});

export default spec;
