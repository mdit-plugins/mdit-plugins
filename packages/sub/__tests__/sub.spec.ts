import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { sub } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(sub);

describe(sub, () => {
  it("should render", () => {
    expect(markdownIt.render(`~test~`)).toBe("<p><sub>test</sub></p>\n");
  });

  it("should not render when escape", () => {
    expect(markdownIt.render(String.raw`~foo\~`)).toBe("<p>~foo~</p>\n");
    expect(markdownIt.render(String.raw`\~foo~`)).toBe("<p>~foo~</p>\n");
  });

  it("should not render when having spaces", () => {
    expect(markdownIt.render(`~foo bar~`)).toBe("<p>~foo bar~</p>\n");
  });

  it("should render when spaces are escaped", () => {
    expect(markdownIt.render(String.raw`~foo\ bar\ baz~`)).toBe("<p><sub>foo bar baz</sub></p>\n");
    expect(markdownIt.render(String.raw`~\ foo\ ~`)).toBe("<p><sub> foo </sub></p>\n");
  });

  it(String.raw`should handle multiple '\'`, () => {
    expect(markdownIt.render(String.raw`~foo\\\\\ bar~`)).toBe("<p><sub>foo\\\\ bar</sub></p>\n");
    expect(markdownIt.render(String.raw`~foo\\\\ bar~`)).toBe("<p>~foo\\\\ bar~</p>\n");
  });

  it("should work with other marker", () => {
    expect(markdownIt.render(`**~foo~ bar**`)).toBe("<p><strong><sub>foo</sub> bar</strong></p>\n");

    expect(markdownIt.render(`*~f`)).toBe("<p>*~f</p>\n");
    expect(markdownIt.render(`b*~`)).toBe("<p>b*~</p>\n");
  });
});
