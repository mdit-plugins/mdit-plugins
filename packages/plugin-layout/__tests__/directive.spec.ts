import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { detectDirective, parseAttributes } from "../src/directive.js";

const { isSpace } = new MarkdownIt().utils;

describe(detectDirective, () => {
  it("should detect @end followed by only spaces", () => {
    expect(detectDirective("@end  ", 0, 6, isSpace)).toStrictEqual({
      kind: "end",
      type: 0,
      nameEnd: 4,
      depth: 1,
    });
  });

  it("should detect @end followed by a tab", () => {
    expect(detectDirective("@end\t", 0, 5, isSpace)).toStrictEqual({
      kind: "end",
      type: 0,
      nameEnd: 4,
      depth: 1,
    });
  });

  it("should not detect @end with trailing content as end", () => {
    expect(detectDirective("@end trailing", 0, 13, isSpace)).toBeNull();
  });

  it("should not detect @endfoo as end", () => {
    expect(detectDirective("@endfoo", 0, 7, isSpace)).toBeNull();
  });

  it("should detect @flex followed by a tab as flex item", () => {
    expect(detectDirective("@flex\t", 0, 6, isSpace)).toStrictEqual({
      kind: "item",
      type: 1,
      nameEnd: 5,
      depth: 1,
    });
  });

  it("should detect @flex followed by a space and a tab as flex item", () => {
    expect(detectDirective("@flex \t", 0, 7, isSpace)).toStrictEqual({
      kind: "item",
      type: 1,
      nameEnd: 5,
      depth: 1,
    });
  });

  it("should not detect @flexfoo as flex item", () => {
    expect(detectDirective("@flexfoo", 0, 8, isSpace)).toBeNull();
  });

  it("should not detect @gridfoo as grid item", () => {
    expect(detectDirective("@gridfoo", 0, 8, isSpace)).toBeNull();
  });

  it("should not detect @columnfoo as column item", () => {
    expect(detectDirective("@columnfoo", 0, 10, isSpace)).toBeNull();
  });

  it("should not detect non-@ character", () => {
    expect(detectDirective("hello", 0, 5, isSpace)).toBeNull();
  });
});

describe(parseAttributes, () => {
  it("should stop parsing on unexpected character", () => {
    const result = parseAttributes("!unexpected", 0, 11, isSpace);

    expect(result).toStrictEqual({ classes: [], id: "", utilities: [] });
  });

  it("should skip empty class name after dot", () => {
    const result = parseAttributes(".#myid", 0, 6, isSpace);

    expect(result).toStrictEqual({ classes: [], id: "myid", utilities: [] });
  });

  it("should skip empty id after hash", () => {
    const result = parseAttributes("#.myclass", 0, 9, isSpace);

    expect(result).toStrictEqual({ classes: ["myclass"], id: "", utilities: [] });
  });

  it("should parse utilities separated by spaces and tabs", () => {
    const result = parseAttributes(" \tgap-4\titems-center", 0, 20, isSpace);

    expect(result).toStrictEqual({
      classes: [],
      id: "",
      utilities: ["gap-4", "items-center"],
    });
  });

  it("should stop a class name at a tab", () => {
    const result = parseAttributes(".nav\tgap-4", 0, 10, isSpace);

    expect(result).toStrictEqual({ classes: ["nav"], id: "", utilities: ["gap-4"] });
  });

  it("should return no utilities when only whitespace follows", () => {
    const result = parseAttributes(" \t", 0, 2, isSpace);

    expect(result).toStrictEqual({ classes: [], id: "", utilities: [] });
  });
});
