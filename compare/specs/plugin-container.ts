import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance } from "markdown-it";

import type { CompareRenderer, ComparisonSpec, PluginFunction, PluginModule } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Container name that uses the default `:` marker */
const WARNING_CONTAINER = "warning";

/** Container name that uses a custom `%` marker, exercising the `marker` option */
const SPOILER_CONTAINER = "spoiler";

/** Marker of the second container, passed through the `marker` option */
const SPOILER_MARKER = "%";

/**
 * Markdown-it options shared by both sides
 *
 * `maxNesting` is raised above markdown-it's default of 100 so the deeply nested scaling series can
 * measure the closing-marker scan; the benchmark corpora stay far below that depth, so throughput
 * results are unaffected.
 */
const MD_OPTIONS = { maxNesting: 10_000 };

/**
 * Install a plugin with an arbitrary number of positional arguments
 *
 * MarkdownIt's own `use` type only accepts one options argument, but the reference container plugin
 * receives the container name as a second positional argument.
 *
 * @param md - MarkdownIt instance
 * @param plugin - Plugin function
 * @param params - Positional arguments passed to the plugin
 * @returns Nothing
 */
const usePlugin = (
  md: MarkdownItInstance,
  plugin: PluginFunction,
  ...params: readonly unknown[]
): void => {
  const use = (
    md.use as unknown as (plugin: PluginFunction, ...params: readonly unknown[]) => void
  ).bind(md);

  use(plugin, ...params);
};

/**
 * Renderer of the current package: two containers with different names and markers
 *
 * @param module - Module namespace of the built package
 * @returns A renderer that turns markdown into HTML
 */
const createOurRenderer = (module: PluginModule): CompareRenderer => {
  const plugin = module.container as PluginFunction;
  const md = new MarkdownIt(MD_OPTIONS);

  md.use(plugin, { name: WARNING_CONTAINER });
  md.use(plugin, { name: SPOILER_CONTAINER, marker: SPOILER_MARKER });

  return (markdown) => md.render(markdown);
};

/**
 * Renderer of the reference package: the name is positional, the marker is an option
 *
 * @param module - Module namespace of the reference package
 * @returns A renderer that turns markdown into HTML
 */
