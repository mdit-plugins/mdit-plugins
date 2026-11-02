import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-dl/${kind}-${size}.md`,
  })),
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-dl",
  reference: "markdown-it-deflist",
  notes: [
    {
      en: "Neither package takes options; both are installed with their defaults.",
      zh: "两个包都不接受选项，均以默认配置安装。",
    },
    {
      en: "Token streams are compared in addition to the rendered HTML. The reference emits empty `dt` maps (`[0, 0]`) and lets `dd_open` begin at the term line, while the current package maps both to the real source lines, so most cases are documented differences at token level even though the rendered HTML is identical.",
      zh: "除渲染后的 HTML 外还会比较 token 流。参考实现为 `dt` 输出空映射（`[0, 0]`），并让 `dd_open` 从术语行开始，而当前包将其映射到真实的源码行；因此尽管渲染后的 HTML 一致，多数用例在 token 层被记为已记录差异。",
    },
    {
      en: "Historical context: the reference implementation had a hang (infinite loop) on definition lines starting with `: >` or `~ >` (markdown-it-deflist#5), fixed in 2.0.3. The installed 4.0.0 and this fork are both linear on that pattern and on all other probed patterns.",
      zh: "历史背景：参考实现曾在以 `: >` 或 `~ >` 开头的定义行上卡死（无限循环，markdown-it-deflist#5），该问题在 2.0.3 中修复。当前安装的 4.0.0 与此分支在该模式及所有其他探测过的模式上均为线性。",
    },
    {
      en: "`nested-definitions` grows its indentation by four spaces per level, so the generated input itself is quadratic in the series size; the fitted exponent is a lower bound for the parser's work per input byte, not a quadratic parser.",
      zh: "`nested-definitions` 每层增加四个空格的缩进，因此生成的输入本身相对序列规模呈二次增长；拟合指数是解析器每输入字节工作量的下界，而不是说解析器是二次的。",
    },
  ],
  variants: [
    {
      id: "default",
      ourExport: "dl",
      referenceExport: "default",
      ourOptions: {},
      referenceOptions: {},
    },
  ],
  testSuiteSkips: [
    {
      file: "install-idempotent.spec.ts",
      name: "",
      why: {
        en: "Asserts the internal `dl` block-rule count and that a second installation is a no-op; the reference registers its rule without a guard and has no idempotent-install contract.",
        zh: "该测试断言内部 `dl` 块级规则的数量，以及第二次安装为空操作；参考包注册规则时没有守卫，也没有幂等安装的约定。",
      },
    },
  ],
  correctness: [
    {
      name: "basic",
      markdown:
        "Apple\n: Pomaceous fruit of plants of the genus Malus.\n\nOrange\n: The fruit of an evergreen tree of the genus Citrus.\n",
    },
    {
      name: "blank-line-after-term",
      markdown: "Term 1\n\n: Definition 1\n\nTerm 2\n: Definition 2\n",
    },
    { name: "multiple-definitions", markdown: "Term 1\n: Definition 1\n: Definition 2\n" },
    { name: "tilde-marker", markdown: "Term 1\n~ Tilde definition\n" },
    {
      name: "lazy-continuation",
      markdown: "Term 1\n: Definition\nwith lazy continuation.\n",
    },
    {
      name: "multi-paragraph-definition",
      markdown: "Term\n: Def with paragraph\n\n    Second paragraph.\n",
    },
    {
      name: "code-block-in-definition",
      markdown: "Term\n: Def\n\n      six spaces\n",
    },
    {
      name: "list-in-definition",
      markdown: "Term\n: Def\n  - nested list\n",
    },
    { name: "heading-in-definition", markdown: "Term\n: Def\n\n    # heading\n" },
    {
      name: "blockquote-in-definition",
      markdown: "Term\n: Def\n\n    > quote in dd\n",
    },
    {
      name: "inline-markup-term",
      markdown: "Term with *emphasis*\n: Def with `code`\n",
    },
    {
      name: "nested-deflist",
      markdown: "Term\n: Definition\n\n    Term 2\n    : Nested definition\n",
    },
    { name: "empty-definition", markdown: "Term\n:\n: empty definition\n" },
    { name: "empty-definition-next-line", markdown: "Term\n\n:\n" },
    { name: "no-space-after-marker", markdown: "Term\n:no space\n" },
    { name: "double-marker", markdown: "Term\n:: double marker\n" },
    {
      name: "definition-after-paragraph",
      markdown: "A paragraph\n\nTerm\n: Definition\n",
    },
    { name: "deflist-in-list", markdown: "- item\n\n  Term\n  : Def\n" },
    { name: "deflist-in-blockquote", markdown: "> Term\n> : Def\n" },
    {
      name: "term-followed-by-unindented-line",
      markdown: "Term\n: Def\nnot a marker\n",
    },
    {
      name: "consecutive-deflists",
      markdown: "A\n: 1\n\nB\n: 2\n\nC\n: 3\n",
    },
    {
      name: "no-deflist-syntax",
      markdown: "# Plain heading\n\nA plain paragraph.\n\n- a\n- b\n\n```js\nconst a = 1;\n```\n",
    },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-terms",
      sizes: [128, 256, 512, 1024],
      build: (size) =>
        Array.from({ length: size }, (_, index) => `Term ${index}\n: Definition ${index}\n`).join(
          "\n",
        ),
    },
    {
      name: "many-definitions-per-term",
      sizes: [128, 256, 512, 1024],
      build: (size) => `Term\n${": definition\n".repeat(size)}`,
    },
    {
      name: "nested-definitions",
      sizes: [128, 256, 512, 1024],
      build: (size) => {
        let markdown = "Term\n: Definition\n";

        for (let level = 0; level < size; level++)
          markdown += `\n${"    ".repeat(level + 1)}Term ${level}\n${"    ".repeat(level + 1)}: Nested ${level}\n`;

        return markdown;
      },
    },
  ],
});

export default spec;
