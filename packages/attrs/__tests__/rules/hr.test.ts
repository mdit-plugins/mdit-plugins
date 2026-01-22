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
    { rule: ["hr"], testSuffix: "(hr rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `hr rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(replaceDelimiters("should support horizontal rules ---{#id}", options), () => {
        const testCases = [
          ["---{#id}", '<hr id="id">\n'],
          [" ---{#id}", '<hr id="id">\n'],
          ["  ---{#id}", '<hr id="id">\n'],
          ["   ---{#id}", '<hr id="id">\n'],
          [">\t ---{#id}", '<blockquote>\n<hr id="id">\n</blockquote>\n'],
        ];

        testCases.forEach(([src, expected]) => {
          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        });
      });

      it(replaceDelimiters("should not convert marker < 3", options), () => {
        const testCases = ["--{#id}", "- - -{#id}"];

        testCases.forEach((src) => {
          expect(markdownIt.render(replaceDelimiters(src, options))).not.toContain("hr");
        });
      });

      it("should support multiple classes for <hr>", () => {
        const src = "--- {.a .b}";
        const expected = '<hr class="a b">\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
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
