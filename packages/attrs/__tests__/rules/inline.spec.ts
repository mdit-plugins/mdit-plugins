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
    { rule: ["inline"], testSuffix: "(inline rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `inline rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(
        replaceDelimiters("should add classes to inline elements", options),
        () => {
          const src = "paragraph **bold**{.red} asdf";
          const expected =
            '<p>paragraph <strong class="red">bold</strong> asdf</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters(
          "should not add classes to inline elements with too many {{}}",
          options,
        ),
        () => {
          const src = "paragraph **bold**{{.red}} asdf";
          const expected =
            "<p>paragraph <strong>bold</strong>{{.red}} asdf</p>\n";

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            replaceDelimiters(expected, options),
          );
        },
      );

      it(
        replaceDelimiters("should work with nested inline elements", options),
        () => {
          const src = "- **bold *italics*{.blue}**{.green}";

          const expected = `\
<ul>
<li><strong class="green">bold <em class="blue">italics</em></strong></li>
</ul>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters("should add class to inline code block", options),
        () => {
          const src = "bla `click()`{.c}";
          const expected = '<p>bla <code class="c">click()</code></p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters(
          "should work with multiple inline code blocks in same paragraph",
          options,
        ),
        () => {
          const src = "bla `click()`{.c} blah `release()`{.cpp}";
          const expected =
            '<p>bla <code class="c">click()</code> blah <code class="cpp">release()</code></p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters("should not apply inside `code{.red}`", options),
        () => {
          const src = "paragraph `code{.red}`";
          const expected = "<p>paragraph <code>code{.red}</code></p>\n";

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            replaceDelimiters(expected, options),
          );
        },
      );

      it(replaceDelimiters("should support images", options), () => {
        const src = "![alt](img.png){.a}";
        const expected = '<p><img src="img.png" alt="alt" class="a"></p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
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
