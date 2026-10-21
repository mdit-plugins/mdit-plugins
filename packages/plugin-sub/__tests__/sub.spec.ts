import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { sub } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(sub);

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

describe("sub with attrs plugin", () => {
  const createMd = (): MarkdownItType => new MarkdownIt({ linkify: true }).use(attrs).use(sub);

  it("should not leak inline attrs between sub tokens", () => {
    expect(createMd().render("~a~{.x}\n\n~b~")).toBe(
      '<p><sub class="x">a</sub></p>\n<p><sub>b</sub></p>\n',
    );
    expect(createMd().render("~a~{.x} ~b~")).toBe('<p><sub class="x">a</sub> <sub>b</sub></p>\n');
  });

  it("should not accumulate attrs across renders", () => {
    const md = createMd();
    const expected = '<p><sub class="x">a</sub></p>\n<p><sub>b</sub></p>\n';

    expect(md.render("~a~{.x}\n\n~b~")).toBe(expected);
    expect(md.render("~a~{.x}\n\n~b~")).toBe(expected);
    expect(md.render("~c~\n\n~d~")).toBe("<p><sub>c</sub></p>\n<p><sub>d</sub></p>\n");
  });

  it("should keep attrs independent between adjacent tokens", () => {
    expect(createMd().render("~a~{.x}~b~{.y}")).toBe(
      '<p><sub class="x">a</sub><sub class="y">b</sub></p>\n',
    );
  });
});
