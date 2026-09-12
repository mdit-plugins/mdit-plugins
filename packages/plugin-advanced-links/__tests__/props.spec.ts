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

  it("should support escaping", () => {
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
    expect(renderProps(`@[test a="("](x)`)).toBe('[x] {"a":"("}');
    expect(renderProps(`@[test a="[x](y)"](x)`)).toBe('[x] {"a":"[x](y)"}');
    expect(renderProps(`@[test a="](x)"](y)`)).toBe('[y] {"a":"](x)"}');
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
    const testCases: [source: string, expected: string][] = [
      ["@[test =value](x)", '<p>@<a href="x">test =value</a></p>'],
      ["@[test a=1 = b=2](x)", '<p>@<a href="x">test a=1 = b=2</a></p>'],
      ["@[test =](x)", '<p>@<a href="x">test =</a></p>'],
    ];

    testCases.forEach(([source, expected]) => {
      // the syntax is unmatched, so the text falls back to a normal link
      expect(renderProps(source)).toBe(expected);
    });
  });

  it("should not match multiline props", () => {
    // a line break anywhere in the props rejects the whole syntax
    expect(renderProps("@[test a=1\nb=2](x)")).toBe('<p>@<a href="x">test a=1\nb=2</a></p>');
    expect(renderProps("@[test a\nb=1](x)")).toBe('<p>@<a href="x">test a\nb=1</a></p>');
    expect(renderProps("@[test a=1\rb=2](x)")).toBe('<p>@<a href="x">test a=1\nb=2</a></p>');
    expect(renderProps("@[test a=1\r\nb=2](x)")).toBe('<p>@<a href="x">test a=1\nb=2</a></p>');
  });

  it("should not match line breaks inside quoted values", () => {
    const md = new MarkdownIt().use(advancedLinks, {
      name: "test",
      inline: true,
      renderer: (): string => "MATCHED",
    });

    expect(md.render('@[test a="x\ny"](z)')).not.toContain("MATCHED");
    expect(md.render("@[test a='x](z)")).not.toContain("MATCHED");
  });

  describe("boundaries", () => {
    it("should only open a quoted value right after `=`", () => {
      // a quote elsewhere is a plain character, so a value may contain an unmatched quote
      expect(renderProps("@[test a=it's](x)")).toBe(`[x] {"a":"it's"}`);
      expect(renderProps("@[test don't](x)")).toBe(String.raw`[x] {"don't":true}`);
      expect(renderProps(String.raw`@[test a=it"s](x)`)).toBe(String.raw`[x] {"a":"it\"s"}`);
      expect(renderProps("@[test a=it's b](x)")).toBe(`[x] {"a":"it's","b":true}`);
      // an unquoted value may contain quotes
      expect(renderProps(String.raw`@[test a=b="c](d)`)).toBe(String.raw`[d] {"a":"b=\"c"}`);
      // the early `]` of the unquoted value ends the props, so the syntax is unmatched
      expect(renderProps(String.raw`@[test a=b="c]d"](e)`)).toBe(
        "<p>@[test a=b=&quot;c]d&quot;](e)</p>",
      );
      // a whitespace between `=` and the quote is not part of a quoted value
      expect(renderProps("@[test a= 'x'](y)")).toBe(`[y] {"a":"","'x'":true}`);
    });

    it("should reject an unterminated quoted value", () => {
      expect(renderProps('@[test a="x](y)')).toBe('<p>@<a href="y">test a=&quot;x</a></p>');
    });

    it("should keep entities in props", () => {
      // unlike the link destination, prop values are not unescaped
      expect(renderProps("@[test a=&amp;](x)")).toBe('[x] {"a":"&amp;"}');
    });

    it("should parse consecutive `=` as a value", () => {
      expect(renderProps("@[test a==b](x)")).toBe('[x] {"a":"=b"}');
    });

    it("should allow the `@` character", () => {
      expect(renderProps("@[test a=x@y](x)")).toBe('[x] {"a":"x@y"}');
      expect(renderProps('@[test a="@[b](c)"](x)')).toBe('[x] {"a":"@[b](c)"}');
    });

    it("should reject an unescaped `]`", () => {
      // the `]` closes the syntax early, so the whole thing is unmatched
      expect(renderProps("@[test a=[b]](x)")).toBe('<p>@<a href="x">test a=[b]</a></p>');
      // the syntax is closed early and the rest is not a link either
      expect(renderProps("@[test a=]](x)")).toBe("<p>@[test a=]](x)</p>");
    });

    it("should reject whitespaces around `=`", () => {
      expect(renderProps("@[test a = 1](x)")).not.toContain("[x]");
      expect(renderProps("@[test a= 1](x)")).toBe('[x] {"1":true,"a":""}');
    });

    it("should allow special characters in prop names", () => {
      expect(renderProps("@[test a/b=1](x)")).toBe('[x] {"a/b":"1"}');
      expect(renderProps("@[test a.b=1](x)")).toBe('[x] {"a.b":"1"}');
      expect(renderProps("@[test a:b=1](x)")).toBe('[x] {"a:b":"1"}');
      expect(renderProps("@[test #id=1](x)")).toBe('[x] {"#id":"1"}');
    });

    it("should parse a quoted value before the next prop", () => {
      expect(renderProps('@[test a="x"b](y)')).toBe('[y] {"a":"x","b":true}');
      expect(renderProps('@[test a="x"b=1](y)')).toBe('[y] {"a":"x","b":"1"}');
    });

    it("should allow any character in keys and values", () => {
      // `]` ends the props, so it must be escaped outside a quoted value
      expect(renderProps(String.raw`@[test a=b\]c](x)`)).toBe(`[x] {"a":"b]c"}`);
      expect(renderProps(String.raw`@[test a=x\]](y)`)).toBe(`[y] {"a":"x]"}`);
      expect(renderProps(String.raw`@[test a='b]c'](x)`)).toBe(`[x] {"a":"b]c"}`);
      expect(renderProps(String.raw`@[test a="b]c"](x)`)).toBe(`[x] {"a":"b]c"}`);
      expect(renderProps(String.raw`@[test a\]b](x)`)).toBe(`[x] {"a]b":true}`);
      expect(renderProps(String.raw`@[test a\]b=c](x)`)).toBe(`[x] {"a]b":"c"}`);
    });

    it("should allow escaped whitespaces and `=`", () => {
      expect(renderProps(String.raw`@[test a=b\ c](x)`)).toBe(`[x] {"a":"b c"}`);
      expect(renderProps(String.raw`@[test a\ b](x)`)).toBe(`[x] {"a b":true}`);
      expect(renderProps(String.raw`@[test a\=b](x)`)).toBe(`[x] {"a=b":true}`);
      expect(renderProps(String.raw`@[test a=b\=c](x)`)).toBe(`[x] {"a":"b=c"}`);
    });

    it("should allow escaped quotes", () => {
      expect(renderProps(String.raw`@[test a=it\"s](x)`)).toBe(String.raw`[x] {"a":"it\"s"}`);
      expect(renderProps(String.raw`@[test a=it\'s](x)`)).toBe(`[x] {"a":"it's"}`);
      expect(renderProps(String.raw`@[test a='x\"y'](x)`)).toBe(String.raw`[x] {"a":"x\"y"}`);
    });

    it("should allow an escaped backslash", () => {
      expect(renderProps(String.raw`@[test a=b\\c](x)`)).toBe(String.raw`[x] {"a":"b\\c"}`);
      expect(renderProps(String.raw`@[test a\\b=1](x)`)).toBe(String.raw`[x] {"a\\b":"1"}`);
      expect(renderProps(String.raw`@[test a="b\\c"](x)`)).toBe(String.raw`[x] {"a":"b\\c"}`);
      // the escape also counts right before the closing quote
      expect(renderProps(String.raw`@[test a="b\\"](x)`)).toBe(String.raw`[x] {"a":"b\\"}`);
    });

    it("should allow an escaped quote in a key", () => {
      expect(renderProps(String.raw`@[test a\"b](x)`)).toBe(String.raw`[x] {"a\"b":true}`);
      expect(renderProps(String.raw`@[test a\'b=1](x)`)).toBe(String.raw`[x] {"a'b":"1"}`);
    });

    it("should keep an escaped whitespace in a key", () => {
      // the escaped whitespace does not split the key, the following real one does
      expect(renderProps(String.raw`@[test a\ b c](x)`)).toBe('[x] {"a b":true,"c":true}');
    });

    it("should render escaped props inline", () => {
      // an inline token is created when the syntax does not occupy the whole line
      expect(renderProps(String.raw`a @[test a=b\]c](x) b`)).toBe('<p>a [x] {"a":"b]c"} b</p>');
    });

    it("should reject a dangling escape", () => {
      const testCases: [source: string, expected: string][] = [
        ["@[test a=b\\", String.raw`<p>@[test a=b\</p>`],
        ["@[test a\\", String.raw`<p>@[test a\</p>`],
        ['@[test a="x\\', String.raw`<p>@[test a=&quot;x\</p>`],
        ["@[test a=b\\\nc](x)", '<p>@<a href="x">test a=b<br>\nc</a></p>'],
        ['@[test a="x\\\ny"]', "<p>@[test a=&quot;x<br>\ny&quot;]</p>"],
        ["@[test a=", "<p>@[test a=</p>"],
      ];

      testCases.forEach(([source, expected]) => {
        // the props are not parsed, so the syntax falls back to other rules
        expect(renderProps(source)).toBe(expected);
      });
    });

    it("should resolve escapes in unquoted values and keys", () => {
      expect(renderProps(String.raw`@[test a=x\ny](x)`)).toBe('[x] {"a":"xny"}');
      expect(renderProps(String.raw`@[test a=C:\Users](x)`)).toBe('[x] {"a":"C:Users"}');
    });

    it("should keep non-ASCII characters", () => {
      expect(renderProps('@[test 标题="你好 世界"](x)')).toBe('[x] {"标题":"你好 世界"}');
      expect(renderProps("@[test 标题=你好](x)")).toBe('[x] {"标题":"你好"}');
    });

    it("should not confuse brackets and parens of a value", () => {
      expect(renderProps("@[test a=(1)](x)")).toBe('[x] {"a":"(1)"}');
      expect(renderProps(String.raw`@[test a=x\[\]y](x)`)).toBe('[x] {"a":"x[]y"}');
      expect(renderProps('@[test a="x=y"](x)')).toBe('[x] {"a":"x=y"}');
      expect(renderProps(String.raw`@[test a="x y" b=z\]](w)`)).toBe('[w] {"a":"x y","b":"z]"}');
    });

    it("should keep whitespaces inside quoted values", () => {
      expect(renderProps('@[test a="x  y"](x)')).toBe('[x] {"a":"x  y"}');
      expect(renderProps('@[test a="x\ty"](x)')).toBe(String.raw`[x] {"a":"x\ty"}`);
      expect(renderProps('@[test a=" "](x)')).toBe('[x] {"a":" "}');
      expect(renderProps('@[test a="  " b=1](x)')).toBe('[x] {"a":"  ","b":"1"}');
    });
  });
});
