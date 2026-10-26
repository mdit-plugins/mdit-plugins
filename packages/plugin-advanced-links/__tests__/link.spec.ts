import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { advancedLinks } from "../src/index.js";

const renderLink = (source: string): string => {
  const md = new MarkdownIt().use(advancedLinks, {
    name: "test",
    renderer: (link): string => `[${link}]`,
  });

  return md.render(source).trim();
};

// Render with the inline syntax enabled / 在开启行内语法的实例上渲染
const renderInline = (source: string): string => {
  const md = new MarkdownIt().use(advancedLinks, {
    name: "test",
    inline: true,
    renderer: (link): string => `[${link}]`,
  });

  return md.render(source).trim();
};

describe("link destination", () => {
  it("should parse plain links", () => {
    expect(renderLink("@[test](a.mp4)")).toBe("[a.mp4]");
    expect(renderLink("@[test](https://example.com/a?b=c#d)")).toBe(
      "[https://example.com/a?b=c#d]",
    );
  });

  it("should parse empty links", () => {
    expect(renderLink("@[test]()")).toBe("[]");
  });

  it("should parse links with balanced parens", () => {
    expect(renderLink("@[test](a(1).mp4)")).toBe("[a(1).mp4]");
    expect(renderLink("@[test](a(b(c)))")).toBe("[a(b(c))]");
  });

  it("should parse escaped characters", () => {
    expect(renderLink(String.raw`@[test](a\)b.mp4)`)).toBe("[a)b.mp4]");
    expect(renderLink(String.raw`@[test](a\(b.mp4)`)).toBe("[a(b.mp4]");
  });

  it("should parse links wrapped in angle brackets", () => {
    expect(renderLink("@[test](<a b.mp4>)")).toBe("[a%20b.mp4]");
    expect(renderLink("@[test](<>)")).toBe("[]");
  });

  it("should normalize the link like a normal Markdown link", () => {
    // entity-decoded control characters are percent-encoded before validation, so they cannot
    // hide a dangerous scheme from `md.validateLink`
    expect(renderLink("@[test](<java&#9;script:alert(1)>)")).toBe("[java%09script:alert(1)]");
    expect(renderLink("@[test](<java&#x09;script:alert(1)>)")).toBe("[java%09script:alert(1)]");
    expect(renderLink("@[test](<java&Tab;script:alert(1)>)")).toBe("[java%09script:alert(1)]");
    expect(renderLink("@[test](<java&#10;script:alert(1)>)")).toBe("[java%0Ascript:alert(1)]");
    expect(renderLink("@[test](<java&#13;script:alert(1)>)")).toBe("[java%0Dscript:alert(1)]");
    expect(renderLink("@[test](<data&#9;:text/html,hello>)")).toBe("[data%09:text/html,hello]");
  });

  it("should validate the link with md.validateLink", () => {
    // unsafe schemes are rejected, like a normal Markdown link, so the raw text is rendered
    expect(renderLink("@[test](javascript:alert(1))")).toBe("<p>@[test](javascript:alert(1))</p>");
    expect(renderLink("@[test](vbscript:msgbox(1))")).toBe("<p>@[test](vbscript:msgbox(1))</p>");
    expect(renderLink("@[test](file:///etc/passwd)")).toBe("<p>@[test](file:///etc/passwd)</p>");
    expect(renderLink("@[test](data:text/html,hello)")).toBe(
      "<p>@[test](data:text/html,hello)</p>",
    );

    // `data:image/*` is allowed by markdown-it
    expect(renderLink("@[test](data:image/png;base64,AAAA)")).toBe("[data:image/png;base64,AAAA]");

    // whitespace in an unbracketed destination is still rejected
    expect(renderLink("@[test](a b.mp4)")).toContain("@");
  });

  it("should honor a custom md.validateLink", () => {
    const md = new MarkdownIt();

    md.validateLink = (url: string): boolean => url.startsWith("app:");
    md.use(advancedLinks, {
      name: "test",
      renderer: (link): string => `[${link}]`,
    });

    expect(md.render("@[test](app://home)").trim()).toBe("[app://home]");
    expect(md.render("@[test](https://example.com)").trim()).toBe(
      "<p>@[test](https://example.com)</p>",
    );

    const inlineMd = new MarkdownIt();

    inlineMd.validateLink = (url: string): boolean => url.startsWith("app:");
    inlineMd.use(advancedLinks, {
      name: "test",
      inline: true,
      renderer: (link): string => `[${link}]`,
    });

    expect(inlineMd.render("Go @[test](app://home) now").trim()).toBe("<p>Go [app://home] now</p>");
  });

  it("should not tolerate whitespaces around the link", () => {
    // a normal link tolerates them, the advanced link does not
    expect(renderLink("@[test]( a.mp4)")).toBe('<p>@<a href="a.mp4">test</a></p>');
    expect(renderLink("@[test](a.mp4 )")).toBe('<p>@<a href="a.mp4">test</a></p>');
    expect(renderLink("@[test](a.mp4\t)")).toBe('<p>@<a href="a.mp4">test</a></p>');
  });

  it("should not support titles", () => {
    expect(renderLink('@[test](a.mp4 "title")')).toBe(
      '<p>@<a href="a.mp4" title="title">test</a></p>',
    );
    expect(renderLink("@[test](a.mp4 'title')")).toBe(
      '<p>@<a href="a.mp4" title="title">test</a></p>',
    );
  });

  it("should unescape the destination", () => {
    // escapes and entities are resolved before the destination is normalized
    expect(renderLink("@[test](a&amp;b)")).toBe("[a&b]");
    expect(renderLink(String.raw`@[test](a\*b)`)).toBe("[a*b]");
  });

  it("should not match invalid syntax", () => {
    const testCases: [source: string, expected: string][] = [
      ["@[test]xxx", "<p>@[test]xxx</p>"],
      ["@[test](a.mp4", "<p>@[test](a.mp4</p>"],
      ["@[test] a.mp4)", "<p>@[test] a.mp4)</p>"],
      ["@[test](<a)", "<p>@[test](&lt;a)</p>"],
      ["@[test](", "<p>@[test](</p>"],
      ["@[test](a b.mp4)", "<p>@[test](a b.mp4)</p>"],
      ["@[test](a.mp4) extra", '<p>@<a href="a.mp4">test</a> extra</p>'],
      // an empty name is rejected
      ["@[ ](a.mp4)", '<p>@<a href="a.mp4"> </a></p>'],
      ["@[](x)", '<p>@<a href="x"></a></p>'],
      ["@[test\nautoplay](a.mp4)", '<p>@<a href="a.mp4">test\nautoplay</a></p>'],
      ["@test](a.mp4)", "<p>@test](a.mp4)</p>"],
      ["@[test(]a.mp4)", "<p>@[test(]a.mp4)</p>"],
    ];

    testCases.forEach(([source, expected]) => {
      expect(renderLink(source)).toBe(expected);
    });
  });

  it("should not match a deeply nested destination", () => {
    // `parseLinkDestination` gives up after 32 levels of parens
    const source = `@[test](a${"(".repeat(33)}${")".repeat(33)})`;

    expect(renderLink(source)).toBe(`<p>${source}</p>`);
  });

  describe("inline", () => {
    it("should stop after the closing paren of the link", () => {
      expect(renderInline("@[test](a)b)")).toBe("<p>[a]b)</p>");
      expect(renderInline("@[test](a)b(c)")).toBe("<p>[a]b(c)</p>");
      expect(renderInline("@[test](a) x")).toBe("<p>[a] x</p>");
    });

    it("should resolve escapes inside angle brackets", () => {
      expect(renderInline(String.raw`@[test](<a\>b.mp4>)`)).toBe("[a%3Eb.mp4]");
      expect(renderInline(String.raw`@[test](<a\\b.mp4>)`)).toBe(String.raw`[a%5Cb.mp4]`);
    });

    it("should reject a destination with whitespaces", () => {
      expect(renderInline("@[test](a\tb.mp4)")).toContain("@");
      expect(renderInline("@[test](a\nb.mp4)")).toContain("@");
      expect(renderInline(String.raw`@[test](a\ b.mp4)`)).toContain("@");
    });

    it("should reject an unterminated destination", () => {
      const sources = [String.raw`@[test](a\)`, "@[test](a(b.mp4)", "@[test](<a)"];

      sources.forEach((source) => {
        expect(renderInline(source)).toContain("@");
      });
    });
  });
});
