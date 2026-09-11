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
    expect(renderLink("@[test](<a b.mp4>)")).toBe("[a b.mp4]");
    expect(renderLink("@[test](<>)")).toBe("[]");
  });

  it("should pass the link as-is", () => {
    // the link is neither normalized nor validated, the renderer is responsible for it
    expect(renderLink("@[test](<a b.mp4>)")).toBe("[a b.mp4]");
    expect(renderLink("@[test](javascript:alert(1))")).toBe("[javascript:alert(1)]");
  });

  it("should not tolerate whitespaces around the link", () => {
    expect(renderLink("@[test]( a.mp4)")).toContain("@");
    expect(renderLink("@[test](a.mp4 )")).toContain("@");
  });

  it("should not support titles", () => {
    expect(renderLink('@[test](a.mp4 "title")')).not.toBe("[a.mp4]");
    expect(renderLink('@[test](a.mp4 "title")')).toContain("@");
  });

  it("should not match invalid syntax", () => {
    const invalidSources = [
      "@[test]xxx",
      "@[test](a.mp4",
      "@[test] a.mp4)",
      "@[test](<a)",
      "@[test](",
      "@[test](a b.mp4)",
      "@[test](a.mp4) extra",
      "@[ ](a.mp4)",
      "@[test\nautoplay](a.mp4)",
      "@test](a.mp4)",
      "@[test(]a.mp4)",
    ];

    invalidSources.forEach((source) => {
      expect(renderLink(source)).not.toBe("");
      expect(renderLink(source)).toContain("@");
    });
  });
});
