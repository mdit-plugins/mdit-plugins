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
});
