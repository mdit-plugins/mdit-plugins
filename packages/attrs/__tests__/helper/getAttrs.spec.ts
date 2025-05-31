import { describe, expect, it } from "vitest";

import { getAttrs } from "../../src/helper/getAttrs.js";
import type { DelimiterConfig } from "../../src/helper/types.js";
import type { MarkdownItAttrsOptions } from "../../src/index.js";
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
        const src = "{.red ..mod #head key=val .class.with.dot}";
        const expected = [
          ["class", "red"],
          ["css-module", "mod"],
          ["id", "head"],
          ["key", "val"],
          ["class", "class.with.dot"],
        ];

        expect(getAttrs(replaceDelimiters(src, options), 0, options)).toEqual(
          expected,
        );
      },
    );

    it(
      replaceDelimiters("should parse attributes with = {attr=/id=1}", options),
      () => {
        const src = "{link=/some/page/in/app/id=1}";
        const expected = [["link", "/some/page/in/app/id=1"]];

        expect(getAttrs(replaceDelimiters(src, options), 0, options)).toEqual(
          expected,
        );
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
