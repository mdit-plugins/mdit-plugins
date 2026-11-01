import { describe, expect, it } from "vitest";

import { getAttrs } from "../../src/helper/getAttrs.js";
import { createDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
import type { DelimiterConfig } from "../../src/helper/types.js";
import type { MarkdownItAttrsOptions } from "../../src/index.js";
import type { DelimiterRange } from "../../src/rules/types.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

const createDelimiterTests = (
  options: MarkdownItAttrsOptions & DelimiterConfig,
  delimiterText: string,
): void => {
  describe(`getAttrs ${delimiterText}`, () => {
    it(
      replaceDelimiters("should parse {.class ..css-module #id key=val .class.with.dot}", options),
      () => {
        const src = replaceDelimiters("{.red ..mod #head key=val .class.with.dot}", options);
        const expected = [
          ["class", "red"],
          ["css-module", "mod"],
          ["id", "head"],
          ["key", "val"],
          ["class", "class.with.dot"],
        ];

        const range = createDelimiterChecker(options, "only")(src) as DelimiterRange;

        expect(getAttrs(src, range, null)).toStrictEqual(expected);
      },
    );

    it(replaceDelimiters("should parse attributes with = {attr=/id=1}", options), () => {
      const src = replaceDelimiters("{link=/some/page/in/app/id=1}", options);
      const expected = [["link", "/some/page/in/app/id=1"]];

      const range = createDelimiterChecker(options, "only")(src) as DelimiterRange;

      expect(getAttrs(src, range, null)).toStrictEqual(expected);
    });

    it(
      replaceDelimiters("should unescape quotes and backslashes in quoted values", options),
      () => {
        const cases: [src: string, expected: [string, string][]][] = [
          [String.raw`{a="x\" y"}`, [["a", 'x" y']]],
          [String.raw`{title="a\"b"}`, [["title", 'a"b']]],
          [String.raw`{data-a="x\\y"}`, [["data-a", String.raw`x\y`]]],
          [String.raw`{data-a="\q"}`, [["data-a", String.raw`\q`]]],
          [String.raw`{data-a="x\""}`, [["data-a", 'x"']]],
          [String.raw`{data-a="x\\"}`, [["data-a", "x\\"]]],
          // unquoted values keep backslashes literally, including escaped-looking pairs
          [String.raw`{data-a=x\y}`, [["data-a", String.raw`x\y`]]],
          [String.raw`{data-a=x\\y}`, [["data-a", String.raw`x\\y`]]],
        ];

        for (const [src, expected] of cases) {
          const content = replaceDelimiters(src, options);
          const range = createDelimiterChecker(options, "only")(content) as DelimiterRange;

          expect(getAttrs(content, range, null)).toStrictEqual(expected);
        }
      },
    );

    it(
      replaceDelimiters(
        String.raw`should parse attributes whose are ignored the key chars(\t,\n,\f,\s,/,>,",',=) eg: {gt>=true slash/=trace i\td "q\fnu e'r\ny"=}`,
        options,
      ),
      () => {
        const src = replaceDelimiters('{gt>=true slash/=trace i\td "q\fu\ne\'r\ny"=}', options);
        const expected = [
          ["gt", "true"],
          ["slash", "trace"],
          ["id", ""],
          ["query", ""],
        ];

        const range = createDelimiterChecker(options, "only")(src) as DelimiterRange;

        expect(getAttrs(src, range, null)).toStrictEqual(expected);
      },
    );
  });
};

createDelimiterTests(
  {
    left: "{",
    right: "}",
    allowed: [],
    filter: null,
  },
  "with { } delimiters",
);

createDelimiterTests(
  {
    left: "[",
    right: "]",
    allowed: [],
    filter: null,
  },
  "with [ ] delimiters",
);

createDelimiterTests(
  {
    left: "[[",
    right: "]]",
    allowed: [],
    filter: null,
  },
  "with [[ ]] delimiters",
);
