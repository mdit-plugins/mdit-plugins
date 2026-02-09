import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { ins } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(ins);

describe(ins, () => {
  it("should render", () => {
    expect(markdownIt.render(`++Insert++`)).toEqual(`<p><ins>Insert</ins></p>\n`);
  });

  it("Can nested", () => {
    const testCases = [
      [`x ++++foo++ bar++`, `<p>x <ins><ins>foo</ins> bar</ins></p>\n`],
      [`x ++foo ++bar++++`, `<p>x <ins>foo <ins>bar</ins></ins></p>\n`],
      [`x ++++foo++++`, `<p>x <ins><ins>foo</ins></ins></p>\n`],
      [`++foo ++bar++ baz++`, `<p><ins>foo <ins>bar</ins> baz</ins></p>\n`],
      [`++f **o ++o b++ a** r++`, `<p><ins>f <strong>o <ins>o b</ins> a</strong> r</ins></p>\n`],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should handle multiple '+'", () => {
    expect(markdownIt.render(`x +++foo+++`)).toEqual(`<p>x +<ins>foo</ins>+</p>\n`);
  });

  it("Have the same priority as emphases", () => {
    expect(markdownIt.render(`**++test**++`)).toEqual(`<p><strong>++test</strong>++</p>\n`);
    expect(markdownIt.render(`++**test++**`)).toEqual(`<p><ins>**test</ins>**</p>\n`);
  });

  it("Have the same priority as emphases with respect to links", () => {
    expect(markdownIt.render(`[++link]()++`)).toEqual(`<p><a href="">++link</a>++</p>\n`);
    expect(markdownIt.render(`++[link++]()`)).toEqual(`<p>++<a href="">link++</a></p>\n`);
  });

  it("Have the same priority as emphases with respect to backticks", () => {
    expect(markdownIt.render("++`code++`")).toEqual(`<p>++<code>code++</code></p>\n`);
    expect(markdownIt.render("` ++ code`++")).toEqual(`<p><code> ++ code</code>++</p>\n`);
  });

  it('should not render with single "+"', () => {
    expect(markdownIt.render(`+Insert+`)).toEqual(`<p>+Insert+</p>\n`);
  });

  it("should not render with empty content", () => {
    expect(markdownIt.render(`++++`)).toEqual(`<p>++++</p>\n`);
    expect(markdownIt.render(`++++ a`)).toEqual(`<p>++++ a</p>\n`);
    expect(markdownIt.render(`a ++++`)).toEqual(`<p>a ++++</p>\n`);
    expect(markdownIt.render(`a ++++ a`)).toEqual(`<p>a ++++ a</p>\n`);
  });

  it("should not render a whitespace or newline between text and '++'", () => {
    expect(markdownIt.render("foo ++ bar ++ baz")).toEqual(`<p>foo ++ bar ++ baz</p>\n`);

    expect(
      markdownIt.render(`
++test
++ a
`),
    ).toEqual(`<p>++test
++ a</p>\n`);

    expect(
      markdownIt.render(`
++
test++
`),
    ).toEqual(`<p>++
test++</p>\n`);
  });
});
