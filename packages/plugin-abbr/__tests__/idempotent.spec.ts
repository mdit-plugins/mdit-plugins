import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { abbr } from "../src/index.js";

describe("abbr repeated use", () => {
  it("should not wrap abbreviation text twice", () => {
    const source = "*[HTML]: Hyper Text Markup Language\n\nThe HTML spec.";
    const single = new MarkdownIt().use(abbr).render(source);
    const doubled = new MarkdownIt().use(abbr).use(abbr).render(source);

    expect(doubled).toBe(single);
    expect(doubled).toContain('<abbr title="Hyper Text Markup Language">HTML</abbr>');
    expect(doubled).not.toContain('<abbr title="Hyper Text Markup Language"><abbr');
  });
});
