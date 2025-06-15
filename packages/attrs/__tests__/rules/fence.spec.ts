import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

const createDualRuleTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const contexts = [
    { rule: ["fence"], testSuffix: "(fence rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `fence rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(replaceDelimiters("should support code blocks", options), () => {
        const src = "```{.c a=1 #ii}\nfor i in range(10):\n```";
        const expected =
          '<pre><code class="c" a="1" id="ii">for i in range(10):\n</code></pre>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(
        replaceDelimiters(
          "should support code blocks with language defined",
          options,
        ),
        () => {
          const src = "```python {.c a=1 #ii}\nfor i in range(10):\n```";
          const expected =
            '<pre><code class="c language-python" a="1" id="ii">for i in range(10):\n</code></pre>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it("should handle VuePress line numbers in code blocks", () => {
        // VuePress line numbers only work with {} delimiters
        if (options.left !== "{" || options.right !== "}") {
          // Skip test for non-curly delimiters since VuePress regex is hardcoded for {}
          return;
        }

        // Test the VuePress line number regex: /{(?:[\d,-]+)}/
        const src = "```python{1,3-5} {.highlight}\nprint('hello')\n```";
        const result = markdownIt.render(src);

        expect(result).toContain('<code class="highlight language-python');

        // Test various VuePress line number patterns
        const testCases = [
          "```js{1} {.class}\nconsole.log('test');\n```",
          "```js{1,3-5} {.class}\nconsole.log('test');\n```",
          "```js{1,3-5,7} {.class}\nconsole.log('test');\n```",
        ];

        testCases.forEach((src) => {
          const result = markdownIt.render(src);

          expect(result).toContain('<code class="class language-js');
        });
      });
    });
  });
};

// Call the dual rule tests for different delimiter configurations
createDualRuleTests(
  {
    left: "{",
    right: "}",
  },
  "",
);

createDualRuleTests(
  {
    left: "[",
    right: "]",
  },
  "with [ ] delimiters",
);

createDualRuleTests(
  {
    left: "[[",
    right: "]]",
  },
  "with [[ ]] delimiters",
);
