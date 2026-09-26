import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";
import type { FieldAttrDetail, FieldAttrItem } from "../src/options.js";
import { parseAttributes } from "../src/utils.js";

const md = new MarkdownIt();

const parse = (content: string): FieldAttrDetail[] => parseAttributes(content);

const getMeta = (content: string): { attributes: FieldAttrItem[]; details: FieldAttrDetail[] } => {
  const tokens = new MarkdownIt().use(field).parse(`::: fields\n${content}\n:::\n`, {});
  const token = tokens.find((item) => item.type === "fields_field_open");

  return token?.meta as { attributes: FieldAttrItem[]; details: FieldAttrDetail[] };
};

describe("markdown escape alignment", () => {
  it("should keep backslashes before non-punctuation characters", () => {
    expect(parse(String.raw`pattern="^\d+\w*$"`)).toStrictEqual([
      { attr: "pattern", name: "Pattern", value: String.raw`^\d+\w*$`, quote: "double" },
    ]);
    expect(parse(String.raw`path="C:\new\table"`)).toStrictEqual([
      { attr: "path", name: "Path", value: String.raw`C:\new\table`, quote: "double" },
    ]);
  });

  it("should remove backslashes before punctuation characters", () => {
    expect(parse(String.raw`msg="hello \"world\""`)).toStrictEqual([
      { attr: "msg", name: "Msg", value: 'hello "world"', quote: "double" },
    ]);
    expect(parse(String.raw`path="C:\\Window"`)).toStrictEqual([
      { attr: "path", name: "Path", value: String.raw`C:\Window`, quote: "double" },
    ]);
    expect(parse(String.raw`tag="<tag\>"`)).toStrictEqual([
      { attr: "tag", name: "Tag", value: "<tag>", quote: "double" },
    ]);
    expect(parse(String.raw`key='I am \'God\'!'`)).toStrictEqual([
      { attr: "key", name: "Key", value: "I am 'God'!", quote: "single" },
    ]);
  });

  it("should keep a trailing backslash", () => {
    expect(parse('key="val\\')).toStrictEqual([
      { attr: "key", name: "Key", value: "val\\", quote: "double" },
    ]);
    expect(parse(String.raw`key="val\\"`)).toStrictEqual([
      { attr: "key", name: "Key", value: "val\\", quote: "double" },
    ]);
  });

  it("should keep escapes aligned with markdown-it", () => {
    const cases = [
      String.raw`hello \"world\"`,
      String.raw`C:\\Window`,
      String.raw`C:\new\table`,
      String.raw`^\d+\w*$`,
      String.raw`\a\b\c`,
      String.raw`\*\#\.`,
      String.raw`\\\d`,
      String.raw`\ `,
    ];

    expect(cases.map((value) => parse(`key="${value}"`)[0].value)).toStrictEqual(
      cases.map((value) => md.utils.unescapeMd(value)),
    );
  });

  it("should keep escapes aligned inside single quotes", () => {
    expect(parse(String.raw`key='^\d+$'`)).toStrictEqual([
      { attr: "key", name: "Key", value: String.raw`^\d+$`, quote: "single" },
    ]);
  });

  it("should treat exactly the ASCII punctuation characters as escapable", () => {
    // the 32 ASCII punctuation characters, plus a letter, a digit, a space and a CJK character
    const chars = [
      "!",
      '"',
      "#",
      "$",
      "%",
      "&",
      "'",
      "(",
      ")",
      "*",
      "+",
      ",",
      "-",
      ".",
      "/",
      ":",
      ";",
      "<",
      "=",
      ">",
      "?",
      "@",
      "[",
      "\\",
      "]",
      "^",
      "_",
      "`",
      "{",
      "|",
      "}",
      "~",
      "d",
      "5",
      " ",
      "中",
    ];

    expect(chars.map((char) => parse(`key="a\\${char}b"`)[0].value)).toStrictEqual(
      chars.map((char) => md.utils.unescapeMd(`a\\${char}b`)),
    );
  });
});

