import { describe, it, expect } from "vitest";
import { normalizeAttributes, parseAttributes, ucFirst } from "../src/utils.js";

describe(ucFirst, () => {
  it("should capitalize first letter", () => {
    expect(ucFirst("hello")).toBe("Hello");
    expect(ucFirst("world")).toBe("World");
  });

  it("should handle empty string", () => {
    expect(ucFirst("")).toBe("");
  });

  it("should handle single character", () => {
    expect(ucFirst("a")).toBe("A");
  });
});

describe(normalizeAttributes, () => {
  it("should return null if no attributes provided", () => {
    expect(normalizeAttributes()).toBeNull();
  });

  it("should normalize attributes with defaults", () => {
    const attrs = [{ attr: "key1" }, { attr: "key-two" }];
    const result = normalizeAttributes(attrs);

    expect(result?.get("key1")).toEqual({
      display: "Key1",
      boolean: false,
      index: 0,
    });
    expect(result?.get("key-two")).toEqual({
      display: "Key-two",
      boolean: false,
      index: 1,
    });
  });

  it("should normalize attributes with custom names and boolean", () => {
    const attrs = [
      { attr: "k1", name: "Key 1", boolean: true },
      { attr: "k2", name: "Key 2" },
    ];
    const result = normalizeAttributes(attrs);

    expect(result?.get("k1")).toEqual({
      display: "Key 1",
      boolean: true,
      index: 0,
    });
    expect(result?.get("k2")).toEqual({
      display: "Key 2",
      boolean: false,
      index: 1,
    });
  });
});

