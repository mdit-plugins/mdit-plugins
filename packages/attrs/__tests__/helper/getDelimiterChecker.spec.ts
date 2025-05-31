import { describe, expect, it } from "vitest";

import { getDelimiterChecker } from "../../src/helper/getDelimiterChecker.js";
import type { MarkdownItAttrsOptions } from "../../src/index.js";

describe("getDelimiterChecker", () => {
  const options: Required<MarkdownItAttrsOptions> = {
    left: "{",
    right: "}",
    allowed: [],
    rule: "all",
  };

  it("should check start delimiter", () => {
    const checker = getDelimiterChecker(options, "start");

    expect(checker("{.class}")).toBe(true);
    expect(checker("{.class} more text")).toBe(true);
    expect(checker("text")).toBe(false);
    expect(checker("")).toBe(false);
    expect(checker("{.}")).toBe(false); // too short
  });

  it("should check end delimiter", () => {
    const checker = getDelimiterChecker(options, "end");

    expect(checker("text {.class}")).toBe(true);
    expect(checker("text")).toBe(false);
    expect(checker("")).toBe(false);
  });

  it("should check only delimiter", () => {
    const checker = getDelimiterChecker(options, "only");

    expect(checker("{.class}")).toBe(true);
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

    const startChecker = getDelimiterChecker(customOptions, "start");
    const endChecker = getDelimiterChecker(customOptions, "end");
    const onlyChecker = getDelimiterChecker(customOptions, "only");

    expect(startChecker("[.class]")).toBe(true);
    expect(endChecker("text [.class]")).toBe(true);
    expect(onlyChecker("[.class]")).toBe(true);

    expect(startChecker("{.class}")).toBe(false);
    expect(endChecker("text {.class}")).toBe(false);
    expect(onlyChecker("{.class}")).toBe(false);
  });
});