describe("backtick values", () => {
  it("should parse a backtick value", () => {
    expect(parse("key=`['a', 'b']`")).toStrictEqual([
      { attr: "key", name: "Key", value: "['a', 'b']", quote: "backtick" },
    ]);
  });

  it("should allow spaces inside a backtick value", () => {
    expect(parse("key=`value with space`")).toStrictEqual([
      { attr: "key", name: "Key", value: "value with space", quote: "backtick" },
    ]);
  });

  it("should unescape backticks and backslashes", () => {
    expect(parse("key=`a\\`b`")).toStrictEqual([
      { attr: "key", name: "Key", value: "a`b", quote: "backtick" },
    ]);
    expect(parse("key=`a\\\\`")).toStrictEqual([
      { attr: "key", name: "Key", value: "a\\", quote: "backtick" },
    ]);
  });

  it("should keep other backslashes", () => {
    expect(parse("key=`^\\d+$`")).toStrictEqual([
      { attr: "key", name: "Key", value: String.raw`^\d+$`, quote: "backtick" },
    ]);
    // a backtick value is literal, so punctuation escapes are kept as well
    expect(parse("key=`^\\d+\\.\\d+$`")).toStrictEqual([
      { attr: "key", name: "Key", value: String.raw`^\d+\.\d+$`, quote: "backtick" },
    ]);
    expect(parse("key=`a\\*b`")).toStrictEqual([
      { attr: "key", name: "Key", value: String.raw`a\*b`, quote: "backtick" },
    ]);
    expect(parse("key=`\\<div\\>`")).toStrictEqual([
      { attr: "key", name: "Key", value: String.raw`\<div\>`, quote: "backtick" },
    ]);
  });

  it("should behave like other quoted values", () => {
    // a closing quote ends the value, so a following token becomes a new attribute
    expect(parse("key=`a`b")).toStrictEqual([
      { attr: "key", name: "Key", value: "a", quote: "backtick" },
      { attr: "b", name: "B", value: true, quote: "none" },
    ]);
    expect(parse(`key="a"b`)).toStrictEqual([
      { attr: "key", name: "Key", value: "a", quote: "double" },
      { attr: "b", name: "B", value: true, quote: "none" },
    ]);
    expect(parse("key=`a`next=1")).toStrictEqual([
      { attr: "key", name: "Key", value: "a", quote: "backtick" },
      { attr: "next", name: "Next", value: "1", quote: "none" },
    ]);
  });

  it("should support an empty value", () => {
    expect(parse("key=``")).toStrictEqual([
      { attr: "key", name: "Key", value: "", quote: "backtick" },
    ]);
  });

  it("should fall back to an unquoted value when not closed", () => {
    expect(parse("key=`value")).toStrictEqual([
      { attr: "key", name: "Key", value: "`value", quote: "none" },
    ]);
    expect(parse("key=`value other")).toStrictEqual([
      { attr: "key", name: "Key", value: "`value", quote: "none" },
      { attr: "other", name: "Other", value: true, quote: "none" },
    ]);
  });

  it("should continue parsing following attributes", () => {
    expect(parse("key=`a b` next=1")).toStrictEqual([
      { attr: "key", name: "Key", value: "a b", quote: "backtick" },
      { attr: "next", name: "Next", value: "1", quote: "none" },
    ]);
  });
});

describe("quote metadata", () => {
  it("should report the quote used in source", () => {
    expect(parse(`a="1" b='2' c=3 d`)).toStrictEqual([
      { attr: "a", name: "A", value: "1", quote: "double" },
      { attr: "b", name: "B", value: "2", quote: "single" },
      { attr: "c", name: "C", value: "3", quote: "none" },
      { attr: "d", name: "D", value: true, quote: "none" },
    ]);
  });

  it("should report an empty quoted value", () => {
    expect(parse("a=\"\" b='' c=``")).toStrictEqual([
      { attr: "a", name: "A", value: "", quote: "double" },
      { attr: "b", name: "B", value: "", quote: "single" },
      { attr: "c", name: "C", value: "", quote: "backtick" },
    ]);
  });

  it("should keep the source quote of a boolean attribute", () => {
    const allowedAttributes = new Map([["c", { display: "Gamma", index: 0, boolean: true }]]);

    expect(parseAttributes(`c="anything"`, allowedAttributes)).toStrictEqual([
      { attr: "c", name: "Gamma", value: true, quote: "double" },
    ]);
    expect(parseAttributes("c", allowedAttributes)).toStrictEqual([
      { attr: "c", name: "Gamma", value: true, quote: "none" },
    ]);
  });

  it("should keep the source quote after filtering and sorting", () => {
    const allowedAttributes = new Map([
      ["b", { display: "Beta", index: 1 }],
      ["a", { display: "Alpha", index: 2 }],
    ]);

    expect(parseAttributes("a=1 b=`x y` c=3", allowedAttributes)).toStrictEqual([
      { attr: "b", name: "Beta", value: "x y", quote: "backtick" },
      { attr: "a", name: "Alpha", value: "1", quote: "none" },
    ]);
  });
});

describe("field meta", () => {
  it("should expose details as a superset of attributes", () => {
    const { attributes, details } = getMeta(`@prop@ type="string" default=\`['a', 'b']\` required`);

    expect(details).toStrictEqual([
      { attr: "type", name: "Type", value: "string", quote: "double" },
      { attr: "default", name: "Default", value: "['a', 'b']", quote: "backtick" },
      { attr: "required", name: "Required", value: true, quote: "none" },
    ]);
    expect(attributes).toStrictEqual(
      details.map(({ attr, name, value }) => ({ attr, name, value })),
    );
    expect(Object.keys(attributes[0])).toStrictEqual(["attr", "name", "value"]);
  });

  it("should not expose attributes when parsing is disabled", () => {
    const tokens = new MarkdownIt()
      .use(field, { parseAttributes: false })
      .parse(`::: fields\n@prop@ type="string"\n:::\n`, {});
    const meta = tokens.find((item) => item.type === "fields_field_open")?.meta as {
      attributes: FieldAttrItem[];
      details: FieldAttrDetail[];
    };

    expect(meta.attributes).toStrictEqual([]);
    expect(meta.details).toStrictEqual([]);
  });

  it("should render a backtick value as a literal", () => {
    const result = new MarkdownIt()
      .use(field)
      .render(`::: fields\n@prop@ default=\`['a', 'b']\`\n:::\n`);

    expect(result).toContain("Default: [&#39;a&#39;, &#39;b&#39;]");
  });
});
