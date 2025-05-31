import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../src/index.js";

describe("rule settings", () => {
  it("should disable all rules when rule option is false", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: false,
    });

    // None of the attrs should be applied when rules are disabled
    const src = "text {.class}";
    const expected = "<p>text {.class}</p>\n";

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should only enable specific rules when rule is array", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: ["fence", "table"], // Only enable fence and table rules
    });

    // Code block should work (fence rule enabled)
    const codeBlockSrc = "```python {.highlight}\nprint('test')\n```";

    expect(markdownIt.render(codeBlockSrc)).toContain(
      'class="highlight language-python"',
    );

    // Inline attributes should NOT work (inline rule disabled)
    const inlineSrc = "text {.class}";

    expect(markdownIt.render(inlineSrc)).toBe("<p>text {.class}</p>\n");
  });

  it("should filter out invalid rule names", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: ["fence", "invalid-rule", "table", "another-invalid"], // Mix of valid and invalid
    });

    // Should still work for valid rules
    const codeBlockSrc = "```python {.highlight}\nprint('test')\n```";

    expect(markdownIt.render(codeBlockSrc)).toContain(
      'class="highlight language-python"',
    );
  });

  it("should handle empty rule array", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: [], // Empty array should disable all rules
    });

    const src = "text {.class}";
    const expected = "<p>text {.class}</p>\n";

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should not throw when getting only allowed option", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      allowed: [/^(class|attr)$/],
    });

    expect(markdownIt.render("text {.some-class #some-id attr=allowed}")).toBe(
      '<p class="some-class" attr="allowed">text</p>\n',
    );
  });
});
