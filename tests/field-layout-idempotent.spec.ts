import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../packages/plugin-field/src/index.js";
import { layout } from "../packages/plugin-layout/src/index.js";

// `@mdit/plugin-field` names its parser rules after its `name` option, so a `name` that collides
// with another plugin's rule name used to break the other plugin depending on installation order.
// Field namespaces its rules now; both orders must keep both plugins working.

const layoutSource = `\
@flexs
@flex
Content
@end
`;

const fieldSource = (name: string): string => `\
::: ${name}
@\`prop\`
Description
:::
`;

const expectBothPluginsWork = (markdownIt: MarkdownItType, name: string): void => {
  expect(markdownIt.render(layoutSource)).toContain('<div style="display:flex">');
  expect(markdownIt.render(layoutSource)).toContain("<div>\n<p>Content</p>\n</div>");
  expect(markdownIt.render(fieldSource(name))).toContain(`field-wrapper ${name}-fields`);
  expect(markdownIt.render(fieldSource(name))).toContain('<dt class="field-name"');
  expect(markdownIt.render(fieldSource(name))).toContain('<dd class="field-content"');
};

// `layout` collided with the layout item rule, `layout_container` with its container rule.
describe("field and layout interop", () => {
  it("should keep both plugins working when field is installed first (name: layout)", () => {
    expect.hasAssertions();
    expectBothPluginsWork(new MarkdownIt().use(field, { name: "layout" }).use(layout), "layout");
  });

  it("should keep both plugins working when layout is installed first (name: layout)", () => {
    expect.hasAssertions();
    expectBothPluginsWork(new MarkdownIt().use(layout).use(field, { name: "layout" }), "layout");
  });

  it("should keep both plugins working when field is installed first (name: layout_container)", () => {
    expect.hasAssertions();
    expectBothPluginsWork(
      new MarkdownIt().use(field, { name: "layout_container" }).use(layout),
      "layout_container",
    );
  });

  it("should keep both plugins working when layout is installed first (name: layout_container)", () => {
    expect.hasAssertions();
    expectBothPluginsWork(
      new MarkdownIt().use(layout).use(field, { name: "layout_container" }),
      "layout_container",
    );
  });
});
