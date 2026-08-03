import { describe, expect, it } from "vitest";

import { parseAttrs } from "../src/index.js";

describe(parseAttrs, () => {
  it("should parse attrs at the end by default", () => {
    expect(parseAttrs("foo {.bar #baz data-a=b}")).toStrictEqual([
      ["class", "bar"],
      ["id", "baz"],
      ["data-a", "b"],
    ]);

    expect(parseAttrs("{.bar}")).toStrictEqual([["class", "bar"]]);
  });

  it("should return null when no valid attrs section is found", () => {
    expect(parseAttrs("foo")).toBeNull();
    expect(parseAttrs("")).toBeNull();
    expect(parseAttrs("foo {.bar} baz")).toBeNull();
  });

  it("should support quoted values and css modules", () => {
    expect(parseAttrs('foo {..module key="value with spaces"}')).toStrictEqual([
      ["css-module", "module"],
      ["key", "value with spaces"],
    ]);
  });

  it("should return an empty array when the attrs section contains no attrs", () => {
    expect(parseAttrs("foo { }")).toStrictEqual([]);
  });

  it("should support where option", () => {
    expect(parseAttrs("{.bar} foo", { where: "start" })).toStrictEqual([["class", "bar"]]);
    expect(parseAttrs("foo {.bar}", { where: "start" })).toBeNull();

    expect(parseAttrs("{.bar}", { where: "only" })).toStrictEqual([["class", "bar"]]);
    expect(parseAttrs("foo {.bar}", { where: "only" })).toBeNull();
  });

  it("should support custom delimiters", () => {
    expect(parseAttrs("foo [.bar]", { left: "[", right: "]" })).toStrictEqual([["class", "bar"]]);
    expect(parseAttrs("foo {.bar}", { left: "[", right: "]" })).toBeNull();
  });

  it("should filter attrs with allowed option", () => {
    expect(parseAttrs("foo {.bar #baz data-a=b}", { allowed: ["class", "id"] })).toStrictEqual([
      ["class", "bar"],
      ["id", "baz"],
    ]);

    expect(parseAttrs("foo {.bar #baz}", { allowed: [{ name: "id" }] })).toStrictEqual([
      ["id", "baz"],
    ]);

    expect(
      parseAttrs("foo {a=1 b=2}", {
        allowed: [
          { name: "a", value: ["1"] },
          { name: "b", value: ["3"] },
        ],
      }),
    ).toStrictEqual([["a", "1"]]);

    // a valid attrs section with all attrs filtered out yields [], not null
    expect(parseAttrs("foo {.bar}", { allowed: ["id"] })).toStrictEqual([]);
  });
});
