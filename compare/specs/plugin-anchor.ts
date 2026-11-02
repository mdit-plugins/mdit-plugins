import MarkdownIt from "markdown-it";

import type { CompareRenderer, ComparisonSpec, PluginFunction, PluginModule } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Minimal permalink generator signature shared by both packages */
type PermalinkGenerator = (
  slug: string,
  options: unknown,
  state: unknown,
  index: number,
) => unknown;

/** Minimal permalink preset factory signature shared by both packages */
type PermalinkPreset = (options?: Record<string, unknown>) => PermalinkGenerator;

/** Options passed to the permalink presets of both sides */
const PERMALINK_OPTIONS: Record<string, unknown> = { class: "anchor-link", symbol: "¶" };

/**
 * Create a renderer that installs the current package with its exported legacy slugify
 *
 * `legacySlugify` is the equivalent of the reference default slugify, so heading ids become
 * comparable while every other default stays untouched.
 *
 * @param module - Module namespace of the current package
 * @returns A renderer that turns markdown into HTML
 */
const createOurLegacyRenderer = (module: PluginModule): CompareRenderer => {
  const md = new MarkdownIt();

  md.use(module.anchor as PluginFunction, { slugify: module.legacySlugify });

  return (markdown: string): string => md.render(markdown);
};

/**
 * Create a renderer that installs a permalink preset of the current package
 *
 * The current package exports its presets as named exports.
 *
 * @param preset - Preset export name
 * @returns A renderer factory
 */
const createOurPermalinkRenderer =
  (preset: string) =>
  (module: PluginModule): CompareRenderer => {
    const md = new MarkdownIt();
    const presetFactory = module[preset] as PermalinkPreset;

    md.use(module.anchor as PluginFunction, {
      slugify: module.legacySlugify,
      permalink: presetFactory(PERMALINK_OPTIONS),
    });

    return (markdown: string): string => md.render(markdown);
  };

/**
 * Create a renderer that installs a permalink preset of the reference package
 *
 * The reference exposes its presets on the `permalink` property of the default export.
 *
 * @param preset - Preset name under `permalink`
 * @returns A renderer factory
 */
