import { dl } from "@mdit/plugin-dl";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../../src/index.js";

describe("dl rule", () => {
  const markdownIt = new MarkdownIt().use(attrs, { rule: ["dl"] }).use(dl);

  it("should stay disabled by default", () => {
    // without the dl rule the generic softbreak rule targets the dd
    const markdownItDefault = new MarkdownIt().use(attrs).use(dl);
    const expected = `\
<dl>
<dt>Term</dt>
<dd class="fancy">def1</dd>
<dd>def2</dd>
</dl>
`;

    expect(markdownItDefault.render("Term\n: def1\n{.fancy}\n: def2")).toBe(expected);
  });

  it("should apply attributes to tight definitions", () => {
    const expected = `\
<dl>
<dt>Term</dt>
<dd class="x">def</dd>
</dl>
`;

    expect(markdownIt.render("Term\n: def {.x}")).toBe(expected);
  });

  it("should support attributes without a leading space", () => {
    const expected = `\
<dl>
<dt>Term</dt>
<dd class="x">def</dd>
</dl>
`;

    expect(markdownIt.render("Term\n: def{.x}")).toBe(expected);
  });

  it("should apply attributes to loose definitions", () => {
    const expected = `\
<dl>
<dt>Term</dt>
<dd class="x">
<p>def</p>
</dd>
</dl>
`;

    expect(markdownIt.render("Term\n\n: def {.x}")).toBe(expected);
  });

  it("should apply attributes to later definitions", () => {
    const expected = `\
<dl>
<dt>Term</dt>
<dd>def1</dd>
<dd id="did">def2</dd>
</dl>
`;

    expect(markdownIt.render("Term\n: def1\n: def2 {#did}")).toBe(expected);
  });

  it("should apply attributes after a softbreak to the definition list", () => {
    const expected = `\
<dl class="fancy">
<dt>Term</dt>
<dd>def</dd>
</dl>
`;

    expect(markdownIt.render("Term\n: def\n{.fancy}")).toBe(expected);
  });

  it("should apply softbreak attributes from a middle definition", () => {
    const expected = `\
<dl class="fancy">
<dt>Term</dt>
<dd>def1</dd>
<dd>def2</dd>
</dl>
`;

    expect(markdownIt.render("Term\n: def1\n{.fancy}\n: def2")).toBe(expected);
  });

  it("should apply attributes in a paragraph after the definition list", () => {
    const expected = `\
<dl class="b">
<dt>Term</dt>
<dd>def</dd>
</dl>
`;

    expect(markdownIt.render("Term\n: def\n\n{.b}")).toBe(expected);
  });
});
