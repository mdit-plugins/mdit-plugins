import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { abbr } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(abbr);

it("should render", () => {
  expect(
    markdownIt.render(`\
*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
The HTML specification
is maintained by the W3C.
`),
  ).toEqual(`\
<p>The <abbr title="Hyper Text Markup Language">HTML</abbr> specification
is maintained by the <abbr title="World Wide Web Consortium">W3C</abbr>.</p>
`);
});

it("should not render without abbr", () => {
  expect(
    markdownIt.render(`\
*[foo]:
foo
`),
  ).toEqual(`\
<p>*[foo]:
foo</p>
`);

  expect(
    markdownIt.render(`\
*[[foo]:
foo
`),
  ).toEqual(`\
<p>*[[foo]:
foo</p>
`);

  expect(
    markdownIt.render(`\
*[\\foo]:
foo
`),
  ).toEqual(`\
<p>*[\\foo]:
foo</p>
`);

  expect(
    markdownIt.render(`\
*[\\foo]
foo
`),
  ).toEqual(`\
<p>*[\\foo]
foo</p>
`);
});

it("intersecting abbreviations", () => {
  expect(
    markdownIt.render(`\
*[Bar Foo]: 123
*[Foo Bar]: 456

Foo Bar Foo

Bar Foo Bar
`),
  ).toEqual(`\
<p><abbr title="456">Foo Bar</abbr> Foo</p>
<p><abbr title="123">Bar Foo</abbr> Bar</p>
`);
});

it("work with nested abbreviations", () => {
  expect(
    markdownIt.render(`\
*[JS]: javascript
*[HTTP]: hyper text blah blah
*[JS HTTP]: is awesome
JS HTTP is a collection of low-level javascript HTTP-related modules
`),
  ).toEqual(`\
<p><abbr title="is awesome">JS HTTP</abbr> is a collection of low-level javascript <abbr title="hyper text blah blah">HTTP</abbr>-related modules</p>
`);
});

it("mixing up abbreviations and references", () => {
  expect(
    markdownIt.render(`\
*[foo]: 123
[bar]: 456
*[baz]: 789
[quux]: 012
and a paragraph continuation

foo [bar] baz [quux]
`),
  ).toEqual(`\
<p>and a paragraph continuation</p>
<p><abbr title="123">foo</abbr> <a href="456">bar</a> <abbr title="789">baz</abbr> <a href="012">quux</a></p>
`);
});

it("should not match the middle of the string", () => {
  expect(
    markdownIt.render(`\
*[foo]: blah
*[bar]: blah
foobar
`),
  ).toEqual(`\
<p>foobar</p>
`);
});

it("prefer earlier abbr definitions", () => {
  expect(
    markdownIt.render(`\
foo

*[foo]: bar
*[foo]: baz
`),
  ).toEqual(`\
<p><abbr title="bar">foo</abbr></p>
`);
});

it("interaction with linkifier", () => {
  expect(
    markdownIt.render(`\
http://example.com/foo/

*[foo]: something
`),
  ).toEqual(`\
<p><a href="http://example.com/foo/">http://example.com/<abbr title="something">foo</abbr>/</a></p>
`);
});

it("punctuation as a part of abbr", () => {
  expect(
    markdownIt.render(`\
"foo" "bar"

*["foo"]: 123
*["bar"]: 456
`),
  ).toEqual(`\
<p><abbr title="123">&quot;foo&quot;</abbr> <abbr title="456">&quot;bar&quot;</abbr></p>
`);
});

it("trailing spaces inside abbreviation", () => {
  expect(
    markdownIt.render(`\
*[ test ]: foo bar

test test test
test  test  test
`),
  ).toEqual(`\
<p>test test test
test <abbr title="foo bar"> test </abbr> test</p>
`);
});

it("abbreviation that consists of only spaces", () => {
  expect(
    markdownIt.render(`\
*[ ]: foo bar

test test test
test  test  test
test   test   test
`),
  ).toEqual(`\
<p>test test test
test  test  test
test <abbr title="foo bar"> </abbr> test <abbr title="foo bar"> </abbr> test</p>
`);
});

it("should not process empty abbreviations", () => {
  expect(
    markdownIt.render(`\
*[]: test

(foo bar)
`),
  ).toEqual(`\
<p>*[]: test</p>
<p>(foo bar)</p>
`);
});
