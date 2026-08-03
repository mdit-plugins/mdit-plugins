import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { headerLink } from "../src/permalink/index.js";
import { anchor } from "../src/plugin.js";

const md = (options?: Record<string, unknown>): MarkdownIt =>
  MarkdownIt({ html: true }).use(anchor, options as Parameters<typeof anchor>[1]);

describe("permalink.headerLink", () => {
  it("should render default", () => {
    expect(md({ permalink: headerLink() }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1"><a class="header-anchor" href="#h1">H1</a></h1>\n',
    );
  });

  it("should render with Safari reader fix", () => {
    expect(md({ permalink: headerLink({ safariReaderFix: true }) }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1"><a class="header-anchor" href="#h1"><span>H1</span></a></h1>\n',
    );
  });

  it("should render without class", () => {
    expect(md({ permalink: headerLink({ class: "" }) }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1"><a href="#h1">H1</a></h1>\n',
    );
  });

  it("should support custom renderHref and renderAttrs", () => {
    expect(
      md({
        permalink: headerLink({
          renderHref: (slug): string => `/custom/${slug}`,
          renderAttrs: (): Record<string, string> => ({ target: "_blank" }),
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1"><a class="header-anchor" href="/custom/h1" target="_blank">H1</a></h1>\n',
    );
  });

  it("should not nest anchor when heading contains a link", () => {
    expect(md({ permalink: headerLink() }).render("# [link](https://example.com)")).toBe(
      '<h1 id="link" tabindex="-1"><a href="https://example.com">link</a></h1>\n',
    );
  });

  it("should not nest anchor when heading contains a link with text", () => {
    expect(
      md({ permalink: headerLink() }).render("# Text with [link](https://example.com) inside"),
    ).toBe(
      '<h1 id="text-with-link-inside" tabindex="-1">Text with <a href="https://example.com">link</a> inside</h1>\n',
    );
  });

  it("should not nest anchor when heading contains multiple links", () => {
    expect(
      md({ permalink: headerLink() }).render(
        "# A [one](https://example.com/1) and [two](https://example.com/2)",
      ),
    ).toBe(
      '<h1 id="a-one-and-two" tabindex="-1">A <a href="https://example.com/1">one</a> and <a href="https://example.com/2">two</a></h1>\n',
    );
  });

  it("should not nest anchor when heading contains a raw html anchor", () => {
    expect(md({ permalink: headerLink() }).render('# <a href="https://example.com">raw</a>')).toBe(
      '<h1 id="raw" tabindex="-1"><a href="https://example.com">raw</a></h1>\n',
    );
  });

  it("should not nest anchor when heading contains an uppercase raw html anchor", () => {
    expect(md({ permalink: headerLink() }).render('# <A href="https://example.com">raw</A>')).toBe(
      '<h1 id="raw" tabindex="-1"><A href="https://example.com">raw</A></h1>\n',
    );
  });

  it("should not nest anchor when heading contains a raw html anchor with a tab", () => {
    expect(md({ permalink: headerLink() }).render('# <a\thref="https://example.com">raw</a>')).toBe(
      '<h1 id="raw" tabindex="-1"><a\thref="https://example.com">raw</a></h1>\n',
    );
  });
});

describe("headerLink level preservation", () => {
  it("should preserve inline token level with safariReaderFix", () => {
    const mdInstance = MarkdownIt({ html: true }).use(anchor, {
      level: [1, 2, 3, 4, 5, 6],
      permalink: headerLink({ class: "header-anchor", safariReaderFix: true }),
    });

    const tokens = mdInstance.parse("## Top Heading", {});

    expect(tokens[0].type).toBe("heading_open");
    expect(tokens[1].type).toBe("inline");
    expect(tokens[1].level).toBe(1);
  });

  it("should preserve inline token level without safariReaderFix", () => {
    const mdInstance = MarkdownIt({ html: true }).use(anchor, {
      level: [1, 2, 3, 4, 5, 6],
      permalink: headerLink({ class: "header-anchor" }),
    });

    const tokens = mdInstance.parse("##### H5", {});

    expect(tokens[0].type).toBe("heading_open");
    expect(tokens[1].type).toBe("inline");
    expect(tokens[1].level).toBe(1);
  });
});
