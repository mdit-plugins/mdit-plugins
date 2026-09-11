import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { advancedLinks } from "../src/index.js";

const renderProps = (source: string): string => {
  const md = new MarkdownIt().use(advancedLinks, {
    name: "test",
    inline: true,
    renderer: (link, props): string => `[${link}] ${JSON.stringify(props)}`,
  });

  return md.render(source).trim();
};

describe("props", () => {
  it("should parse bare keys as true", () => {
    expect(renderProps("@[test autoplay](x)")).toBe('[x] {"autoplay":true}');
  });

  it("should parse unquoted values", () => {
    expect(renderProps("@[test a=1](x)")).toBe('[x] {"a":"1"}');
    expect(renderProps("@[test a=b=c](x)")).toBe('[x] {"a":"b=c"}');
  });

  it("should parse quoted values", () => {
    expect(renderProps(`@[test a="x y"](x)`)).toBe('[x] {"a":"x y"}');
    expect(renderProps("@[test a='x y'](x)")).toBe('[x] {"a":"x y"}');
  });

  it("should parse empty values", () => {
    expect(renderProps(`@[test a=""](x)`)).toBe('[x] {"a":""}');
    expect(renderProps("@[test a=''](x)")).toBe('[x] {"a":""}');
    expect(renderProps("@[test a=](x)")).toBe('[x] {"a":""}');
  });

  it("should parse empty props", () => {
    expect(renderProps("@[test](x)")).toBe("[x] {}");
    expect(renderProps("@[test ](x)")).toBe("[x] {}");
  });

  it("should ignore trailing whitespaces", () => {
    expect(renderProps("@[test a=1 ](x)")).toBe('[x] {"a":"1"}');
    expect(renderProps("@[test a=1\t](x)")).toBe('[x] {"a":"1"}');
    expect(renderProps("@[test a='1' ](x)")).toBe('[x] {"a":"1"}');
  });

  it("should keep prop names as-is", () => {
    expect(renderProps("@[test data-id=1](x)")).toBe('[x] {"data-id":"1"}');
    expect(renderProps("@[test camelCase](x)")).toBe('[x] {"camelCase":true}');
    expect(renderProps(`@[test a="true"](x)`)).toBe('[x] {"a":"true"}');
  });

  it("should parse multiple props separated by whitespace", () => {
    expect(renderProps("@[test a=1 b c='2 3'](x)")).toBe('[x] {"a":"1","b":true,"c":"2 3"}');
    expect(renderProps("@[test\ta=1\tb](x)")).toBe('[x] {"a":"1","b":true}');
    expect(renderProps("@[test   a=1   b](x)")).toBe('[x] {"a":"1","b":true}');
  });

  it("should support escaping inside quoted values", () => {
    expect(renderProps(String.raw`@[test a="x\"y"](x)`)).toBe(String.raw`[x] {"a":"x\"y"}`);
    expect(renderProps(String.raw`@[test a='x\'y'](x)`)).toBe(`[x] {"a":"x'y"}`);
    expect(renderProps(String.raw`@[test a="x\\y"](x)`)).toBe(String.raw`[x] {"a":"x\\y"}`);
  });

  it("should allow the quote character inside the other quote", () => {
    expect(renderProps(String.raw`@[test a="it's"](x)`)).toBe(`[x] {"a":"it's"}`);
    expect(renderProps(String.raw`@[test a='say "hi"'](x)`)).toBe(
      String.raw`[x] {"a":"say \"hi\""}`,
    );
  });

  it("should allow brackets and parens inside quoted values", () => {
    expect(renderProps(`@[test a="]"](x)`)).toBe('[x] {"a":"]"}');
    expect(renderProps(`@[test a="[x](y)"](x)`)).toBe('[x] {"a":"[x](y)"}');
  });

  it("should keep the last value for duplicated keys", () => {
    expect(renderProps("@[test a=1 a=2](x)")).toBe('[x] {"a":"2"}');
    expect(renderProps("@[test a=1 ab=2](x)")).toBe('[x] {"a":"1","ab":"2"}');
  });

  it("should ignore the prototype-related props", () => {
    // `__proto__` is silently ignored by the `Object.prototype` setter
    expect(renderProps("@[test __proto__](x)")).toBe("[x] {}");
    expect(renderProps("@[test __proto__=x](x)")).toBe("[x] {}");
    expect(renderProps("@[test constructor=1](x)")).toBe('[x] {"constructor":"1"}');
  });

  it("should not treat quotes as key syntax", () => {
    expect(renderProps("@[test 'a' b](x)")).toBe(String.raw`[x] {"'a'":true,"b":true}`);
  });

  it("should reject malformed props", () => {
    const sources = ["@[test =value](x)", "@[test a=1 = b=2](x)", "@[test =](x)"];

    sources.forEach((source) => {
      // the syntax is unmatched, so the text falls back to a normal link
      expect(renderProps(source)).not.toContain("[x]");
      expect(renderProps(source)).toContain("<a href=");
    });
  });

  it("should not match multiline props", () => {
    expect(renderProps("@[test a=1\nb=2](x)")).not.toContain('"a"');
  });

  it("should not match line breaks inside quoted values", () => {
    const md = new MarkdownIt().use(advancedLinks, {
      name: "test",
      inline: true,
      renderer: (): string => "MATCHED",
    });

    expect(md.render('@[test a="x\ny"](z)')).not.toContain("MATCHED");
  });
});
