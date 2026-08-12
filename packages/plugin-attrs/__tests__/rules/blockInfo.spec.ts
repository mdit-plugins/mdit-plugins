import { container } from "@mdit/plugin-container";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

const createContainerMarkdownIt = (options: MarkdownItAttrsOptions): MarkdownItType =>
  new MarkdownIt().use(attrs, options).use(container, { name: "warning" });

const createDualRuleTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const contexts: { rule: MarkdownItAttrsOptions["rule"]; testSuffix: string }[] = [
    { rule: ["blockInfo"], testSuffix: "(blockInfo rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ];

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `blockInfo rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = createContainerMarkdownIt(options);

      it(replaceDelimiters("should support containers", options), () => {
        const src = "::: warning {.custom #ii a=1}\ncontent\n:::";
        const expected = '<div class="custom warning" id="ii" a="1">\n<p>content</p>\n</div>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should support containers with attributes only", options), () => {
        const src = "::: warning {.custom}\ncontent\n:::";
        const expected = '<div class="custom warning">\n<p>content</p>\n</div>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should support attributes right after the title", options), () => {
        const src = "::: warning Title{.custom}\ncontent\n:::";
        const expected = '<div class="custom warning">\n<p>content</p>\n</div>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });
    });
  });
};

createDualRuleTests({ left: "{", right: "}" }, "with default delimiters");
createDualRuleTests({ left: "[", right: "]" }, "with [ ] delimiters");
createDualRuleTests({ left: "[[", right: "]]" }, "with [[ ]] delimiters");

describe("blockInfo rule scope", () => {
  it("should not consume code block meta when fence rule is disabled", () => {
    const markdownIt = createContainerMarkdownIt({ rule: ["blockInfo"] });

    expect(markdownIt.render("```python {.c a=1}\nx\n```")).toBe(
      '<pre><code class="language-python">x\n</code></pre>\n',
    );
  });

  it("should not apply to containers when only fence rule is enabled", () => {
    const markdownIt = createContainerMarkdownIt({ rule: ["fence"] });

    expect(markdownIt.render("::: warning {.custom}\ncontent\n:::")).toBe(
      '<div class="warning">\n<p>content</p>\n</div>\n',
    );
  });

  it("should support both containers and code blocks with all rules", () => {
    const markdownIt = createContainerMarkdownIt({ rule: "all" });

    expect(markdownIt.render("::: warning {.custom}\ncontent\n:::")).toBe(
      '<div class="custom warning">\n<p>content</p>\n</div>\n',
    );
    expect(markdownIt.render("```python {.c}\nx\n```")).toBe(
      '<pre class="c"><code class="language-python">x\n</code></pre>\n',
    );
  });

  it("should respect allowed attributes", () => {
    const markdownIt = createContainerMarkdownIt({
      rule: ["blockInfo"],
      allowed: ["class"],
    });

    expect(markdownIt.render("::: warning {.custom #ii a=1}\ncontent\n:::")).toBe(
      '<div class="custom warning">\n<p>content</p>\n</div>\n',
    );
  });
});
