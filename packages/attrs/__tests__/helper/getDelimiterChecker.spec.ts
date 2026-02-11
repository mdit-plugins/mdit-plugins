import { describe, expect, it } from "vitest";

import { createDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
import type { MarkdownItAttrsOptions } from "../../src/index.js";

describe(createDelimiterChecker, () => {
  const options: Required<MarkdownItAttrsOptions> = {
    left: "{",
    right: "}",
    allowed: [],
    rule: "all",
  };

  it("should check start delimiter", () => {
    const checker = createDelimiterChecker(options, "start");

    expect(checker("{.class}")).toEqual([1, 7]);
    expect(checker("{.class} more text")).toEqual([1, 7]);
    expect(checker("text")).toBe(false);
    expect(checker("")).toBe(false);
    expect(checker("{aaa")).toBe(false);
    expect(checker("{.}")).toBe(false); // too short
  });

  it("should check end delimiter", () => {
    const checker = createDelimiterChecker(options, "end");

    expect(checker("text {.class}")).toEqual([6, 12]);
    expect(checker("text")).toBe(false);
    expect(checker("")).toBe(false);
  });

  it("should check only delimiter", () => {
    const checker = createDelimiterChecker(options, "only");

    expect(checker("{.class}")).toEqual([1, 7]);
    expect(checker("text {.class}")).toBe(false);
    expect(checker("{.class} text")).toBe(false);
    expect(checker("text")).toBe(false);
  });

  it("should work with custom delimiters", () => {
    const customOptions: Required<MarkdownItAttrsOptions> = {
      left: "[",
      right: "]",
      allowed: [],
      rule: "all",
    };

    const startChecker = createDelimiterChecker(customOptions, "start");
    const endChecker = createDelimiterChecker(customOptions, "end");
    const onlyChecker = createDelimiterChecker(customOptions, "only");

    expect(startChecker("[.class]")).toEqual([1, 7]);
    expect(endChecker("text [.class]")).toEqual([6, 12]);
    expect(onlyChecker("[.class]")).toEqual([1, 7]);

    expect(startChecker("{.class}")).toBe(false);
    expect(endChecker("text {.class}")).toBe(false);
    expect(onlyChecker("{.class}")).toBe(false);
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
