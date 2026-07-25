import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { sup } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(sup);

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
