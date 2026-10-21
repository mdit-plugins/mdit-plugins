import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { sup } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(sup);

describe(sup, () => {
  it("should render", () => {
    expect(markdownIt.render(`^test^`)).toBe("<p><sup>test</sup></p>\n");
  });

  it("should not render when escape", () => {
    expect(markdownIt.render(`^foo\\^`)).toBe("<p>^foo^</p>\n");
    expect(markdownIt.render(`\\^foo^`)).toBe("<p>^foo^</p>\n");
  });

  it("should not render when having spaces", () => {
    expect(markdownIt.render(`2^4 + 3^5`)).toBe("<p>2^4 + 3^5</p>\n");
  });

  it("should render when spaces are escaped", () => {
    expect(markdownIt.render(`^foo\\ bar\\ baz^`)).toBe("<p><sup>foo bar baz</sup></p>\n");
    expect(markdownIt.render(`^\\ foo\\ ^`)).toBe("<p><sup> foo </sup></p>\n");
  });

  it("should render when having other symbols", () => {
    expect(markdownIt.render(`^foo~bar^baz^bar~foo^`)).toBe(
      "<p><sup>foo~bar</sup>baz<sup>bar~foo</sup></p>\n",
    );
  });

  it(String.raw`should handle multiple '\'`, () => {
    expect(markdownIt.render(`^foo\\\\\\\\\\\\\\ bar^`)).toBe("<p><sup>foo\\\\\\ bar</sup></p>\n");
    expect(markdownIt.render(`^foo\\\\\\\\\\\\ bar^`)).toBe("<p>^foo\\\\\\ bar^</p>\n");
  });

  it("should work with other marker", () => {
    expect(markdownIt.render(`**^foo^ bar**`)).toBe("<p><strong><sup>foo</sup> bar</strong></p>\n");

    expect(markdownIt.render(`*^f`)).toBe("<p>*^f</p>\n");

    expect(markdownIt.render(`b*^`)).toBe("<p>b*^</p>\n");
  });
});

describe("sup with attrs plugin", () => {
  const createMd = (): MarkdownItType => new MarkdownIt({ linkify: true }).use(attrs).use(sup);

  it("should not leak inline attrs between sup tokens", () => {
    expect(createMd().render("^a^{.x}\n\n^b^")).toBe(
      '<p><sup class="x">a</sup></p>\n<p><sup>b</sup></p>\n',
    );
    expect(createMd().render("^a^{.x} ^b^")).toBe('<p><sup class="x">a</sup> <sup>b</sup></p>\n');
  });

  it("should not accumulate attrs across renders", () => {
    const md = createMd();
    const expected = '<p><sup class="x">a</sup></p>\n<p><sup>b</sup></p>\n';

    expect(md.render("^a^{.x}\n\n^b^")).toBe(expected);
    expect(md.render("^a^{.x}\n\n^b^")).toBe(expected);
    expect(md.render("^c^\n\n^d^")).toBe("<p><sup>c</sup></p>\n<p><sup>d</sup></p>\n");
  });

  it("should keep attrs independent between adjacent tokens", () => {
    expect(createMd().render("^a^{.x}^b^{.y}")).toBe(
      '<p><sup class="x">a</sup><sup class="y">b</sup></p>\n',
    );
    expect(createMd().render("2^4^^5^{.x}")).toBe('<p>2<sup>4</sup><sup class="x">5</sup></p>\n');
  });
});
