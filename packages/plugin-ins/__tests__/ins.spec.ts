import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { ins } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(ins);

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

describe("ins with attrs plugin", () => {
  const createMd = (): MarkdownItType => new MarkdownIt({ linkify: true }).use(attrs).use(ins);

  it("should not leak inline attrs between ins tokens", () => {
    expect(createMd().render("++a++{.x}\n\n++b++")).toBe(
      '<p><ins class="x">a</ins></p>\n<p><ins>b</ins></p>\n',
    );
    expect(createMd().render("++a++{.x} ++b++")).toBe(
      '<p><ins class="x">a</ins> <ins>b</ins></p>\n',
    );
  });

  it("should not accumulate attrs across renders", () => {
    const md = createMd();
    const expected = '<p><ins class="x">a</ins></p>\n<p><ins>b</ins></p>\n';

    expect(md.render("++a++{.x}\n\n++b++")).toBe(expected);
    expect(md.render("++a++{.x}\n\n++b++")).toBe(expected);
    expect(md.render("++c++\n\n++d++")).toBe("<p><ins>c</ins></p>\n<p><ins>d</ins></p>\n");
  });

  it("should put attrs on the correct token when nested", () => {
    expect(createMd().render("++**a**++{.x}\n\n++**b**++")).toBe(
      '<p><ins class="x"><strong>a</strong></ins></p>\n<p><ins><strong>b</strong></ins></p>\n',
    );
  });
});
