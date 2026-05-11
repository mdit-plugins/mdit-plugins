import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { ins } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(ins);

describe(ins, () => {
  it("should render", () => {
    expect(markdownIt.render(`++Insert++`)).toBe(`<p><ins>Insert</ins></p>\n`);
  });

  it("can nested", () => {
    const testCases = [
      [`x ++++foo++ bar++`, `<p>x <ins><ins>foo</ins> bar</ins></p>\n`],
      [`x ++foo ++bar++++`, `<p>x <ins>foo <ins>bar</ins></ins></p>\n`],
      [`x ++++foo++++`, `<p>x <ins><ins>foo</ins></ins></p>\n`],
      [`++foo ++bar++ baz++`, `<p><ins>foo <ins>bar</ins> baz</ins></p>\n`],
      [`++f **o ++o b++ a** r++`, `<p><ins>f <strong>o <ins>o b</ins> a</strong> r</ins></p>\n`],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toStrictEqual(expected);
    });
  });

  it("should handle multiple '+'", () => {
    expect(markdownIt.render(`x +++foo+++`)).toBe(`<p>x +<ins>foo</ins>+</p>\n`);
  });

  it("have the same priority as emphases", () => {
    expect(markdownIt.render(`**++test**++`)).toBe(`<p><strong>++test</strong>++</p>\n`);
    expect(markdownIt.render(`++**test++**`)).toBe(`<p><ins>**test</ins>**</p>\n`);
  });

  it("have the same priority as emphases with respect to links", () => {
    expect(markdownIt.render(`[++link]()++`)).toBe(`<p><a href="">++link</a>++</p>\n`);
    expect(markdownIt.render(`++[link++]()`)).toBe(`<p>++<a href="">link++</a></p>\n`);
  });

  it("have the same priority as emphases with respect to backticks", () => {
    expect(markdownIt.render("++`code++`")).toBe(`<p>++<code>code++</code></p>\n`);
    expect(markdownIt.render("` ++ code`++")).toBe(`<p><code> ++ code</code>++</p>\n`);
  });

  it('should not render with single "+"', () => {
    expect(markdownIt.render(`+Insert+`)).toBe(`<p>+Insert+</p>\n`);
  });

  it("should not render with empty content", () => {
    expect(markdownIt.render(`++++`)).toBe(`<p>++++</p>\n`);
    expect(markdownIt.render(`++++ a`)).toBe(`<p>++++ a</p>\n`);
    expect(markdownIt.render(`a ++++`)).toBe(`<p>a ++++</p>\n`);
    expect(markdownIt.render(`a ++++ a`)).toBe(`<p>a ++++ a</p>\n`);
  });

  it("should not render a whitespace or newline between text and '++'", () => {
    expect(markdownIt.render("foo ++ bar ++ baz")).toBe(`<p>foo ++ bar ++ baz</p>\n`);

    expect(
      markdownIt.render(`
++test
++ a
`),
    ).toBe(`<p>++test
++ a</p>\n`);

    expect(
      markdownIt.render(`
++
test++
`),
    ).toBe(`<p>++
test++</p>\n`);
  });
});
