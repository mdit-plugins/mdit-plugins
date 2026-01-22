import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { mark } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(mark);

it("should render", () => {
  expect(markdownIt.render(`==Mark==`)).toEqual("<p><mark>Mark</mark></p>\n");
});

it("Can nested", () => {
  const testCases = [
    [`x ====foo== bar==`, "<p>x <mark><mark>foo</mark> bar</mark></p>\n"],
    [`x ==foo ==bar====`, "<p>x <mark>foo <mark>bar</mark></mark></p>\n"],
    [`x ====foo====`, "<p>x <mark><mark>foo</mark></mark></p>\n"],
    [`==foo ==bar== baz==`, "<p><mark>foo <mark>bar</mark> baz</mark></p>\n"],
    [`==f **o ==o b== a** r==`, "<p><mark>f <strong>o <mark>o b</mark> a</strong> r</mark></p>\n"],
  ];

  testCases.forEach(([input, expected]) => {
    expect(markdownIt.render(input)).toEqual(expected);
  });
});

it("should handle multiple '='", () => {
  expect(markdownIt.render(`x ===foo===`)).toEqual("<p>x =<mark>foo</mark>=</p>\n");
});

it("Have the same priority as emphases", () => {
  expect(markdownIt.render(`**==test**==`)).toEqual("<p><strong>==test</strong>==</p>\n");
  expect(markdownIt.render(`==**test==**`)).toEqual("<p><mark>**test</mark>**</p>\n");
});

it("Have the same priority as emphases with respect to links", () => {
  expect(markdownIt.render(`[==link]()==`)).toEqual(`<p><a href="">==link</a>==</p>\n`);
  expect(markdownIt.render(`==[link==]()`)).toEqual(`<p>==<a href="">link==</a></p>\n`);
});

it("Have the same priority as emphases with respect to backticks", () => {
  expect(markdownIt.render("==`code==`")).toEqual(`<p>==<code>code==</code></p>\n`);
  expect(markdownIt.render("` == code`==")).toEqual(`<p><code> == code</code>==</p>\n`);
});

it('should not render with single "="', () => {
  expect(markdownIt.render(`=mark=`)).toEqual(`<p>=mark=</p>\n`);
});

it("should not render with empty content", () => {
  expect(markdownIt.render(`====`)).toEqual(`<p>====</p>\n`);
  expect(markdownIt.render(`==== a`)).toEqual(`<p>==== a</p>\n`);
  expect(markdownIt.render(`a ====`)).toEqual(`<p>a ====</p>\n`);
  expect(markdownIt.render(`a ==== a`)).toEqual(`<p>a ==== a</p>\n`);
});

it("should not render a whitespace or newline between text and '=='", () => {
  expect(markdownIt.render("foo == bar == baz")).toEqual(`<p>foo == bar == baz</p>\n`);

  expect(
    markdownIt.render(`
==test
== a
`),
  ).toEqual(`<p>==test
== a</p>\n`);

  expect(
    markdownIt.render(`
==
test==
`),
  ).toEqual(`<p>==
test==</p>\n`);

  expect(
    markdownIt.render(`
==
test
==
`),
  ).toEqual(`<h1>==
test</h1>\n`);
});