describe(parseAttributes, () => {
  describe("default behavior", () => {
    it("should parse quoted attributes", () => {
      expect(parseAttributes('key="value"')).toEqual([
        { attr: "key", name: "Key", value: "value" },
      ]);
      expect(parseAttributes("key='value'")).toEqual([
        { attr: "key", name: "Key", value: "value" },
      ]);
    });

    it("should parse unquoted attributes", () => {
      expect(parseAttributes("key=value")).toEqual([{ attr: "key", name: "Key", value: "value" }]);
      expect(parseAttributes("a=1 b=2")).toEqual([
        { attr: "a", name: "A", value: "1" },
        { attr: "b", name: "B", value: "2" },
      ]);
    });

    it("should handle mixed attributes", () => {
      expect(parseAttributes('a="1" b=2 c')).toEqual([
        { attr: "a", name: "A", value: "1" },
        { attr: "b", name: "B", value: "2" },
        { attr: "c", name: "C", value: true },
      ]);
    });

    it("should handle escapes in values", () => {
      expect(parseAttributes(String.raw`msg="hello \"world\""`)).toEqual([
        { attr: "msg", name: "Msg", value: 'hello "world"' },
      ]);
      expect(parseAttributes(String.raw`path="C:\\Window"`)).toEqual([
        { attr: "path", name: "Path", value: "C:\\Window" },
      ]);
    });

    it("simple value without quotes", () => {
      expect(parseAttributes("key1=value1 key2=value2")).toEqual([
        { attr: "key1", name: "Key1", value: "value1" },
        { attr: "key2", name: "Key2", value: "value2" },
      ]);
    });

    it("complex attribute", () => {
      expect(parseAttributes(`a11y=true multi-word=complex-value2`)).toEqual([
        { attr: "a11y", name: "A11y", value: "true" },
        { attr: "multi-word", name: "Multi Word", value: "complex-value2" },
      ]);
    });

    it("value with single quotes", () => {
      expect(
        parseAttributes(
          `key1='value with space' key2='complex-value2' key3='I am "God"!' key4='I am \\'God\\'!'`,
        ),
      ).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "complex-value2" },
        { attr: "key3", name: "Key3", value: 'I am "God"!' },
        { attr: "key4", name: "Key4", value: "I am 'God'!" },
      ]);
    });

    it("value with double quotes", () => {
      expect(
        parseAttributes(`key1="value with space" key2="complex-value2" key3="I am 'God'!"`),
      ).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "complex-value2" },
        { attr: "key3", name: "Key3", value: "I am 'God'!" },
      ]);
    });

    it("value needs encoding", () => {
      expect(
        parseAttributes(`key1="value with &" key2="value with <tag>" key3="value with =equals"`),
      ).toEqual([
        { attr: "key1", name: "Key1", value: "value with &" },
        { attr: "key2", name: "Key2", value: "value with <tag>" },
        { attr: "key3", name: "Key3", value: "value with =equals" },
      ]);

      expect(
        parseAttributes(`key1="value with &" key2="value with <tag\\>" key3="value with =equals"`),
      ).toEqual([
        { attr: "key1", name: "Key1", value: "value with &" },
        { attr: "key2", name: "Key2", value: "value with <tag>" },
        { attr: "key3", name: "Key3", value: "value with =equals" },
      ]);
    });

    it("value with mixed quotes", () => {
      expect(parseAttributes(`key1="value with space" key2=value2`)).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "value2" },
      ]);

      expect(parseAttributes(`key1="value with space" key2="value2"`)).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "value2" },
      ]);

      expect(parseAttributes(`key1="value with space" key2='value'`)).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "value" },
      ]);

      expect(parseAttributes(`key1='value with space' key2="value"`)).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "value" },
      ]);

      expect(parseAttributes(`key1='value with space' key2="value with space"`)).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "value with space" },
      ]);

      expect(parseAttributes(`key1="value with space" key2="value with &"`)).toEqual([
        { attr: "key1", name: "Key1", value: "value with space" },
        { attr: "key2", name: "Key2", value: "value with &" },
      ]);
    });

    it("should parse empty attrs", () => {
      expect(parseAttributes(`key1="" key2=''`)).toEqual([
        { attr: "key1", name: "Key1", value: "" },
        { attr: "key2", name: "Key2", value: "" },
      ]);
    });

    it("should handle edge cases", () => {
      expect(parseAttributes("key=")).toEqual([]); // Trailing = implies invalid or empty? Current logic might stop
      expect(parseAttributes('key="unterminated')).toEqual([
        { attr: "key", name: "Key", value: "unterminated" },
      ]); // Current logic handles EOF
    });

    it("should parse boolean attributes", () => {
      expect(parseAttributes("required")).toEqual([
        { attr: "required", name: "Required", value: true },
      ]);
      expect(parseAttributes("disabled checked")).toEqual([
        { attr: "disabled", name: "Disabled", value: true },
        { attr: "checked", name: "Checked", value: true },
      ]);
    });

    it("should handle empty string", () => {
      expect(parseAttributes("")).toEqual([]);
      expect(parseAttributes("   ")).toEqual([]);
    });

    it("should ignore attributes starting with =", () => {
      expect(parseAttributes("=invalid")).toEqual([]);
    });
  });

  describe("allowedAttributes", () => {
    const allowedAttributes = new Map([
      ["a", { display: "Alpha", index: 2 }],
      ["b", { display: "Beta", index: 1 }],
      ["c", { display: "Gamma", index: 3, boolean: true }],
    ]);

    it("should filter attributes", () => {
      expect(parseAttributes("a=1 b=2 d=4", allowedAttributes)).toEqual([
        { attr: "b", name: "Beta", value: "2" },
        { attr: "a", name: "Alpha", value: "1" },
      ]);
    });

    it("should sort attributes", () => {
      expect(parseAttributes("a=1 b=2", allowedAttributes)).toEqual([
        { attr: "b", name: "Beta", value: "2" },
        { attr: "a", name: "Alpha", value: "1" },
      ]);
    });

    it("should handle boolean attributes", () => {
      expect(parseAttributes("c", allowedAttributes)).toEqual([
        { attr: "c", name: "Gamma", value: true },
      ]);
      expect(parseAttributes("c=anything", allowedAttributes)).toEqual([
        { attr: "c", name: "Gamma", value: true },
      ]);
    });

    it("should handle mixed cases", () => {
      expect(parseAttributes("c=val a=1 unknown=2 b=2", allowedAttributes)).toEqual([
        { attr: "b", name: "Beta", value: "2" },
        { attr: "a", name: "Alpha", value: "1" },
        { attr: "c", name: "Gamma", value: true },
      ]);
    });
  });
});
