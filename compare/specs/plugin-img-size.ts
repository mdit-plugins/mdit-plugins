import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-img-size/${kind}.md`,
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
      en: "The current package treats a dimension whose numeric value is `0` as unspecified and rejects a size whose width and height are both `0`; the reference emits the literal `0`. Tracked by the `zero-dimension-handling` issue.",
      zh: "当前包将数值为 `0` 的维度视为未指定，并拒绝宽高均为 `0` 的尺寸；参考包会原样输出 `0`。归入 `zero-dimension-handling` issue。",
    },
    {
      en: "The current package accepts a single trailing `%` per dimension (the documented syntax); the reference's number scanner accepts `%` anywhere, so `=5%0x3%0` yields invalid dimension values. Tracked by the `percent-inside-dimension` issue.",
      zh: "当前包对每个维度只接受一个末尾 `%`（文档中的语法）；参考包的数字扫描器接受任意位置的 `%`，因此 `=5%0x3%0` 会得到非法的尺寸值。归入 `percent-inside-dimension` issue。",
    },
    {
      en: "The current package accepts any whitespace before the size specification, while the reference requires a literal space (its check is `charCodeAt(pos - 1) === 0x20`); `tab-before-size` is therefore parsed by the current package only. Tracked by the `size-prefix-whitespace` issue.",
      zh: "当前包接受尺寸规格前的任意空白，而参考包要求一个字面空格（其检查为 `charCodeAt(pos - 1) === 0x20`）；因此 `tab-before-size` 只有当前包会解析。归入 `size-prefix-whitespace` issue。",
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
  issues: [
    {
      id: "image-token-content",
      category: "difference",
      note: {
        en: "The reference builds its own image tokens without the `content` field (the raw alt text) that markdown-it's image rule sets; rendering is identical because the `alt` attribute is built from the child tokens, so this is only a token representation difference.",
        zh: "参考包自行构造 image token 时没有写入 markdown-it image 规则会设置的 `content`（原始 alt 文本）；由于 `alt` 属性由子 token 生成，渲染结果完全一致，因此这只是 token 表示差异。",
      },
    },
    {
      id: "zero-dimension-handling",
      category: "difference",
      note: {
        en: 'The current package treats a `0` dimension as unspecified and rejects sizes whose width and height are both `0` (Obsidian behavior), while the reference emits `width="0"` / `height="0"`; both outputs are valid.',
        zh: '当前包将 `0` 维度视为未指定，并拒绝宽高均为 `0` 的尺寸（Obsidian 行为），而参考包会输出 `width="0"` / `height="0"`；两种输出都合法。',
      },
    },
    {
      id: "percent-inside-dimension",
      category: "reference-error",
      note: {
        en: "The reference's number scanner accepts `%` anywhere, so `=5%0x3%0` produces the invalid dimension values `5%0` and `3%0`; the current package only accepts a single trailing `%` and leaves the malformed size literal.",
        zh: "参考包的数字扫描器接受任意位置的 `%`，因此 `=5%0x3%0` 会产生非法的尺寸值 `5%0` 和 `3%0`；当前包只接受单个末尾 `%`，并保留这段非法尺寸的字面文本。",
      },
    },
    {
      id: "size-prefix-whitespace",
      category: "difference",
      note: {
        en: "The current package accepts any whitespace before the size specification, while the reference requires a literal space and therefore leaves `![Alt](image.png\\t=100x200)` unrendered; the tab form is an intentional extension.",
        zh: "当前包接受尺寸规格前的任意空白，而参考包要求字面空格，因此 `![Alt](image.png\\t=100x200)` 不会被参考包渲染；制表符形式是本包有意的扩展。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "imgSize.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "The whole file tests the fork-only `imgSize` variant (`![alt =100x200](url)`); `markdown-it-imsize` only implements the legacy `(url =100x200)` syntax, so the shim exposes no `imgSize` export.",
        zh: "整个文件测试仅本包提供的 `imgSize` 变体（`![alt =100x200](url)`）；`markdown-it-imsize` 只实现旧式 `(url =100x200)` 语法，shim 没有 `imgSize` 导出。",
      },
    },
    {
      file: "obsidianImgSize.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "The whole file tests the fork-only `obsidianImgSize` variant (`![alt|100x200](url)`), which `markdown-it-imsize` does not implement at all; the shim exposes no `obsidianImgSize` export.",
        zh: "整个文件测试仅本包提供的 `obsidianImgSize` 变体（`![alt|100x200](url)`），`markdown-it-imsize` 完全没有对应实现；shim 没有 `obsidianImgSize` 导出。",
      },
    },
    {
      file: "together.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Sets up `legacyImgSize`, `imgSize` and `obsidianImgSize` together; since the reference only provides the legacy behavior, the combined three-variant document cannot run against it.",
        zh: "该文件同时安装 `legacyImgSize`、`imgSize` 和 `obsidianImgSize`；参考包只提供旧式行为，因此三变体组合的文档无法在其上运行。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "",
      category: "feature-gap",
      why: {
        en: "Asserts the rule registration and idempotent-install contract of the two fork-only variants plus the legacy rule; the reference exposes none of those APIs, although its legacy rule renders correctly when installed twice.",
        zh: "该文件断言两个仅本包提供的变体及旧式规则的规则注册与幂等安装约定；参考包没有提供这些 API（虽然其旧式规则重复安装时渲染正确）。",
      },
    },
  ],
  correctness: [
    {
      name: "width-and-height",
      markdown: "![Alt](image.png =100x200)",
      issue: "image-token-content",
    },
    { name: "width-only", markdown: "![Alt](image.png =100x)", issue: "image-token-content" },
    { name: "height-only", markdown: "![Alt](image.png =x200)", issue: "image-token-content" },
    {
      name: "title-and-size",
      markdown: '![Alt](image.png "Title" =100x200)',
      issue: "image-token-content",
    },
    {
      name: "percent-width",
      markdown: "![Alt](image.png =50%x300)",
      issue: "image-token-content",
    },
    {
      name: "percent-height",
      markdown: "![Alt](image.png =100x50%)",
      issue: "image-token-content",
    },
    {
      name: "zero-width",
      markdown: "![Alt](image.png =0x200)",
      issue: "zero-dimension-handling",
    },
    {
      name: "zero-height",
      markdown: "![Alt](image.png =100x0)",
      issue: "zero-dimension-handling",
    },
    {
      name: "zero-both",
      markdown: "![Alt](image.png =0x0)",
      issue: "zero-dimension-handling",
    },
    {
      name: "zero-percent-width",
      markdown: "![Alt](image.png =0%x200)",
      issue: "zero-dimension-handling",
    },
    {
      name: "percent-in-middle",
      markdown: "![Alt](image.png =5%0x3%0)",
      issue: "percent-inside-dimension",
    },
    {
      name: "tab-before-size",
      markdown: "![Alt](image.png\t=100x200)",
      issue: "size-prefix-whitespace",
    },
    { name: "no-size", markdown: "![Alt](image.png)", issue: "image-token-content" },
    { name: "malformed-size", markdown: "![Alt](image.png =100)" },
    { name: "malformed-trailing-x", markdown: "![Alt](image.png =x100x200)" },
    {
      name: "no-space-before-size",
      markdown: "![Alt](image.png=100x200)",
      issue: "image-token-content",
    },
    {
      name: "reference-image",
      markdown: '![Alt][ref]\n\n[ref]: image.png "Title"',
      issue: "image-token-content",
    },
    {
      name: "inline-image",
      markdown: "Text ![Alt](image.png =100x200) here",
      issue: "image-token-content",
    },
    {
      name: "multiple-images",
      markdown: "![a](1.png =10x20) ![b](2.png =30x)",
      issue: "image-token-content",
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
      issue: "image-token-content",
    },
    { name: "escaped-image", markdown: String.raw`\![Alt](image.png =100x200)` },
    { name: "empty-input", markdown: "\n" },
    {
      name: "no-size-syntax",
      markdown: "# Title\n\nParagraph with [link](https://example.com) and ![image](a.png).",
      issue: "image-token-content",
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
