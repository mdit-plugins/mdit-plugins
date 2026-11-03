import { composeNormalizers, removeMatches, replaceMatches, sortAttributes } from "../normalize.ts";
import type { ComparisonSpec } from "../types.ts";
import { defineComparison } from "../types.ts";

/** Benchmark cases, one per committed corpus file */
const BENCH_CASES = (["normal", "heavy"] as const).flatMap((kind) =>
  (["small", "medium", "large"] as const).map((size) => ({
    name: `${kind}/${size}`,
    kind,
    size,
    file: `corpora/plugin-tasklist/${kind}.md`,
  })),
);

/**
 * Normalize the task list markup so that the remaining comparison covers behavior
 *
 * Both packages label the item text: the current package nests the checkbox inside `<label
 * class="task-list-item-label">` (no document-scoped id), while the reference places the `<input>`
 * before `<label for="cbx_N">`. Label tags and the generated `cbx_*` ids are therefore removed on
 * both sides, and the empty checkbox class plus the boolean attribute spelling (`checked="checked"`
 * vs `checked="true"`) are canonicalized.
 *
 * @param html - Rendered HTML
 * @returns Normalized HTML
 */
const normalizeTaskListHtml = composeNormalizers(
  (html) => removeMatches(html, /<label[^>]*>|<\/label>/gu),
  (html) => removeMatches(html, / (?:id|for)="cbx_[^"]*"/gu),
  (html) => removeMatches(html, / class=""/gu),
  (html) =>
    replaceMatches(
      html,
      / (?<attribute>checked|disabled)="(?:checked|disabled|true)"/gu,
      " $<attribute>",
    ),
  sortAttributes,
);

