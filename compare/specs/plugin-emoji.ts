import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Custom emoji data for the bare variant, which ships no built-in definitions */
const BARE_DEFINITIONS: Record<string, string> = {
  smile: "😄",
  heart: "❤️",
  rocket: "🚀",
  tada: "🎉",
  coffee: "☕",
};

/** Custom shortcuts for the bare variant */
const BARE_SHORTCUTS: Record<string, string[]> = {
  smile: [":)", ":-)"],
  heart: ["<3"],
};

/** Emoji names kept by the `enabled` whitelist of the bare variant */
const BARE_ENABLED = ["smile", "rocket"];

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-emoji/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-emoji",
  reference: "markdown-it-emoji",
  notes: [
    {
      en: 'The `bare` preset ships no built-in data, so both sides receive the same custom definitions (the reference option is `defs`, the current one `definitions`), shortcuts and `enabled` whitelist (`enabled: ["smile", "rocket"]`).',
      zh: '`bare` 预设不内置任何数据，因此两侧接收相同的自定义定义数据（参考包的选项名为 `defs`，当前包为 `definitions`）、快捷键和 `enabled` 白名单（`enabled: ["smile", "rocket"]`）。',
    },
    {
      en: "`light` data (150 names) and the shortcut table (25 names) are identical on both sides, so every `light` case matches.",
      zh: "两侧的 `light` 数据（150 个名称）和快捷键表（25 个名称）完全一致，因此所有 `light` 用例的输出都相同。",
    },
    {
      en: "`full` data differs: the current package ships 1957 names, markdown-it-emoji 3.1.0 ships 1903. 55 newer names (Unicode 15.1/16.0 additions such as `head_shaking_horizontally`, `phoenix` or `leafless_tree`) exist only in the current data, and the reference-only generated name `u6e80` (🈵, exposed as `no_vacancy` in the current data) is missing from the current data. The two `full` cases covering these names are reported as documented diffs; the `light` and `bare` variants render them as literal text on both sides.",
      zh: "`full` 数据存在差异：当前包包含 1957 个名称，markdown-it-emoji 3.1.0 包含 1903 个。55 个较新的名称（Unicode 15.1/16.0 新增，例如 `head_shaking_horizontally`、`phoenix` 或 `leafless_tree`）只存在于当前数据中，而仅由参考包生成的名称 `u6e80`（🈵，在当前数据中名为 `no_vacancy`）在当前数据中缺失。覆盖这些名称的两个 `full` 用例被记录为已记录差异；`light` 和 `bare` 变体在两侧都将它们渲染为字面文本。",
    },
    {
      en: "The current package ignores empty or whitespace-only shortcut aliases, while the reference compiles a zero-length alternative that duplicates emojis next to whitespace or punctuation (e.g. `a :smile: b` with an empty `smile` alias becomes `a 😄😄 b`). This is documented behavior of the current package and is not covered by a case, because such an alias changes every shortcut-bearing text token.",
      zh: "当前包会忽略空或仅含空白的快捷键别名，而参考包会编译一个零长度分支，在空白或标点旁重复输出表情（例如 `smile` 别名为空时，`a :smile: b` 会变成 `a 😄😄 b`）。这是当前包的已记录行为，且没有对应用例，因为这种别名会改变每一个包含快捷键的文本 token。",
    },
    {
      en: "Scaling: `dense-emoji-text` and `unmatched-colon-words` are linear baselines. `inline-token-replacements` exposes the replacement loop from markdown-it-emoji#22: the reference rewrites every matching text token with `arrayReplaceAt`, which copies the whole inline children array, so an inline token with m matching children costs O(m²); the current package rebuilds the children list in one pass and stays linear.",
      zh: "扩展性：`dense-emoji-text` 和 `unmatched-colon-words` 是线性基线。`inline-token-replacements` 暴露 markdown-it-emoji#22 中的替换循环：参考包用 `arrayReplaceAt` 重写每个匹配的文本 token，该函数会复制整个 inline children 数组，因此包含 m 个匹配子节点的 inline token 开销为 O(m²)；当前包一次性重建子节点列表，保持线性。",
    },
    {
      en: "Benchmarks render fixed corpora (`normal` = sparse emoji, `heavy` = dense emoji) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.",
      zh: "基准测试渲染固定语料（`normal` = 稀疏表情，`heavy` = 密集表情），并以交错方式对比两侧；结果文件中的比值和拟合指数来自受控的顺序对比运行，而非临时运行。",
    },
  ],
  variants: [
    {
      id: "bare",
      ourExport: "bareEmoji",
      referenceExport: "bare",
      ourOptions: {
        definitions: BARE_DEFINITIONS,
        shortcuts: BARE_SHORTCUTS,
        enabled: BARE_ENABLED,
      },
      referenceOptions: {
        defs: BARE_DEFINITIONS,
        shortcuts: BARE_SHORTCUTS,
        enabled: BARE_ENABLED,
      },
    },
    {
      id: "light",
      ourExport: "lightEmoji",
      referenceExport: "light",
      ourOptions: {},
      referenceOptions: {},
    },
    {
      id: "full",
      ourExport: "fullEmoji",
      referenceExport: "full",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  correctness: [
    {
      name: "no-syntax",
      markdown: "A plain paragraph without any emoji syntax.\n\n- a list item\n- another item",
    },
    { name: "single-emoji", markdown: "Hello world :smile:" },
    { name: "consecutive-emojis", markdown: ":smile::heart::rocket:" },
    {
      name: "emoji-in-sentence",
      markdown: "The :rocket: launch was a :tada: success and the team :heart:s it.",
    },
    { name: "shortcut-smileys", markdown: "Classic :) and :-) and :D and ;)" },
    {
      name: "shortcut-boundaries",
      markdown: "Time 12:30:45, path https://example.com and x:)y stay untouched.",
    },
    { name: "emoji-adjacent-to-text", markdown: "before:smile:after and a:smile:b" },
    { name: "partial-delimiters", markdown: "::smile:: and :smile:: and ::smile:" },
    { name: "unknown-emoji", markdown: "An unknown :not_an_emoji_name: stays literal." },
    {
      name: "multi-line",
      markdown: "line one :smile:\nline two :heart:\nline three :rocket:",
    },
    { name: "heading", markdown: "## Release :rocket: notes" },
    { name: "blockquote", markdown: "> :smile: quoted text" },
    { name: "list", markdown: "- :smile: first\n- :heart: second\n- :rocket: third" },
    {
      name: "table",
      markdown: "| Emoji | Name |\n|---|---|\n| :smile: | smile |\n| :heart: | heart |",
    },
    { name: "code-span", markdown: "Inline code `:smile: :)` must not be replaced." },
    { name: "fenced-code", markdown: "```\n:smile: :)\n```" },
    { name: "indented-code", markdown: "    :smile: :)" },
    { name: "autolink", markdown: "<https://example.com/:smile:>" },
    { name: "link-text", markdown: "[link :smile:](https://example.com)" },
    { name: "link-href", markdown: "[link](https://example.com/:smile:)" },
    { name: "image-alt", markdown: "![alt :smile:](image.png)" },
    { name: "emphasis", markdown: "**:smile:** _:heart:_" },
    { name: "escaped-colon", markdown: String.raw`escaped \:smile: and unescaped :heart:` },
    {
      name: "full-new-emoji-name",
      markdown: ":head_shaking_horizontally:",
      note: {
        en: "This Unicode 15.1 name exists only in the current `full` data; the reference renders it as literal text. `light` and `bare` render it literally on both sides.",
        zh: "这个 Unicode 15.1 名称只存在于当前包的 `full` 数据中；参考包将其渲染为字面文本。`light` 和 `bare` 在两侧都将其渲染为字面文本。",
      },
    },
    {
      name: "full-reference-only-name",
      markdown: ":u6e80:",
      note: {
        en: "`u6e80` (🈵) only exists in the reference data; the current `full` data names the same character `no_vacancy` and renders `:u6e80:` as literal text. `light` and `bare` render it literally on both sides.",
        zh: "`u6e80`（🈵）只存在于参考包数据中；当前包的 `full` 数据将同一字符命名为 `no_vacancy`，并把 `:u6e80:` 渲染为字面文本。`light` 和 `bare` 在两侧都将其渲染为字面文本。",
      },
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "dense-emoji-text",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `${":smile: :heart: :rocket: ".repeat(size)}\n`,
    },
    {
      name: "inline-token-replacements",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `${"*x* :smile: ".repeat(size)}\n`,
    },
    {
      name: "unmatched-colon-words",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `${":word ".repeat(size)}\n`,
    },
  ],
});

export default spec;
