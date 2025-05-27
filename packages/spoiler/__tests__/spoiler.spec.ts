import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { spoiler } from "../src/index.js";

describe("spoiler", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(spoiler);

  it("should render", () => {
    expect(markdownIt.render(`!!Mark!!`)).toEqual(
      `<p><span class="spoiler" tabindex="-1">Mark</span></p>\n`,
    );
  });

  it("Can nested", () => {
    const testCases = [
      [
        `x !!!!foo!! bar!!`,
        `<p>x <span class="spoiler" tabindex="-1"><span class="spoiler" tabindex="-1">foo</span> bar</span></p>\n`,
      ],
      [
        `x !!foo !!bar!!!!`,
        `<p>x <span class="spoiler" tabindex="-1">foo <span class="spoiler" tabindex="-1">bar</span></span></p>\n`,
      ],
      [
        `x !!!!foo!!!!`,
        `<p>x <span class="spoiler" tabindex="-1"><span class="spoiler" tabindex="-1">foo</span></span></p>\n`,
      ],
      [
        `!!foo !!bar!! baz!!`,
        `<p><span class="spoiler" tabindex="-1">foo <span class="spoiler" tabindex="-1">bar</span> baz</span></p>\n`,
      ],
      [
        `!!f **o !!o b!! a** r!!`,
        `<p><span class="spoiler" tabindex="-1">f <strong>o <span class="spoiler" tabindex="-1">o b</span> a</strong> r</span></p>\n`,
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should handle multiple '!'", () => {
    expect(markdownIt.render(`x !!!foo!!!`)).toEqual(
      `<p>x !<span class="spoiler" tabindex="-1">foo</span>!</p>\n`,
    );
  });

  it("Have the same priority as emphases", () => {
    expect(markdownIt.render(`**!!test**!!`)).toEqual(
      `<p><strong>!!test</strong>!!</p>\n`,
    );
    expect(markdownIt.render(`!!**test!!**`)).toEqual(
      `<p><span class="spoiler" tabindex="-1">**test</span>**</p>\n`,
    );
  });

  it("Have the same priority as emphases with respect to links", () => {
    expect(markdownIt.render(`[!!link]()!!`)).toEqual(
      `<p><a href="">!!link</a>!!</p>\n`,
    );
    expect(markdownIt.render(`!![link!!]()`)).toEqual(
      `<p>!!<a href="">link!!</a></p>\n`,
    );
  });

  it('should not render with single "!"', () => {
    expect(markdownIt.render(`!text!`)).toEqual(`<p>!text!</p>\n`);
  });

  it("should not render with empty content", () => {
    expect(markdownIt.render(`!!!!`)).toEqual(`<p>!!!!</p>\n`);
    expect(markdownIt.render(`!!!! a`)).toEqual(`<p>!!!! a</p>\n`);
    expect(markdownIt.render(`a !!!!`)).toEqual(`<p>a !!!!</p>\n`);
    expect(markdownIt.render(`a !!!! a`)).toEqual(`<p>a !!!! a</p>\n`);
  });

  it("Have the same priority as emphases with respect to backticks", () => {
    expect(markdownIt.render("!!`code!!`")).toEqual(
      `<p>!!<code>code!!</code></p>\n`,
    );
    expect(markdownIt.render("` !! code`!!")).toEqual(
      `<p><code> !! code</code>!!</p>\n`,
    );
  });

  it("should not render a whitespace or newline between text and '!!'", () => {
    expect(markdownIt.render("foo !! bar !! baz")).toEqual(
      `<p>foo !! bar !! baz</p>\n`,
    );

    expect(
      markdownIt.render(`
!!test
!! a
`),
    ).toEqual(`<p>!!test
!! a</p>\n`);

    expect(
      markdownIt.render(`
!!
test!!
`),
    ).toEqual(`<p>!!
test!!</p>\n`);
  });
});
