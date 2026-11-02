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

/** Target corpus size in bytes for each benchmark size */
const CORPUS_BYTES = { small: 2000, medium: 10000, large: 40000 } as const;

/**
 * Build a benchmark corpus from a unit of markdown
 *
 * @param unit - Markdown repeated in the corpus
 * @param size - Corpus size
 * @returns Markdown of roughly the requested size
 */
const buildCorpus = (unit: string, size: "small" | "medium" | "large"): string =>
  unit.repeat(Math.max(1, Math.round(CORPUS_BYTES[size] / unit.length)));

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

/** Markdown with a sparse amount of container syntax, close to a normal document */
const NORMAL_UNIT = `## Container demo

An introductory paragraph that is long enough to look like a real document.

::: warning
Container content with **bold** text and a [link](https://example.com).
:::

A paragraph after the container that keeps the document realistic.

- first list item
- second list item

\`\`\`js
const value = 1;
\`\`\`

`;

/** Markdown where most blocks are containers, including nested ones */
const HEAVY_UNIT = `::: warning
**Warning** content with a [link](https://example.com).
:::

:::: warning
Outer container content.

::: warning
Inner container with \`inline code\`.
:::
::::

%%% spoiler
Hidden **spoiler** content.
%%%

::: warning
| A | B |
|---|---|
| 1 | 2 |
:::

- list item
  ::: warning
  container inside a list item
  :::

> ::: warning
> container inside a quote
> :::

`;

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    markdown: buildCorpus(kind === "normal" ? NORMAL_UNIT : HEAVY_UNIT, size),
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-container",
  reference: "markdown-it-container",
  notes: [
    "The current package takes a required `name` option object, while the reference takes the container name as a positional argument; both sides are installed through custom renderers so that two equivalent containers are registered (`warning` with the default `:` marker and `spoiler` with the `%` marker).",
    "The current package does not need `openRenderer` / `closeRenderer` to be compared: both are user render functions with no reference counterpart. The default renderer output (the container class on the opening `<div>`) is compared.",
    "`indented-opening`, `indented-closing` and `indented-closing-after-blank` are expected differences: the current package only accepts a closing marker indented exactly like the opening marker, while the reference accepts any closing marker indented less than four columns relative to the enclosing block, so the reference closes those blocks and the current package keeps the marker as content.",
    "Both custom renderers raise markdown-it's `maxNesting` to 10,000; the default cap of 100 limits how deeply containers can nest and would hide the closing-marker scan of the `deeply-nested-containers` series. The reference rescans the remaining lines for every nesting level and grows quadratically; the current package reuses the enclosing scan and stays linear. The benchmark corpora are shallow, so throughput is unaffected.",
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
      note: "The current package requires the closing marker to be indented exactly like the opening marker (both are 2 columns here, then 0), so the container stays unclosed; the reference accepts the unindented closing marker and closes it.",
    },
    {
      name: "indented-closing",
      markdown: "::: warning\ncontent\n  :::\n",
      note: "The reference accepts a closing marker indented by less than four columns; the current package requires the closing marker to be indented exactly like the opening marker, so it keeps the `:::` line as container content.",
    },
    {
      name: "indented-closing-after-blank",
      markdown: "::: warning\n\n  :::\n",
      note: "Same closing-marker rule as `indented-closing`: the reference closes the empty container, while the current package renders the indented marker as a paragraph inside it.",
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
