import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-abbr/${kind}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-abbr",
  reference: "markdown-it-abbr",
  notes: [
    {
      en: "Neither package takes options; both are installed with their defaults.",
      zh: "两个包都不接受选项，均以默认配置安装。",
    },
    {
      en: "The reference rewrites the inline token list with `md.utils.arrayReplaceAt` for every text token that contains an abbreviation, copying the whole token array each time, so a paragraph with inline markup between abbreviations grows quadratically on the reference side. The current package rebuilds the children list in a single pass and stays linear; `interleaved-abbreviations` exposes the difference.",
      zh: "参考包对每个包含缩写的文本 token 调用 `md.utils.arrayReplaceAt` 重写内联 token 列表，每次都会复制整个 token 数组，因此当缩写之间夹有内联标记时，该段落会在参考包一侧呈二次增长。当前包单次遍历重建子节点列表，保持线性；`interleaved-abbreviations` 展示了这一差异。",
    },
    {
      en: "Abbreviations are matched case-sensitively and only at word boundaries, so `HTML` is not replaced inside `HTML5` or `html`.",
      zh: "缩写按大小写敏感匹配，并且只在词边界处匹配，因此 `HTML` 不会在 `HTML5` 或 `html` 中被替换。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "abbr",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  testSuiteSkips: [
    {
      file: "idempotent.spec.ts",
      name: "",
      why: {
        en: "Installs the plugin twice and asserts an abbreviation is not wrapped twice; the reference has no idempotent-install contract and re-registers its inline rule, so the test only covers this package's installation internals.",
        zh: "该测试重复安装插件并断言缩写不会被二次包裹；参考包没有幂等安装的约定，会重复注册行内规则，因此只覆盖本包的安装内部细节。",
      },
    },
  ],
  correctness: [
    {
      name: "definition-and-usage",
      markdown:
        "*[HTML]: Hyper Text Markup Language\n*[W3C]: World Wide Web Consortium\n\nThe HTML specification is maintained by the W3C.\n",
    },
    {
      name: "multiple-definitions",
      markdown:
        "*[HTML]: Hyper Text Markup Language\n*[CSS]: Cascading Style Sheets\n*[JS]: JavaScript\n\nHTML, CSS and JS.\n",
    },
    {
      name: "abbreviation-at-start",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nHTML is a markup language.\n",
    },
    {
      name: "abbreviation-at-end",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nWe write HTML\n",
    },
    {
      name: "boundary-punctuation",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nHTML, HTML. (HTML) HTML! HTML?\n",
    },
    {
      name: "multi-word-abbreviation",
      markdown: "*[multi word]: description\n\nmulti word and multiword\n",
    },
    {
      name: "overlapping-labels",
      markdown: "*[ab]: short\n*[abc]: long\n\nabc ab\n",
    },
    {
      name: "duplicate-definition",
      markdown: "*[ab]: first\n*[ab]: second\n\nab\n",
    },
    {
      name: "case-sensitivity",
      markdown: "*[HTML]: Hyper Text Markup Language\n\nHTML html Html\n",
    },
    {
      name: "inside-emphasis",
      markdown: "*[HTML]: Hyper Text Markup Language\n\n**HTML** and *HTML*\n",
    },
    {
      name: "inside-link",
      markdown: "*[HTML]: Hyper Text Markup Language\n\n[HTML](https://example.com)\n",
    },
    {
      name: "inside-code-ignored",
      markdown: "*[tag]: description\n\n`tag` and **tag**\n",
    },
    {
      name: "definition-in-text-block",
      markdown: "Some text.\n*[x]: definition\nmore x\n",
    },
    {
      name: "definition-after-paragraph",
      markdown: "The HTML spec.\n*[HTML]: Hyper Text Markup Language\n\nThe HTML spec.\n",
    },
    {
      name: "escaped-definition",
      markdown: "\\*[HTML]: Hyper Text Markup Language\n\nHTML\n",
    },
    {
      name: "empty-label",
      markdown: "*[]: empty label\n\nfoo\n",
    },
    {
      name: "empty-title",
      markdown: "*[tag]:\n\nfoo\n",
    },
    {
      name: "escaped-label-brackets",
      markdown: "*[tag\\[x\\]]: escaped bracket\n\n tag[x] \n",
    },
    {
      name: "unicode-label",
      markdown: "*[日本]: Japan\n\n日本\n",
    },
    {
      name: "title-html-escaping",
      markdown: '*[tag]: <b>bold</b> "quoted"\n\ntag\n',
    },
    {
      name: "headings-lists-blockquotes",
      markdown: "*[x]: definition\n\n# Heading x\n\n> quoted x\n\n- list x\n",
    },
    {
      name: "no-abbreviations",
      markdown: "# Plain heading\n\nA plain paragraph with no definitions at all.\n\n- a\n- b\n",
    },
    {
      name: "unclosed-bracket",
      markdown: "*[tag: no closing bracket\n\ntag\n",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "interleaved-abbreviations",
      sizes: [512, 1024, 2048, 4096],
      build: (size) => `*[ab]: title\n\n${"ab *x* ".repeat(size)}\n`,
    },
    {
      name: "many-definitions",
      sizes: [128, 256, 512, 1024],
      build: (size) =>
        `${Array.from({ length: size }, (_, index) => `*[T${index}]: title ${index}`).join("\n")}\n\n${"word ".repeat(size)}\n`,
    },
    {
      name: "dense-occurrences",
      sizes: [128, 256, 512, 1024],
      build: (size) => `*[tag]: title\n\n${"tag ".repeat(size)}\n`,
    },
  ],
});

export default spec;