const createReferenceRenderer = (module: PluginModule): CompareRenderer => {
  const plugin = module.default as PluginFunction;
  const md = new MarkdownIt(MD_OPTIONS);

  usePlugin(md, plugin, WARNING_CONTAINER);
  usePlugin(md, plugin, SPOILER_CONTAINER, { marker: SPOILER_MARKER });

  return (markdown) => md.render(markdown);
};

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-container/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-container",
  reference: "markdown-it-container",
  notes: [
    {
      en: "The current package takes a required `name` option object, while the reference takes the container name as a positional argument; both sides are installed through custom renderers so that two equivalent containers are registered (`warning` with the default `:` marker and `spoiler` with the `%` marker).",
      zh: "当前包接受一个必填的 `name` 选项对象，参考包则将容器名称作为位置参数；双方都通过自定义渲染器安装，从而注册两个等价的容器（使用默认 `:` 标记的 `warning` 和使用 `%` 标记的 `spoiler`）。",
    },
    {
      en: "The current package does not need `openRenderer` / `closeRenderer` to be compared: both are user render functions with no reference counterpart. The default renderer output (the container class on the opening `<div>`) is compared.",
      zh: "当前包的 `openRenderer` / `closeRenderer` 无需比较：二者都是用户渲染函数，参考包没有对应项。比较的是默认渲染器输出（起始 `<div>` 上的容器类）。",
    },
    {
      en: "`indented-opening`, `indented-closing` and `indented-closing-after-blank` are expected differences: the current package only accepts a closing marker indented exactly like the opening marker, while the reference accepts any closing marker indented less than four columns relative to the enclosing block, so the reference closes those blocks and the current package keeps the marker as content.",
      zh: "`indented-opening`、`indented-closing` 和 `indented-closing-after-blank` 是预期差异：当前包只接受与起始标记缩进完全一致的结束标记，参考包则接受相对于外层块缩进小于四列的任何结束标记，因此参考包会关闭这些块，而当前包将标记保留为内容。",
    },
    {
      en: "Both custom renderers raise markdown-it's `maxNesting` to 10,000; the default cap of 100 limits how deeply containers can nest and would hide the closing-marker scan of the `deeply-nested-containers` series. The reference rescans the remaining lines for every nesting level and grows quadratically; the current package reuses the enclosing scan and stays linear. The benchmark corpora are shallow, so throughput is unaffected.",
      zh: "两个自定义渲染器都把 markdown-it 的 `maxNesting` 提高到 10,000；默认上限 100 会限制容器嵌套深度，并掩盖 `deeply-nested-containers` 系列的结束标记扫描。参考包对每个嵌套层级重新扫描剩余行，呈二次增长；当前包复用外层扫描，保持线性。基准测试语料较浅，因此吞吐量不受影响。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "container",
      referenceExport: "default",
      createOurRenderer,
      createReferenceRenderer,
    },
  ],
  correctness: [
    { name: "basic", markdown: "::: warning\nWarning Text\n:::\n" },
    { name: "inline-markup", markdown: "::: warning\n_here be dragons_\n:::\n" },
    { name: "params-title", markdown: "::: warning Deploy\ncontent\n:::\n" },
    { name: "blank-lines", markdown: "::: warning\n\nWarning Text\n\n:::\n" },
    { name: "empty-container", markdown: "::: warning\n\n:::\n" },
    { name: "four-colons", markdown: ":::: warning\nouter\n::::\n" },
    { name: "longer-closing-marker", markdown: "::: warning\ncontent\n:::::\n" },
    { name: "unclosed-container", markdown: "::: warning\nunclosed\n" },
    { name: "escaped-marker", markdown: "\\::: warning\n\n:::\n" },
    { name: "non-matching-name", markdown: "::: note\nnot this container\n:::\n" },
    { name: "custom-marker", markdown: "%%% spoiler\nspoiler content\n%%%\n" },
    {
      name: "nested-different-markers",
      markdown: ":::: warning\nouter\n\n%%% spoiler\ninner\n%%%\n::::\n",
    },
    {
      name: "nested-same-name",
      markdown: ":::: warning\nouter\n\n::: warning\ninner\n:::\n::::\n",
    },
    { name: "inside-blockquote", markdown: "> ::: warning\n> quoted\n> :::\n" },
    { name: "inside-list", markdown: "- ::: warning\n  in list\n  :::\n" },
    { name: "with-code-fence", markdown: "::: warning\n```js\ncode\n```\n:::\n" },
    {
      name: "with-heading-and-paragraph",
      markdown: "::: warning\n\n# heading\n\nparagraph\n\n:::\n",
    },
    {
      name: "with-table",
      markdown: "::: warning\n| a | b |\n|---|---|\n| 1 | 2 |\n:::\n",
    },
    { name: "marker-only", markdown: ":::\n" },
    {
      name: "no-container-syntax",
      markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b\n\n```js\nconst a = 1;\n```\n",
    },
    {
      name: "indented-opening",
      markdown: "  ::: warning\n  content\n:::\n",
      note: {
        en: "The current package requires the closing marker to be indented exactly like the opening marker (both are 2 columns here, then 0), so the container stays unclosed; the reference accepts the unindented closing marker and closes it.",
        zh: "当前包要求结束标记与起始标记缩进完全一致（此处起始为 2 列、结束为 0 列），因此容器保持未闭合；参考包接受未缩进的结束标记并将其闭合。",
      },
    },
    {
      name: "indented-closing",
      markdown: "::: warning\ncontent\n  :::\n",
      note: {
        en: "The reference accepts a closing marker indented by less than four columns; the current package requires the closing marker to be indented exactly like the opening marker, so it keeps the `:::` line as container content.",
        zh: "参考包接受缩进小于四列的结束标记；当前包要求结束标记与起始标记缩进完全一致，因此将 `:::` 行保留为容器内容。",
      },
    },
    {
      name: "indented-closing-after-blank",
      markdown: "::: warning\n\n  :::\n",
      note: {
        en: "Same closing-marker rule as `indented-closing`: the reference closes the empty container, while the current package renders the indented marker as a paragraph inside it.",
        zh: "与 `indented-closing` 相同的结束标记规则：参考包闭合空容器，当前包则把缩进的标记渲染为容器内的段落。",
      },
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "sibling-containers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"::: warning\ntext\n:::\n".repeat(size)}\n`,
    },
    {
      name: "deeply-nested-containers",
      sizes: [128, 256, 512, 1024],
      build: (size) => `${"::: warning\n".repeat(size)}x\n${":::\n".repeat(size)}`,
    },
    {
      name: "non-matching-containers",
      sizes: [128, 256, 512, 1024],
      build: (size) => "::: note\ntext\n\n".repeat(size),
    },
  ],
});

export default spec;
