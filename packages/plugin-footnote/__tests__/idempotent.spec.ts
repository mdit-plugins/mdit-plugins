import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../src/index.js";

describe("footnote repeated use", () => {
  it("should not append the footnote section twice", () => {
    const source = "text[^1]\n\n[^1]: note";
    const single = new MarkdownIt().use(footnote).render(source);
    const doubled = new MarkdownIt().use(footnote).use(footnote).render(source);

    expect(doubled).toBe(single);
    expect(doubled.match(/footnotes-sep/g)).toHaveLength(1);
  });
});
