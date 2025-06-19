import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

const createTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const options = { ...baseOptions, allowed: [], rule: ["heading"] };

  describe(`heading rules ${delimiterText} (heading rule only)`, () => {
    const markdownIt = MarkdownIt().use(attrs, options);

    it(replaceDelimiters("should add attributes on headings", options), () => {
      const testCases = [
        ["## some text {with=attrs}", '<h2 with="attrs">some text</h2>\n'],
        ["### some text{#id}", '<h3 id="id">some text</h3>\n'],
      ];

      testCases.forEach(([src, expected]) => {
        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });
    });

    it(
      replaceDelimiters("should not add attributes on others", options),
      () => {
        const testCases = [
          ["some text {with=attrs}", "{with=attrs}"],
          ["- some text {#id}", "{#id}"],
        ];

        testCases.forEach(([src, expected]) => {
          expect(markdownIt.render(replaceDelimiters(src, options))).toContain(
            replaceDelimiters(expected, options),
          );
        });
      },
    );
  });
};

// Call the dual rule tests for different delimiter configurations
createTests(
  {
    left: "{",
    right: "}",
  },
  "",
);

createTests(
  {
    left: "[",
    right: "]",
  },
  "with [ ] delimiters",
);

createTests(
  {
    left: "[[",
    right: "]]",
  },
  "with [[ ]] delimiters",
);
