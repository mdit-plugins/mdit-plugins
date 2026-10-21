import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItSpoilerOptions } from "../src/index.js";
import { spoiler } from "../src/index.js";

describe(spoiler, () => {
  const markdownIt = new MarkdownIt({ linkify: true }).use(spoiler);

  it("should render", () => {
    expect(markdownIt.render(`!!Mark!!`)).toBe(
      `<p><span class="spoiler" tabindex="-1">Mark</span></p>\n`,
    );
  });

  it("can nested", () => {
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
      expect(markdownIt.render(input)).toStrictEqual(expected);
    });
  });

  it("should handle multiple '!'", () => {
    expect(markdownIt.render(`x !!!foo!!!`)).toBe(
      `<p>x !<span class="spoiler" tabindex="-1">foo</span>!</p>\n`,
    );
  });

  it("have the same priority as emphases", () => {
    expect(markdownIt.render(`**!!test**!!`)).toBe(`<p><strong>!!test</strong>!!</p>\n`);
    expect(markdownIt.render(`!!**test!!**`)).toBe(
      `<p><span class="spoiler" tabindex="-1">**test</span>**</p>\n`,
    );
  });

  it("have the same priority as emphases with respect to links", () => {
    expect(markdownIt.render(`[!!link]()!!`)).toBe(`<p><a href="">!!link</a>!!</p>\n`);
    expect(markdownIt.render(`!![link!!]()`)).toBe(`<p>!!<a href="">link!!</a></p>\n`);
  });

  it('should not render with single "!"', () => {
    expect(markdownIt.render(`!text!`)).toBe(`<p>!text!</p>\n`);
  });

  it("should not render with empty content", () => {
    expect(markdownIt.render(`!!!!`)).toBe(`<p>!!!!</p>\n`);
    expect(markdownIt.render(`!!!! a`)).toBe(`<p>!!!! a</p>\n`);
    expect(markdownIt.render(`a !!!!`)).toBe(`<p>a !!!!</p>\n`);
    expect(markdownIt.render(`a !!!! a`)).toBe(`<p>a !!!! a</p>\n`);
  });

  it("have the same priority as emphases with respect to backticks", () => {
    expect(markdownIt.render("!!`code!!`")).toBe(`<p>!!<code>code!!</code></p>\n`);
    expect(markdownIt.render("` !! code`!!")).toBe(`<p><code> !! code</code>!!</p>\n`);
  });

  it("should not render a whitespace or newline between text and '!!'", () => {
    expect(markdownIt.render("foo !! bar !! baz")).toBe(`<p>foo !! bar !! baz</p>\n`);

    expect(
      markdownIt.render(`
!!test
!! a
`),
    ).toBe(`<p>!!test
!! a</p>\n`);

    expect(
      markdownIt.render(`
!!
test!!
`),
    ).toBe(`<p>!!
test!!</p>\n`);
  });

  it("should not leak attrs across instances", () => {
    const first = new MarkdownIt({ linkify: true }).use(spoiler);

    first.renderer.rules.spoiler_open = (tokens, index, options, _env, self): string => {
      tokens[index].attrJoin("data-x", "1");

      return self.renderToken(tokens, index, options);
    };
    first.render("!!a!!");

    const second = new MarkdownIt({ linkify: true }).use(spoiler);

    expect(second.render("!!b!!")).toBe('<p><span class="spoiler" tabindex="-1">b</span></p>\n');
  });
});

describe("spoiler with attrs plugin", () => {
  const createMd = (options?: MarkdownItSpoilerOptions): MarkdownItType =>
    new MarkdownIt({ linkify: true }).use(attrs).use(spoiler, options);

  it("should not leak inline attrs between spoilers", () => {
    expect(createMd().render("!!a!!{.x}\n\n!!b!!")).toBe(
      '<p><span class="spoiler x" tabindex="-1">a</span></p>\n' +
        '<p><span class="spoiler" tabindex="-1">b</span></p>\n',
    );
  });

  it("should not accumulate attrs across renders", () => {
    const md = createMd();
    const expected =
      '<p><span class="spoiler x" tabindex="-1">a</span></p>\n' +
      '<p><span class="spoiler" tabindex="-1">b</span></p>\n';

    expect(md.render("!!a!!{.x}\n\n!!b!!")).toBe(expected);
    expect(md.render("!!a!!{.x}\n\n!!b!!")).toBe(expected);
    expect(md.render("!!c!!\n\n!!d!!")).toBe(
      '<p><span class="spoiler" tabindex="-1">c</span></p>\n' +
        '<p><span class="spoiler" tabindex="-1">d</span></p>\n',
    );
  });

  it("should not mutate user provided attrs", () => {
    const userAttrs: [string, string][] = [["class", "spoiler"]];
    const md = createMd({ attrs: userAttrs });

    expect(md.render("!!a!!{.x}")).toBe('<p><span class="spoiler x">a</span></p>\n');
    expect(userAttrs).toStrictEqual([["class", "spoiler"]]);
  });
});
