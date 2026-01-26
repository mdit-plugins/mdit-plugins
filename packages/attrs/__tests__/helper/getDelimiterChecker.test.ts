import { describe, expect, it } from "vitest";

import { getDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
import type { MarkdownItAttrsOptions } from "../../src/index.js";

describe(getDelimiterChecker, () => {
  const options: Required<MarkdownItAttrsOptions> = {
    left: "{",
    right: "}",
    allowed: [],
    rule: "all",
  };

  it("should check start delimiter", () => {
    const checker = getDelimiterChecker(options, "start");

    expect(checker("{.class}")).toEqual([1, 7]);
    expect(checker("{.class} more text")).toEqual([1, 7]);
    expect(checker("text")).toBeFalsy();
    expect(checker("")).toBeFalsy();
    expect(checker("{aaa")).toBeFalsy();
    expect(checker("{.}")).toBeFalsy(); // too short
  });

  it("should check end delimiter", () => {
    const checker = getDelimiterChecker(options, "end");

    expect(checker("text {.class}")).toEqual([6, 12]);
    expect(checker("text")).toBeFalsy();
    expect(checker("")).toBeFalsy();
  });

  it("should check only delimiter", () => {
    const checker = getDelimiterChecker(options, "only");

    expect(checker("{.class}")).toEqual([1, 7]);
    expect(checker("text {.class}")).toBeFalsy();
    expect(checker("{.class} text")).toBeFalsy();
    expect(checker("text")).toBeFalsy();
  });

  it("should work with custom delimiters", () => {
    const customOptions: Required<MarkdownItAttrsOptions> = {
      left: "[",
      right: "]",
      allowed: [],
      rule: "all",
    };

    const startChecker = getDelimiterChecker(customOptions, "start");
    const endChecker = getDelimiterChecker(customOptions, "end");
    const onlyChecker = getDelimiterChecker(customOptions, "only");

    expect(startChecker("[.class]")).toEqual([1, 7]);
    expect(endChecker("text [.class]")).toEqual([6, 12]);
    expect(onlyChecker("[.class]")).toEqual([1, 7]);

    expect(startChecker("{.class}")).toBeFalsy();
    expect(endChecker("text {.class}")).toBeFalsy();
    expect(onlyChecker("{.class}")).toBeFalsy();
  });

  it("should throw an error while calling `hasDelimiters` with an invalid `where` param", () => {
    // @ts-expect-error: error in test
    expect(() => getDelimiterChecker(options, 0)).toThrow(/Invalid 'where' parameter/);
    // @ts-expect-error: error in test
    expect(() => getDelimiterChecker(options, "")).toThrow(/Invalid 'where' parameter/);
    // @ts-expect-error: error in test
    expect(() => getDelimiterChecker(options, null)).toThrow(/Invalid 'where' parameter/);
    // @ts-expect-error: error in test
    expect(() => getDelimiterChecker(options)).toThrow(/Invalid 'where' parameter/);
    expect(() =>
      // @ts-expect-error: error in test
      getDelimiterChecker(options, "center")("has {#test} delimiters"),
    ).toThrow(/Invalid 'where' parameter/);
  });
});