const spec: ComparisonSpec = defineComparison({
  plugin: "plugin-tasklist",
  reference: "markdown-it-task-checkbox",
  notes: [
    {
      en: "`ulClass` / `liClass` are mapped to `containerClass` / `itemClass` with the reference defaults (`task-list` / `task-list-item`); `divWrap` stays `false` and `disabled` stays `true` on the reference side.",
      zh: "`ulClass` / `liClass` 映射为 `containerClass` / `itemClass`，取参考包默认值（`task-list` / `task-list-item`）；参考包侧的 `divWrap` 保持 `false`，`disabled` 保持 `true`。",
    },
    {
      en: 'Both packages label the item text, but the structure differs by design: the current package nests the checkbox inside `<label class="task-list-item-label">` and emits no ids, while the reference emits `<input id="cbx_N"><label for="cbx_N">`. Normalization unwraps the label tags and removes the generated `cbx_*` ids, so the compared part is the list structure, container/item classes, checkbox state and item text.',
      zh: '两个包都会为条目文本加标签，但结构在设计上不同：当前包把复选框嵌套在 `<label class="task-list-item-label">` 内且不生成 id，参考包则输出 `<input id="cbx_N"><label for="cbx_N">`。归一化会去掉 `label` 标签并移除生成的 `cbx_*` id，因此参与比较的部分是列表结构、容器/条目 class、复选框状态和条目文本。',
    },
    {
      en: "`checkboxClass` is set to an empty string because the reference emits no class on the checkbox; the resulting empty `class` attribute is normalized away. The current package's extra `labelClass` is not observable after the label tags are normalized.",
      zh: "`checkboxClass` 设为空字符串，因为参考包不会在复选框上输出 class；由此产生的空 `class` 属性会被归一化去掉。`label` 标签归一化后，当前包额外的 `labelClass` 已不可观测。",
    },
    {
      en: '`checked="checked"` / `disabled="disabled"` and the reference `checked="true"` / `disabled="true"` are equivalent boolean attributes; the normalizer canonicalizes them to the bare attribute.',
      zh: '`checked="checked"` / `disabled="disabled"` 与参考包的 `checked="true"` / `disabled="true"` 是等价的布尔属性；归一化器会将它们统一为不带值的属性。',
    },
    {
      en: "Scaling: the reference locates the parent list token with a backward scan through the token stream for every task item, which is quadratic in the number of items in one list; the current package records the last token index per nesting level in one forward pass and stays linear. `many-task-items` exposes the difference.",
      zh: "扩展性：参考包为每个任务条目回溯扫描 token 流以定位父列表 token，在单个列表的条目数上呈二次增长；当前包在一次前向遍历中记录每个嵌套层级的最后一个 token 下标，保持线性。`many-task-items` 体现了这一差异。",
    },
    { en: "Attribute order is normalized.", zh: "归一化了属性顺序。" },
  ],
  variants: [
    {
      id: "default",
      ourExport: "tasklist",
      referenceExport: "default",
      ourOptions: {
        containerClass: "task-list",
        itemClass: "task-list-item",
        checkboxClass: "",
      },
      referenceOptions: {
        ulClass: "task-list",
        liClass: "task-list-item",
      },
    },
  ],
  issues: [
    {
      id: "marker-as-link",
      category: "reference-error",
      note: {
        en: "When the task marker also resolves as a link reference (`[x]`), the reference strips only the first text token, so the marker link stays in the item and its text is duplicated; our package removes all parsed marker tokens.",
        zh: "当任务标记同时解析为链接引用（`[x]`）时，参考包只剥离第一个文本 token，标记链接会留在条目中且其文本重复出现；本包会移除解析出的全部标记 token。",
      },
    },
    {
      id: "label-structure",
      category: "difference",
      note: {
        en: "The checkbox token structure differs by design: our package emits `label_open` before the checkbox and has no document ids, while the reference emits `checkbox_input` first and associates the label through `for`/`id`. The HTML is normalized to compare behavior, but the token streams keep this difference.",
        zh: "复选框 token 结构在设计上不同：本包先输出 `label_open` 再输出复选框且不生成文档级 id，参考包则先输出 `checkbox_input` 并通过 `for`/`id` 关联 label。HTML 会归一化后比较行为，但 token 流仍保留该差异。",
      },
    },
  ],
  testSuiteSkips: [
    {
      file: "tasklist.spec.ts",
      name: "should not render label",
      category: "feature-gap",
      why: {
        en: "Uses our `label: false` option; the reference has no label toggle and always wraps the item text in a `<label>`.",
        zh: "使用本包的 `label: false` 选项；参考包没有 label 开关，始终用 `<label>` 包裹条目文本。",
      },
    },
    {
      file: "tasklist.spec.ts",
      name: "should support custom class names",
      category: "feature-gap",
      why: {
        en: "Uses our `containerClass`/`itemClass`/`checkboxClass`/`labelClass` options; the reference only accepts `ulClass`/`liClass`.",
        zh: "使用本包的 `containerClass`/`itemClass`/`checkboxClass`/`labelClass` 选项；参考包只接受 `ulClass`/`liClass`。",
      },
    },
  ],
  correctness: [
    { name: "unchecked-item", markdown: "- [ ] task 1", issue: "label-structure" },
    { name: "checked-item-lowercase", markdown: "- [x] task 1", issue: "label-structure" },
    { name: "checked-item-uppercase", markdown: "- [X] task 1", issue: "label-structure" },
    {
      name: "mixed-items",
      markdown: "- [ ] one\n- [x] two\n- [X] three",
      issue: "label-structure",
    },
    { name: "ordered-list", markdown: "1. [ ] one\n2. [x] two", issue: "label-structure" },
    {
      name: "nested-list",
      markdown: "- [ ] one\n  - [x] two\n- [x] three",
      issue: "label-structure",
    },
    { name: "non-task-list", markdown: "- one\n- two" },
    { name: "marker-in-paragraph", markdown: "[ ] not a task" },
    { name: "missing-space-after-marker", markdown: "- [x]no space" },
    { name: "empty-item", markdown: "- [ ]" },
    { name: "non-breaking-space", markdown: "- [x]\u00A0text", issue: "label-structure" },
    { name: "code-fence", markdown: "```\n- [ ] code\n```" },
    { name: "blockquote-list", markdown: "> - [ ] quoted", issue: "label-structure" },
    {
      name: "inline-markup",
      markdown: "- [x] **bold** and `code`",
      issue: "label-structure",
    },
    { name: "plus-bullet", markdown: "+ [ ] plus\n+ [x] plus 2", issue: "label-structure" },
    {
      name: "multiple-lists",
      markdown: "- [ ] a\n- [x] b\n\n- [ ] c\n\n- [x] d",
      issue: "label-structure",
    },
    {
      name: "link-inside-item",
      markdown: "- [x] [link](https://example.com)",
      issue: "label-structure",
    },
    {
      name: "loose-item",
      markdown: "- [x] first\n\n  second paragraph",
      issue: "label-structure",
    },
    {
      name: "marker-as-link-reference",
      markdown: "- [x] [x]\n\n[x]: https://example.com",
      issue: "marker-as-link",
    },
    { name: "empty-input", markdown: "\n" },
    { name: "no-list-syntax", markdown: "# Title\n\nParagraph.\n\n> quote" },
  ],
  bench: BENCH_CASES,
  scaling: [
    {
      name: "many-task-items",
      sizes: [512, 1024, 2048, 4096],
      targetMs: 40,
      build: (size) => "- [x] item\n".repeat(size),
    },
    {
      name: "long-task-items",
      sizes: [64, 128, 256, 512],
      build: (size) => `- [x] ${"word ".repeat(60)}\n`.repeat(size),
    },
    {
      name: "many-lists",
      sizes: [64, 128, 256, 512],
      build: (size) => "- [x] item\n\n".repeat(size),
    },
  ],
  normalize: normalizeTaskListHtml,
});

export default spec;
