import { describe, expect, it } from "vitest";

import { detectDirective, parseAttributes } from "../src/directive.js";

describe(detectDirective, () => {
  it("should detect @end with trailing space", () => {
    const result = detectDirective("@end trailing", 0, 13);

    expect(result).toEqual({ kind: "end", type: 0, nameEnd: 4, depth: 1 });
  });

  it("should not detect @endfoo as end", () => {
    expect(detectDirective("@endfoo", 0, 7)).toBeNull();
  });

  it("should not detect @flexfoo as flex item", () => {
    expect(detectDirective("@flexfoo", 0, 8)).toBeNull();
  });

  it("should not detect @gridfoo as grid item", () => {
    expect(detectDirective("@gridfoo", 0, 8)).toBeNull();
  });

  it("should not detect @columnfoo as column item", () => {
    expect(detectDirective("@columnfoo", 0, 10)).toBeNull();
  });

  it("should not detect non-@ character", () => {
    expect(detectDirective("hello", 0, 5)).toBeNull();
  });
});

describe(parseAttributes, () => {
  it("should stop parsing on unexpected character", () => {
    const result = parseAttributes("!unexpected", 0, 11);

    expect(result).toEqual({ classes: [], id: "", utilities: [] });
  });

  it("should skip empty class name after dot", () => {
    const result = parseAttributes(".#myid", 0, 6);

    expect(result).toEqual({ classes: [], id: "myid", utilities: [] });
  });

  it("should skip empty id after hash", () => {
    const result = parseAttributes("#.myclass", 0, 9);

    expect(result).toEqual({ classes: ["myclass"], id: "", utilities: [] });
  });
});
