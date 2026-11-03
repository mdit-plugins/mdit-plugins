import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance, RendererRule } from "markdown-it";

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

/** Options object this package accepts, mirroring the package's public options */
interface ContainerTestOptions {
  /** Container name */
  name: string;
  /** Container marker */
  marker?: string;
  /** Validator of the content after the marker */
  validate?: (params: string, markup: string) => boolean;
  /** Opening tag renderer */
  openRenderer?: RendererRule;
  /** Closing tag renderer */
  closeRenderer?: RendererRule;
}

/** Reference plugin signature: the container name is positional and `render` handles both tags */
type ReferenceContainerPlugin = (
  md: MarkdownItInstance,
  name: string,
  options: {
    marker?: string;
    validate?: ContainerTestOptions["validate"];
    render?: RendererRule;
  },
) => void;

/**
 * Adapt the reference plugin to this package's options object API
 *
 * The reference takes the container name as a positional argument and one `render` callback for
 * both tags, while this package takes a `{ name }` options object and separate `openRenderer` /
 * `closeRenderer` callbacks.
 *
 * @param reference - Module namespace of the reference package
 * @returns A module namespace that exposes this package's `container` export
 */
const createTestSuiteAdapter = (reference: PluginModule): PluginModule => {
  const referenceContainer = reference.default as ReferenceContainerPlugin;

  return {
    container: (md: MarkdownItInstance, options: ContainerTestOptions): void => {
      const { name, marker, validate, openRenderer, closeRenderer } = options;
      // The reference calls the same `render` for the opening and the closing token, so dispatch on
      // `nesting` to keep this package's two renderer options working.
      const render: RendererRule | undefined =
        openRenderer || closeRenderer
          ? (tokens, index, mdOptions, env, self): string => {
              const token = tokens[index];

              if (token.nesting === 1) {
                if (openRenderer) return openRenderer(tokens, index, mdOptions, env, self);

                const classes = token.attrGet("class");

                if (classes == null || !String(classes).split(" ").includes(name))
                  token.attrJoin("class", name);

                return self.renderToken(tokens, index, mdOptions);
              }

              if (closeRenderer) return closeRenderer(tokens, index, mdOptions, env, self);

              return self.renderToken(tokens, index, mdOptions);
            }
          : void 0;

      referenceContainer(md, name, {
        ...(marker == null ? {} : { marker }),
        ...(validate == null ? {} : { validate }),
        ...(render == null ? {} : { render }),
      });
    },
  };
};

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
    file: `corpora/plugin-container/${kind}.md`,
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
  issues: [
    {
      id: "closing-marker-indent",
      category: "difference",
      note: {
        en: "The reference accepts a closing marker indented less than four columns relative to the enclosing block, while this package requires the closing marker indentation to match the opening marker exactly; both are valid closing rules.",
        zh: "参考包接受相对于外层块缩进小于四列的结束标记，当前包要求结束标记与起始标记缩进完全一致；两种结束标记规则都合理。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "should not register the rule twice when installed twice",
      category: "feature-gap",
      why: {
        en: "The reference does not guard repeated installation and registers its block rule again, but repeated installation still renders correctly; this package registers the rule once.",
        zh: "参考包未防范多次安装，会重复注册块级规则，但重复安装后渲染结果仍正确；本包只注册一次。",
      },
    },
    {
      file: "install-idempotent.spec.ts",
      name: "should keep the first installation's parse options",
      category: "feature-gap",
      why: {
        en: "This package keeps the first installation's `marker` option on repeated installation; the reference applies every installation and has no first-install contract.",
        zh: "本包在重复安装时保留首次安装的 `marker` 选项，参考包会同时应用每次安装的配置，没有首次安装优先的约定。",
      },
    },
    {
      file: "container.spec.ts",
      name: 'should throw if "name" is not provided',
      category: "feature-gap",
      why: {
        en: "This package validates its required `name` option and throws a specific error; the reference takes the name as a positional argument and has no option validation.",
        zh: "本包校验必填的 `name` 选项并抛出特定错误，参考包以位置参数接收名称，没有对应的选项校验。",
      },
    },
    {
      file: "container.spec.ts",
      name: "should throw if options is null",
      category: "feature-gap",
      why: {
        en: "This package rejects a null options object with its own error message; the reference has no options object to validate.",
        zh: "本包对为 null 的选项对象抛出自己的错误信息，参考包没有可校验的选项对象。",
      },
    },
  ],
  testSuiteAdapter: createTestSuiteAdapter,
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
      issue: "closing-marker-indent",
    },
    {
      name: "indented-closing",
      markdown: "::: warning\ncontent\n  :::\n",
      issue: "closing-marker-indent",
    },
    {
      name: "indented-closing-after-blank",
      markdown: "::: warning\n\n  :::\n",
      issue: "closing-marker-indent",
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
