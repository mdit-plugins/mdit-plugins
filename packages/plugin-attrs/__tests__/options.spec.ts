import { tasklist } from "@mdit/plugin-tasklist";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs, DEFAULT_RULES, EXTENSION_RULES } from "../src/index.js";

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

    expect(markdownIt.render(codeBlockSrc)).toContain('class="highlight language-python"');

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

    expect(markdownIt.render(codeBlockSrc)).toContain('class="highlight language-python"');
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
      allowed: [/^(?:class|attr)$/],
    });

    expect(markdownIt.render("text {.some-class #some-id attr=allowed}")).toBe(
      '<p class="some-class" attr="allowed">text</p>\n',
    );
  });
});

describe("exported rule lists", () => {
  it("should match the all preset", () => {
    const markdownItAll = MarkdownIt().use(attrs);
    const markdownItList = MarkdownIt().use(attrs, { rule: DEFAULT_RULES });
    const src = "# heading {#id}\n\ntext {.c}\n\n```js {.fence}\nconst a = 1;\n```\n";

    expect(markdownItList.render(src)).toBe(markdownItAll.render(src));
  });

  it("should support filtering out a single rule", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: DEFAULT_RULES.filter((name) => name !== "fence"),
    });

    expect(markdownIt.render("```js {.fence}\nconst a = 1;\n```\n")).toBe(
      '<pre><code class="language-js">const a = 1;\n</code></pre>\n',
    );
    expect(markdownIt.render("text {.c}")).toBe('<p class="c">text</p>\n');
  });

  it("should enable extension rules together with the defaults", () => {
    const markdownIt = MarkdownIt()
      .use(attrs, { rule: [...DEFAULT_RULES, ...EXTENSION_RULES] })
      .use(tasklist);
    const expected = `\
<ul class="task-list-container">
<li class="task-list-item red"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> foo</label></li>
</ul>
`;

    expect(markdownIt.render("- [ ] foo {.red}")).toBe(expected);
  });
});
