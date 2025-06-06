import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

// Helper function to create test suites with both individual and all rule configurations
const createDualRuleTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const contexts = [
    { rule: ["softbreak"], testSuffix: "(softbreak rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `softbreak rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(
        replaceDelimiters("should apply attrs after softbreak", options),
        () => {
          const src = `text
{.class}`;
          const expected = `<p class="class">text</p>\n`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(replaceDelimiters("should apply ID after softbreak", options), () => {
        const src = `text
{#myid}`;
        const expected = `<p id="myid">text</p>\n`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(
        replaceDelimiters(
          "should apply multiple attrs after softbreak",
          options,
        ),
        () => {
          const src = `text
{.class #id data-test=value}`;
          const expected = `<p class="class" id="id" data-test="value">text</p>\n`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(replaceDelimiters("should work with nested elements", options), () => {
        const src = `**bold text**
{.highlight}`;
        const expected = `<p class="highlight"><strong>bold text</strong></p>\n`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(replaceDelimiters("should work in blockquotes", options), () => {
        const src = `> quoted text
{.quote}`;
        const expected = `<blockquote class="quote">\n<p>quoted text</p>\n</blockquote>\n`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(
        replaceDelimiters("should work with multiple paragraphs", options),
        () => {
          const src = `first paragraph
{.first}

second paragraph
{.second}`;
          const expected = `<p class="first">first paragraph</p>\n<p class="second">second paragraph</p>\n`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters("should not interfere with normal text", options),
        () => {
          const src = `normal text
more text on new line`;
          const expected = `<p>normal text\nmore text on new line</p>\n`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );
    });
  });
};

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
