import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { anchor } from "../src/index.js";

describe("anchor repeated use", () => {
  it("should render the same output when installed twice", () => {
    const single = new MarkdownIt().use(anchor);
    const doubled = new MarkdownIt().use(anchor).use(anchor);
    const source = "# Title\n\n## Subtitle";

    expect(() => doubled.render(source)).not.toThrow();
    expect(doubled.render(source)).toBe(single.render(source));
  });
});
