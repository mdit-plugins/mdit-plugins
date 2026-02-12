import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = MarkdownIt({ html: true }).use(field);

describe("prefix-mode nesting", () => {
  it("should handle prefix-mode nesting with content", () => {
    const result = md.render(`
::: fields
@parent@
Description parent.

@@child@
Description child.
:::
`);

    expect(result).toMatchSnapshot();

    // Parent level 1
    expect(result).toContain('<div class="field-item" data-level="1">');
    expect(result).toContain('<span class="field-name">parent</span>');

    // Child level 2 inside parent
    expect(result).toContain('<div class="field-item" data-level="2">');
    expect(result).toContain('<span class="field-name">child</span>');
  });

  it("should handle deep nesting", () => {
    const result = md.render(`
::: fields
@level1@
@@level2@
@@@level3@
@@@@level4@
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('data-level="1"');
    expect(result).toContain('data-level="2"');
    expect(result).toContain('data-level="3"');
    expect(result).toContain('data-level="4"');
  });

  it("should handle siblings at nested levels", () => {
    const result = md.render(`
::: fields
@root@
@@child1@

@@child2@
@@@grandchild@
@@child3@
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("child1");
    expect(result).toContain("child2");
    expect(result).toContain("grandchild");
    expect(result).toContain("child3");
  });

  it("should ignore visual indentation and trust only @ count", () => {
    const result = md.render(`
::: fields
@parent@
  @@child-1@
@@child-2@
 @@@grandchild@
@parent-2@
:::
`);

    expect(result).toContain('<span class="field-name">parent</span>');
    expect(result).toContain('<span class="field-name">child-1</span>');
    expect(result).toContain('<span class="field-name">child-2</span>');
    expect(result).toContain('<span class="field-name">grandchild</span>');
    expect(result).toContain('<span class="field-name">parent-2</span>');

    // Check correct nesting levels
    const parentMatch = result.indexOf('data-level="1"');
    const child1Match = result.indexOf('data-level="2"');
    const child2Match = result.indexOf('data-level="2"', child1Match + 1);
    const grandchildMatch = result.indexOf('data-level="3"');

    expect(parentMatch).toBeGreaterThan(-1);
    expect(child1Match).toBeGreaterThan(-1);
    expect(child2Match).toBeGreaterThan(-1);
    expect(grandchildMatch).toBeGreaterThan(-1);
  });

  it("should reject field markers at 4+ spaces indent (code block)", () => {
    const result = md.render(`
::: fields
@prop@
    @too-deep@
:::
`);

    expect(result).toContain('<span class="field-name">prop</span>');
    expect(result).not.toContain('<span class="field-name">too-deep</span>');
  });

  it("should allow 0-3 spaces indent as cosmetic", () => {
    const result = md.render(`
::: fields
@zero@
 @one@
  @two@
   @three@
:::
`);

    expect(result).toContain('<span class="field-name">zero</span>');
    expect(result).toContain('<span class="field-name">one</span>');
    expect(result).toContain('<span class="field-name">two</span>');
    expect(result).toContain('<span class="field-name">three</span>');
  });

  it("should handle backtrack from deep to shallow depth", () => {
    const result = md.render(`
::: fields
@root@
@@child@
@@@grandchild@
@root2@
:::
`);

    expect(result).toContain("root");
    expect(result).toContain("child");
    expect(result).toContain("grandchild");
    expect(result).toContain("root2");

    const lastLevelOne = result.lastIndexOf('data-level="1"');

    expect(lastLevelOne).toBeGreaterThan(result.indexOf("root2") - 100);
  });

  it("should handle cosmetic indentation without affecting depth", () => {
    const result = md.render(`
::: fields
  @prop@
  Description
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('data-level="1"');
  });
});

describe("content belonging", () => {
  it("should attach content to the correct parent field", () => {
    const result = md.render(`
::: fields
@parent@
Parent content here.

@@child@
Child content here.
:::
`);

    // Parent content should be inside parent's content div
    const parentIdx = result.indexOf("parent</span>");
    const childIdx = result.indexOf("child</span>");
    const parentContentIdx = result.indexOf("Parent content here");
    const childContentIdx = result.indexOf("Child content here");

    expect(parentContentIdx).toBeGreaterThan(parentIdx);
    expect(parentContentIdx).toBeLessThan(childIdx);
    expect(childContentIdx).toBeGreaterThan(childIdx);
  });

  it("should attach markdown content to nested fields correctly", () => {
    const result = md.render(`
::: fields
@root@
Root paragraph.

@@child-a@
Child A paragraph.

@@child-b@
Child B paragraph.

@root2@
Root2 paragraph.
:::
`);

    expect(result).toContain("<p>Root paragraph.</p>");
    expect(result).toContain("<p>Child A paragraph.</p>");
    expect(result).toContain("<p>Child B paragraph.</p>");
    expect(result).toContain("<p>Root2 paragraph.</p>");

    // Verify ordering: root → child-a → child-b → root2
    const rootIdx = result.indexOf("Root paragraph");
    const childAIdx = result.indexOf("Child A paragraph");
    const childBIdx = result.indexOf("Child B paragraph");
    const root2Idx = result.indexOf("Root2 paragraph");

    expect(rootIdx).toBeLessThan(childAIdx);
    expect(childAIdx).toBeLessThan(childBIdx);
    expect(childBIdx).toBeLessThan(root2Idx);
  });

  it("should attach rich content (lists, code) to correct field", () => {
    const result = md.render(`
::: fields
@parent@
- list in parent

@@child@
\`\`\`js
code in child
\`\`\`
:::
`);

    expect(result).toContain("<li>list in parent</li>");
    expect(result).toContain("code in child");

    const listIdx = result.indexOf("list in parent");
    const codeIdx = result.indexOf("code in child");
    const childNameIdx = result.indexOf("child</span>");

    expect(listIdx).toBeLessThan(childNameIdx);
    expect(codeIdx).toBeGreaterThan(childNameIdx);
  });

  it("should close backtracked items and attach content to correct field", () => {
    const result = md.render(`
::: fields
@root@
@@child@
Child paragraph.
@@@grandchild@
Grandchild paragraph.
@root2@
Root2 paragraph.
:::
`);

    const childContentIdx = result.indexOf("Child paragraph");
    const grandchildContentIdx = result.indexOf("Grandchild paragraph");
    const root2ContentIdx = result.indexOf("Root2 paragraph");

    expect(childContentIdx).toBeLessThan(grandchildContentIdx);
    expect(grandchildContentIdx).toBeLessThan(root2ContentIdx);
  });

  it("should support nested containers with content", () => {
    const result = md.render(`
:::: fields #outer
@outer-prop@
  Outer description.
  
  ::: fields #inner
  @inner-prop@
  Inner description
  :::
::::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('id="outer"');
    expect(result).toContain('id="inner"');
    expect(result).toContain('<span class="field-name">outer-prop</span>');
    expect(result).toContain('<span class="field-name">inner-prop</span>');
    expect(result).toContain("Outer description");
    expect(result).toContain("Inner description");
  });

  it("should handle different field containers nested with content", () => {
    const md = MarkdownIt().use(field, { name: "props" }).use(field, { name: "events" });
    const result = md.render(`
::: props
@prop1@
Prop content.
  ::: events
  @event1@
  Event content.
  :::
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('class="field-wrapper props-fields"');
    expect(result).toContain('class="field-wrapper events-fields"');
    expect(result).toContain('<span class="field-name">prop1</span>');
    expect(result).toContain('<span class="field-name">event1</span>');
    expect(result).toContain("Prop content");
    expect(result).toContain("Event content");
  });
});