const createReferencePermalinkRenderer =
  (preset: string) =>
  (module: PluginModule): CompareRenderer => {
    const md = new MarkdownIt();
    const anchorPlugin = module.default as PluginFunction & {
      permalink: Record<string, PermalinkPreset>;
    };

    md.use(anchorPlugin, { permalink: anchorPlugin.permalink[preset](PERMALINK_OPTIONS) });

    return (markdown: string): string => md.render(markdown);
  };

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-anchor/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-anchor",
  reference: "markdown-it-anchor",
  notes: [
    {
      en: "The `default` variant uses the defaults of both packages. The current package intentionally ships a different default slugify than the reference legacy percent-encoding slugify: it lowercases ASCII, keeps non-ASCII characters (e.g. CJK), folds whitespace and dashes into a single dash and strips other ASCII punctuation. Headings with punctuation, CJK or raw HTML text therefore produce different ids; those cases carry a `note`. Generated ids are compared byte for byte and are never normalized.",
      zh: "`default` 变体使用两个包的默认配置。当前包有意提供与参考包旧版百分号编码 slugify 不同的默认 slugify：它将 ASCII 转为小写，保留非 ASCII 字符（如 CJK），把空白和连字符折叠为单个连字符，并去除其他 ASCII 标点。因此，含标点、CJK 或原始 HTML 文本的标题会产生不同的 id；这些用例带有 `note`。生成的 id 按字节比较，从不归一化。",
    },
    {
      en: "The `legacy-slugify` variant configures the current package with its exported `legacySlugify`, which is byte-identical to the reference default slugify, so every heading id matches.",
      zh: "`legacy-slugify` 变体为当前包配置其导出的 `legacySlugify`，它与参考包的默认 slugify 逐字节相同，因此所有标题 id 都一致。",
    },
    {
      en: "`link-inside-header` compares the `linkInsideHeader` permalink presets with the same `class` and `symbol` options and a matching slugify. Markup is identical except for the empty-slug placeholder difference.",
      zh: "`link-inside-header` 使用相同的 `class`、`symbol` 选项和匹配的 slugify 比较 `linkInsideHeader` 永久链接预设。除空 slug 占位符差异外，标记完全相同。",
    },
    {
      en: "`header-link` compares the `headerLink` presets. The current preset leaves headings that already contain a link untouched, because wrapping them would emit invalid nested `<a>` elements, while the reference wraps the existing link; that case carries a `note`.",
      zh: "`header-link` 比较 `headerLink` 预设。当前预设不会改动已包含链接的标题，因为再包裹会产生无效的嵌套 `<a>` 元素；参考包则会包裹已有链接。该用例带有 `note`。",
    },
    {
      en: 'Empty slugs are behavior, not a formatting difference: for headings without text (image-only or empty headings) the reference emits `id=""`, while the current package falls back to its `defaultPlaceHolder` option (`heading`). These cases carry a `note`.',
      zh: '空 slug 属于行为差异而非格式差异：对于没有文本的标题（仅图片或空标题），参考包输出 `id=""`，当前包则回退到其 `defaultPlaceHolder` 选项（`heading`）。这些用例带有 `note`。',
    },
    {
      en: "Manual heading ids (e.g. set by plugin-attrs) are not compared: both packages reuse a preset id and both throw on duplicate explicit ids (reference default `failOnNonUnique: true`; the current package has no option to disable the failure).",
      zh: "不比较手动设置的标题 id（例如由 plugin-attrs 设置）：两个包都会复用预设 id，且遇到重复的显式 id 都会抛错（参考包默认 `failOnNonUnique: true`；当前包没有可关闭该失败的选项）。",
    },
    {
      en: "Scaling: `duplicate-headings` is quadratic in the reference, because its unique-slug loop rescans the used-slug map for every duplicate; the current package resumes from the last used candidate and stays linear. `unique-headings` exposes the leftover `state.tokens.indexOf(token)` call the reference executes for every heading after the permalink step (the O(n²) loop from markdown-it-anchor#80); the current package only rescans when a permalink actually moves the heading token. `heading-inline-content` is the linear baseline.",
      zh: "扩展性：`duplicate-headings` 在参考包中呈二次增长，因为其唯一 slug 循环会为每个重复项重新扫描已用 slug 映射；当前包从最后使用的候选项继续，保持线性。`unique-headings` 暴露了参考包在永久链接步骤后为每个标题执行的 `state.tokens.indexOf(token)` 调用（即 markdown-it-anchor#80 中的 O(n²) 循环）；当前包仅在永久链接实际移动标题 token 时才重新扫描。`heading-inline-content` 是线性基线。",
    },
    {
      en: "Benchmarks render fixed corpora (`normal` = sparse headings, `heavy` = heading-dense) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.",
      zh: "基准测试渲染固定语料（`normal` = 稀疏标题，`heavy` = 标题密集），并交错比较双方；结果文件中的比率和指数值来自受控的顺序对比运行，而不是临时运行。",
    },
    {
      en: "Only attribute order is normalized (the harness default); no other normalization is applied.",
      zh: "仅归一化属性顺序（测试框架默认行为）；不应用其他归一化。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "anchor",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
    {
      id: "legacy-slugify",
      createOurRenderer: createOurLegacyRenderer,
    },
    {
      id: "link-inside-header",
      createOurRenderer: createOurPermalinkRenderer("linkInsideHeader"),
      createReferenceRenderer: createReferencePermalinkRenderer("linkInsideHeader"),
    },
    {
      id: "header-link",
      createOurRenderer: createOurPermalinkRenderer("headerLink"),
      createReferenceRenderer: createReferencePermalinkRenderer("headerLink"),
    },
  ],
  correctness: [
    {
      name: "no-headings",
      markdown:
        "A plain paragraph without headings.\n\n- a list item\n- another item\n\n```ts\nconst value = 1;\n```",
    },
    { name: "single-heading", markdown: "# Hello World" },
    {
      name: "heading-levels",
      markdown: "# a\n\n## b\n\n### c\n\n#### d\n\n##### e\n\n###### f",
    },
    {
      name: "heading-inline-markup",
      markdown: "## Hello *emphasis* and `code` and **bold**",
    },
    {
      name: "heading-with-link",
      markdown: "## Heading with [link](https://example.com)",
      note: {
        en: "Our `headerLink` preset leaves this heading untouched; the reference wraps the existing link and emits nested anchors. The `default`, `legacy-slugify` and `link-inside-header` variants match.",
        zh: "当前包的 `headerLink` 预设不会改动该标题；参考包包裹已有链接并产生嵌套锚点。`default`、`legacy-slugify` 和 `link-inside-header` 变体一致。",
      },
    },
    {
      name: "heading-image-only",
      markdown: "## ![alt](image.png)",
      note: {
        en: 'No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.',
        zh: '没有文本 token，因此双方的 slugify 都生成空 slug。参考包保留 `id=""`；当前包通过 `defaultPlaceHolder` 回退到 `heading`。',
      },
    },
    {
      name: "heading-empty",
      markdown: "#\n\n##",
      note: {
        en: 'Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.',
        zh: '空标题：参考包输出 `id=""` 和 `id="-1"`；当前包输出 `heading` 占位符和 `heading-1`。',
      },
    },
    {
      name: "heading-punctuation",
      markdown: "## Hello, World! How are you?",
      note: {
        en: "Default slugify policy difference: the reference percent-encodes `,`, `!` and `?`, the current default strips them.",
        zh: "默认 slugify 策略差异：参考包对 `,`、`!` 和 `?` 进行百分号编码，当前包默认将其去除。",
      },
    },
    {
      name: "heading-cjk",
      markdown: "## 你好 世界",
      note: {
        en: "Default slugify policy difference: the reference percent-encodes CJK characters, the current default keeps them.",
        zh: "默认 slugify 策略差异：参考包对 CJK 字符进行百分号编码，当前包默认保留它们。",
      },
    },
    {
      name: "heading-only-punctuation",
      markdown: "## !!!",
      note: {
        en: "The current default strips all punctuation and falls back to `heading`; the reference keeps `!!!` (percent-encoding leaves `!` untouched).",
        zh: "当前包默认去除所有标点并回退到 `heading`；参考包保留 `!!!`（百分号编码不会改动 `!`）。",
      },
    },
    {
      name: "heading-html",
      markdown: "## Heading with <em>raw html</em>",
      note: {
        en: "With `html: false` the angle brackets are text; the reference percent-encodes them and the current default strips them.",
        zh: "在 `html: false` 下，尖括号是文本；参考包对其进行百分号编码，当前包默认将其去除。",
      },
    },
    { name: "heading-tab", markdown: "## Tab\there" },
    { name: "heading-trailing-spaces", markdown: "## Trailing   spaces   " },
    { name: "heading-code-only", markdown: "## `inline_code` only code" },
    {
      name: "duplicate-headings",
      markdown: "## Same title\n\n## Same title\n\n## Same title",
    },
    {
      name: "duplicate-existing-index",
      markdown: "## Test\n\n## Test\n\n## Test 1",
    },
    { name: "multi-word", markdown: "## Multi-word Heading_title 123" },
    {
      name: "setext-headings",
      markdown: "Setext Heading\n===\n\nAnother\n---",
    },
    {
      name: "heading-in-blockquote",
      markdown: "> ## Quoted heading\n>\n> text",
    },
    { name: "heading-in-list", markdown: "- ## List heading" },
    {
      name: "nested-headings",
      markdown: "# Top\n\n> ## Quoted\n>\n> - ### Listed\n\nText after the quote.",
    },
    { name: "not-a-heading", markdown: "#NotAHeading\n\nText with # hash" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "duplicate-headings",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${Array.from({ length: size }, () => "## Same heading").join("\n\n")}\n`,
    },
    {
      name: "unique-headings",
      sizes: [1024, 2048, 4096, 8192],
      build: (size) =>
        `${Array.from({ length: size }, (_, index) => `## Unique heading ${index}`).join("\n\n")}\n`,
    },
    {
      name: "heading-inline-content",
      sizes: [256, 512, 1024, 2048],
      build: (size) =>
        `${Array.from(
          { length: size },
          (_, index) =>
            `## Heading ${index} with *emphasis*, \`code\` and [link](https://example.com/${index})`,
        ).join("\n\n")}\n`,
    },
  ],
});

export default spec;
