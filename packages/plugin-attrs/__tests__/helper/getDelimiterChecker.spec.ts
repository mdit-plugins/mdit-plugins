import { describe, expect, it } from "vitest";

import { createDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
import type { MarkdownItAttrsOptions } from "../../src/index.js";

describe(createDelimiterChecker, () => {
  const options: Required<MarkdownItAttrsOptions> = {
    left: "{",
    right: "}",
    allowed: [],
    filter: null,
    rule: "all",
    fenceAttrsOnPre: true,
  };

  it("should check start delimiter", () => {
    const checker = createDelimiterChecker(options, "start");

    expect(checker("{.class}")).toStrictEqual([1, 7]);
    expect(checker("{.class} more text")).toStrictEqual([1, 7]);
    expect(checker("text")).toBe(false);
    expect(checker("")).toBe(false);
    expect(checker("{aaa")).toBe(false);
    expect(checker("{.}")).toBe(false); // too short
  });

  it("should check end delimiter", () => {
    const checker = createDelimiterChecker(options, "end");

    expect(checker("text {.class}")).toStrictEqual([6, 12]);
    expect(checker("text")).toBe(false);
    expect(checker("")).toBe(false);
  });

  it("should ignore delimiters inside quoted values", () => {
    const startChecker = createDelimiterChecker(options, "start");
    const endChecker = createDelimiterChecker(options, "end");

    // delimiters inside a quoted value must not start or end the block
    expect(endChecker('text {.replace-me data-tex="e^{i}=-1"}')).toStrictEqual([6, 37]);
    expect(startChecker('{a="}"} text')).toStrictEqual([1, 6]);

    // an unterminated block whose only right delimiter is quoted
    expect(endChecker('x {a="}" y')).toBe(false);

    // a quoted value can swallow the right delimiter
    expect(startChecker('{a="x}')).toBe(false);

    // escaped quotes do not end a quoted value
    expect(endChecker(String.raw`text {a="x\" y"}`)).toStrictEqual([6, 15]);

    // a quote at the very start of the content
    expect(endChecker('"a" {.c}')).toStrictEqual([5, 7]);

    // quotes before the block do not affect end detection
    expect(endChecker('he said "hi" {.c}')).toStrictEqual([14, 16]);

    // quotes after the block do not trigger the quote scan
    expect(startChecker('{.c} "q"')).toStrictEqual([1, 3]);
  });

  it("should detect the end delimiter when quotes are split across inline tokens", () => {
    const endChecker = createDelimiterChecker(options, "end");

    // quotes before the block do not affect end detection, even when unbalanced
    expect(endChecker('he said "hi {.c}')).toStrictEqual([13, 15]);

    // a quoted value may pair with a quote from a previous inline token, which leaves an odd
    // quote in the checked text; the block ending the text is still detected
    expect(endChecker('" will not work. {.attribute}')).toStrictEqual([18, 28]);

    // quotes alone do not turn the text into a block end
    expect(endChecker('"a" }')).toBe(false);

    // only the right delimiter ending the text closes the block
    expect(endChecker("text {.a} }")).toBe(false);

    // an unbalanced quote before a block whose value contains a right delimiter
    expect(endChecker('he said "hi {a="}"}')).toStrictEqual([13, 18]);
  });

  it("should check only delimiter", () => {
    const checker = createDelimiterChecker(options, "only");

    expect(checker("{.class}")).toStrictEqual([1, 7]);
    expect(checker("text {.class}")).toBe(false);
    expect(checker("{.class} text")).toBe(false);
    expect(checker("text")).toBe(false);
  });

  it("should only reject a trailing character matching the end of a multi-char right delimiter", () => {
    const asymmetricOptions: Required<MarkdownItAttrsOptions> = {
      ...options,
      left: "{",
      right: "]}",
    };

    const startChecker = createDelimiterChecker(asymmetricOptions, "start");
    const endChecker = createDelimiterChecker(asymmetricOptions, "end");
    const onlyChecker = createDelimiterChecker(asymmetricOptions, "only");

    expect(startChecker("{.a]}")).toStrictEqual([1, 3]);
    // `]` is part of the right delimiter but not its final character, so it must not reject
    expect(startChecker("{.a]}]")).toStrictEqual([1, 3]);
    expect(startChecker("{.a]} text")).toStrictEqual([1, 3]);
    // a trailing final delimiter character is still rejected
    expect(startChecker("{.a]}}")).toBe(false);

    expect(endChecker("text {.a]}")).toStrictEqual([6, 8]);
    expect(endChecker("text {.a]}]")).toBe(false);

    expect(onlyChecker("{.a]}")).toStrictEqual([1, 3]);
    expect(onlyChecker("{.a]}]")).toBe(false);
  });

  it("should keep the trailing check for a symmetric multi-char right delimiter", () => {
    const symmetricOptions: Required<MarkdownItAttrsOptions> = {
      ...options,
      left: "{{",
      right: "}}",
    };

    const startChecker = createDelimiterChecker(symmetricOptions, "start");
    const endChecker = createDelimiterChecker(symmetricOptions, "end");

    expect(startChecker("{{.a}}")).toStrictEqual([2, 4]);
    expect(startChecker("{{.a}}}")).toBe(false);
    expect(startChecker("{{.a}} text")).toStrictEqual([2, 4]);

    expect(endChecker("text {{.a}}")).toStrictEqual([7, 9]);
  });

  it("should work with custom delimiters", () => {
    const customOptions: Required<MarkdownItAttrsOptions> = {
      left: "[",
      right: "]",
      allowed: [],
      filter: null,
      rule: "all",
      fenceAttrsOnPre: true,
    };

    const startChecker = createDelimiterChecker(customOptions, "start");
    const endChecker = createDelimiterChecker(customOptions, "end");
    const onlyChecker = createDelimiterChecker(customOptions, "only");

    expect(startChecker("[.class]")).toStrictEqual([1, 7]);
    expect(endChecker("text [.class]")).toStrictEqual([6, 12]);
    expect(onlyChecker("[.class]")).toStrictEqual([1, 7]);

    expect(startChecker("{.class}")).toBe(false);
    expect(endChecker("text {.class}")).toBe(false);
    expect(onlyChecker("{.class}")).toBe(false);
  });

  it("should detect the end delimiter when the right delimiter contains a quote", () => {
    const quotedRightOptions: Required<MarkdownItAttrsOptions> = {
      ...options,
      right: 'a"',
    };

    const endChecker = createDelimiterChecker(quotedRightOptions, "end");

    // the only quote is part of the right delimiter, so the fast path applies
    expect(endChecker('text {.c a"')).toStrictEqual([6, 9]);
  });

  it("should throw an error while calling `hasDelimiters` with an invalid `where` param", () => {
    // @ts-expect-error: error in test
    expect(() => createDelimiterChecker(options, 0)).toThrow(/Invalid 'where' parameter/);
    // @ts-expect-error: error in test
    expect(() => createDelimiterChecker(options, "")).toThrow(/Invalid 'where' parameter/);
    // @ts-expect-error: error in test
    expect(() => createDelimiterChecker(options, null)).toThrow(/Invalid 'where' parameter/);
    // @ts-expect-error: error in test
    expect(() => createDelimiterChecker(options)).toThrow(/Invalid 'where' parameter/);
    expect(() =>
      // @ts-expect-error: error in test
      createDelimiterChecker(options, "center")("has {#test} delimiters"),
    ).toThrow(/Invalid 'where' parameter/);
  });
});
