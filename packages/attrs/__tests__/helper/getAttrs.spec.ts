import { escapeHtml } from "@mdit/helper";
import { describe, expect, it } from "vitest";

import { getAttrs } from "../../src/helper/getAttrs.js";
import { getDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
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

    it(
      replaceDelimiters(
        'should parse attributes whose are ignored the key chars(\\t,\\n,\\f,\\s,/,>,",\',=) eg: {gt>=true slash/=trace i\\td "q\\fnu e\'r\\ny"=}',
        options,
      ),
      () => {
        const src = '{gt>=true slash/=trace i\td "q\fu\ne\'r\ny"=}';
        const expected = [
          ["gt", "true"],
          ["slash", "trace"],
          ["id", ""],
          ["query", ""],
        ];

        expect(getAttrs(replaceDelimiters(src, options), 0, options)).toEqual(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should throw an error while calling `hasDelimiters` with an invalid `where` param",
        options,
      ),
      () => {
        // @ts-expect-error: error in test
        expect(() => getDelimiterChecker(options, 0)).toThrow(
          /Invalid 'where' parameter/,
        );
        // @ts-expect-error: error in test
        expect(() => getDelimiterChecker(options, "")).toThrow(
          /Invalid 'where' parameter/,
        );
        // @ts-expect-error: error in test
        expect(() => getDelimiterChecker(options, null)).toThrow(
          /Invalid 'where' parameter/,
        );
        // @ts-expect-error: error in test
        expect(() => getDelimiterChecker(options, undefined)).toThrow(
          /Invalid 'where' parameter/,
        );
        expect(() =>
          // @ts-expect-error: error in test
          getDelimiterChecker(options, "center")("has {#test} delimiters"),
        ).toThrow(/Invalid 'where' parameter/);
      },
    );

    it('should escape html entities(&,<,>,") eg: <a href="?a&b">TOC</a>', () => {
      const src = '<a href="a&b">TOC</a>';
      const expected = "&lt;a href=&quot;a&amp;b&quot;&gt;TOC&lt;/a&gt;";

      expect(escapeHtml(src)).toEqual(expected);
    });

    it('should keep the origional input which is not contains(&,<,>,") char(s) eg: |a|b|', () => {
      const src = "|a|b|";
      const expected = "|a|b|";

      expect(escapeHtml(src)).toEqual(expected);
    });
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
