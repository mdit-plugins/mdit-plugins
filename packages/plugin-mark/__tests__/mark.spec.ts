import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { mark } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(mark);

describe(mark, () => {
  it("should render", () => {
    expect(markdownIt.render(`==Mark==`)).toBe("<p><mark>Mark</mark></p>\n");
  });

  it("can nested", () => {
    const testCases = [
      [`x ====foo== bar==`, "<p>x <mark><mark>foo</mark> bar</mark></p>\n"],
      [`x ==foo ==bar====`, "<p>x <mark>foo <mark>bar</mark></mark></p>\n"],
      [`x ====foo====`, "<p>x <mark><mark>foo</mark></mark></p>\n"],
      [`==foo ==bar== baz==`, "<p><mark>foo <mark>bar</mark> baz</mark></p>\n"],
      [
        `==f **o ==o b== a** r==`,
        "<p><mark>f <strong>o <mark>o b</mark> a</strong> r</mark></p>\n",
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toStrictEqual(expected);
    });
  });

  it("should handle multiple '='", () => {
    expect(markdownIt.render(`x ===foo===`)).toBe("<p>x =<mark>foo</mark>=</p>\n");
  });

  it("have the same priority as emphases", () => {
    expect(markdownIt.render(`**==test**==`)).toBe("<p><strong>==test</strong>==</p>\n");
    expect(markdownIt.render(`==**test==**`)).toBe("<p><mark>**test</mark>**</p>\n");
  });

  it("have the same priority as emphases with respect to links", () => {
    expect(markdownIt.render(`[==link]()==`)).toBe(`<p><a href="">==link</a>==</p>\n`);
    expect(markdownIt.render(`==[link==]()`)).toBe(`<p>==<a href="">link==</a></p>\n`);
  });

  it("have the same priority as emphases with respect to backticks", () => {
    expect(markdownIt.render("==`code==`")).toBe(`<p>==<code>code==</code></p>\n`);
    expect(markdownIt.render("` == code`==")).toBe(`<p><code> == code</code>==</p>\n`);
  });

  it('should not render with single "="', () => {
    expect(markdownIt.render(`=mark=`)).toBe(`<p>=mark=</p>\n`);
  });

  it("should not render with empty content", () => {
    expect(markdownIt.render(`====`)).toBe(`<p>====</p>\n`);
    expect(markdownIt.render(`==== a`)).toBe(`<p>==== a</p>\n`);
    expect(markdownIt.render(`a ====`)).toBe(`<p>a ====</p>\n`);
    expect(markdownIt.render(`a ==== a`)).toBe(`<p>a ==== a</p>\n`);
  });

  it("should not render a whitespace or newline between text and '=='", () => {
    expect(markdownIt.render("foo == bar == baz")).toBe(`<p>foo == bar == baz</p>\n`);

    expect(
      markdownIt.render(`
==test
== a
`),
    ).toBe(`<p>==test
== a</p>\n`);

    expect(
      markdownIt.render(`
==
test==
`),
    ).toBe(`<p>==
test==</p>\n`);

    expect(
      markdownIt.render(`
==
test
==
`),
    ).toBe(`<h1>==
test</h1>\n`);
  });
});
