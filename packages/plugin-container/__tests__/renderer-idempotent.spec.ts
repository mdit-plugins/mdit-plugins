import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { container } from "../src/index.js";

describe("container renderer idempotency", () => {
  it("should render the same output when rendering the same tokens twice", () => {
    const md = new MarkdownIt().use(container, { name: "note" });
    const tokens = md.parse("::: note\ncontent\n:::\n", {});
    const expected = `<div class="note">
<p>content</p>
</div>
`;

    const firstRender = md.renderer.render(tokens, md.options, {});
    const secondRender = md.renderer.render(tokens, md.options, {});

    expect(firstRender).toBe(expected);
    expect(secondRender).toBe(expected);
  });

  it("should append the container class after classes added by other plugins", () => {
    const md = new MarkdownIt().use(container, { name: "note" });
    const tokens = md.parse("::: note\ncontent\n:::\n", {});

    // simulate attributes added by another plugin (e.g. @mdit/plugin-attrs)
    // before the token gets rendered
    tokens[0].attrSet("class", "custom");

    expect(md.renderer.render(tokens, md.options, {})).toBe(
      `<div class="custom note">
<p>content</p>
</div>
`,
    );
  });
});
