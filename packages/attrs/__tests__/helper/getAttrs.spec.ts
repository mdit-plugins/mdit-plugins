import { describe, expect, it } from "vitest";

import { getAttrs } from "../../src/helper/getAttrs.js";
import { getDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
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
      replaceDelimiters(
        "should parse {.class ..css-module #id key=val .class.with.dot}",
        options,
      ),
      () => {
        const src = replaceDelimiters(
          "{.red ..mod #head key=val .class.with.dot}",
          options,
        );
        const expected = [
          ["class", "red"],
          ["css-module", "mod"],
          ["id", "head"],
          ["key", "val"],
          ["class", "class.with.dot"],
        ];

        const range = getDelimiterChecker(
          options,
          "only",
        )(src) as DelimiterRange;

        expect(getAttrs(src, range, options)).toEqual(expected);
      },
    );

    it(
      replaceDelimiters("should parse attributes with = {attr=/id=1}", options),
      () => {
        const src = replaceDelimiters("{link=/some/page/in/app/id=1}", options);
        const expected = [["link", "/some/page/in/app/id=1"]];

        const range = getDelimiterChecker(
          options,
          "only",
        )(src) as DelimiterRange;

        expect(getAttrs(src, range, options)).toEqual(expected);
      },
    );

    it(
      replaceDelimiters(
        'should parse attributes whose are ignored the key chars(\\t,\\n,\\f,\\s,/,>,",\',=) eg: {gt>=true slash/=trace i\\td "q\\fnu e\'r\\ny"=}',
        options,
      ),
      () => {
        const src = replaceDelimiters(
          '{gt>=true slash/=trace i\td "q\fu\ne\'r\ny"=}',
          options,
        );
        const expected = [
          ["gt", "true"],
          ["slash", "trace"],
          ["id", ""],
          ["query", ""],
        ];

        const range = getDelimiterChecker(
          options,
          "only",
        )(src) as DelimiterRange;

        expect(getAttrs(src, range, options)).toEqual(expected);
      },
    );
  });
};

createDelimiterTests(
  {
    left: "{",
    right: "}",
    allowed: [],
  },
  "with { } delimiters",
);

createDelimiterTests(
  {
    left: "[",
    right: "]",
    allowed: [],
  },
  "with [ ] delimiters",
);

createDelimiterTests(
  {
    left: "[[",
    right: "]]",
    allowed: [],
  },
  "with [[ ]] delimiters",
);
