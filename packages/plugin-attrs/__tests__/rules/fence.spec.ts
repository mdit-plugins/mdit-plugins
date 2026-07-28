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
        const expected = '<pre class="c" a="1" id="ii"><code>for i in range(10):\n</code></pre>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should support code blocks with language defined", options), () => {
        const src = "```python {.c a=1 #ii}\nfor i in range(10):\n```";
        const expected =
          '<pre class="c" a="1" id="ii"><code class="language-python">for i in range(10):\n</code></pre>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should keep the last value of repeated keys", options), () => {
        const src = "```js {#a #b}\ncode\n```";
        const expected = '<pre id="b"><code class="language-js">code\n</code></pre>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it("should handle VuePress line numbers in code blocks", () => {
        // VuePress line numbers only work with {} delimiters
        // oxlint-disable-next-line vitest/no-conditional-in-test
        if (options.left !== "{" || options.right !== "}") {
          // Skip test for non-curly delimiters since VuePress regex is hardcoded for {}
          return;
        }

        // Test the VuePress line number regex: /{(?:[\d,-]+)}/
        const src = "```python{1,3-5} {.highlight}\nprint('hello')\n```";
        const result = markdownIt.render(src);

        expect(result).toContain('<pre class="highlight"><code class="language-python');

        // Test various VuePress line number patterns
        const testCases = [
          "```js{1} {.class}\nconsole.log('test');\n```",
          "```js{1,3-5} {.class}\nconsole.log('test');\n```",
          "```js{1,3-5,7} {.class}\nconsole.log('test');\n```",
        ];

        testCases.forEach((item) => {
          expect(markdownIt.render(item)).toContain('<pre class="class"><code class="language-js');
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

describe("fence renderer", () => {
  it("should place attrs on <code> when fenceAttrsOnPre is false", () => {
    const markdownIt = MarkdownIt().use(attrs, { fenceAttrsOnPre: false });
    const src = '```js {data-file="index.js"}\nfoo();\n```';

    expect(markdownIt.render(src)).toBe(
      '<pre><code data-file="index.js" class="language-js">foo();\n</code></pre>\n',
    );
  });

  it("should not override a custom fence renderer", () => {
    const markdownIt = MarkdownIt();

    const customFence = (tokens: any[], idx: number): string => {
      const token = tokens[idx];

      return `<pre class="custom"><code>${token.content}</code></pre>\n`;
    };

    markdownIt.renderer.rules.fence = customFence as any;
    markdownIt.use(attrs);

    const src = '```js {data-file="index.js"}\nfoo();\n```';
    const result = markdownIt.render(src);

    expect(markdownIt.renderer.rules.fence).toBe(customFence);
    expect(result).toBe('<pre class="custom"><code>foo();\n</code></pre>\n');
  });

  it("should render no-attrs fence normally", () => {
    const markdownIt = MarkdownIt().use(attrs);
    const src = "```js\nfoo();\n```";

    expect(markdownIt.render(src)).toBe('<pre><code class="language-js">foo();\n</code></pre>\n');
  });
});
