import { tasklist } from "@mdit/plugin-tasklist";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../../src/index.js";

describe("tasklist rule", () => {
  const markdownIt = new MarkdownIt().use(attrs, { rule: ["list", "tasklist"] }).use(tasklist);

  it("should stay disabled by default", () => {
    const markdownItDefault = new MarkdownIt().use(attrs).use(tasklist);
    const expected = `\
<ul class="task-list-container">
<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> foo {.red}</label></li>
</ul>
`;

    expect(markdownItDefault.render("- [ ] foo {.red}")).toBe(expected);
  });

  it("should apply attributes to task list items wrapped in labels", () => {
    const src = "- [ ] foo {.red}\n- [x] done {#did}";
    const expected = `\
<ul class="task-list-container">
<li class="task-list-item red"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> foo</label></li>
<li class="task-list-item" id="did"><input type="checkbox" class="task-list-item-checkbox" id="task-item-1" checked="checked" disabled="disabled"><label class="task-list-item-label" for="task-item-1"> done</label></li>
</ul>
`;

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should support attributes without a leading space", () => {
    const src = "- [ ] foo{.red}";
    const expected = `\
<ul class="task-list-container">
<li class="task-list-item red"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> foo</label></li>
</ul>
`;

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should apply attributes after a softbreak to the task list", () => {
    const src = "- [ ] foo\n- [ ] bar\n{.fancy}";
    const expected = `\
<ul class="task-list-container fancy">
<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> foo</label></li>
<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" id="task-item-1" disabled="disabled"><label class="task-list-item-label" for="task-item-1"> bar</label></li>
</ul>
`;

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should support ordered task lists", () => {
    const src = "1. [x] foo {.red}";
    const expected = `\
<ol class="task-list-container">
<li class="task-list-item red"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" checked="checked" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> foo</label></li>
</ol>
`;

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should leave attributes inside nested inline tokens untouched", () => {
    const src = "- [ ] *foo {.red}*";
    const expected = `\
<ul class="task-list-container">
<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> <em>foo {.red}</em></label></li>
</ul>
`;

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should apply attributes to task list items without labels", () => {
    const markdownItNoLabel = new MarkdownIt()
      .use(attrs, { rule: ["list", "tasklist"] })
      .use(tasklist, { label: false });
    const src = "- [ ] foo {.red}";
    const expected = `\
<ul class="task-list-container">
<li class="task-list-item red"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"> foo</li>
</ul>
`;

    expect(markdownItNoLabel.render(src)).toBe(expected);
  });
});
