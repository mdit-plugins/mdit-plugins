import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { linkInsideHeader } from "../src/permalink/index.js";
import { anchor } from "../src/plugin.js";

const md = (options?: Record<string, unknown>): MarkdownIt =>
  MarkdownIt({ html: true }).use(anchor, options as Parameters<typeof anchor>[1]);

describe("permalink.linkInsideHeader", () => {
  it("should render default", () => {
    expect(md({ permalink: linkInsideHeader() }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1">H1 <a class="header-anchor" href="#h1">#</a></h1>\n',
    );
  });

  it("should render without class", () => {
    expect(md({ permalink: linkInsideHeader({ class: "" }) }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1">H1 <a href="#h1">#</a></h1>\n',
    );
  });

  it("should render without space", () => {
    expect(md({ permalink: linkInsideHeader({ space: false }) }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1">H1<a class="header-anchor" href="#h1">#</a></h1>\n',
    );
  });

  it("should render with HTML symbol and placement before", () => {
    const symbol =
      '<span class="visually-hidden">Jump to heading</span> <span aria-hidden="true">#</span>';

    expect(
      md({ permalink: linkInsideHeader({ symbol, placement: "before" }) }).render("# H1"),
    ).toBe(`<h1 id="h1" tabindex="-1"><a class="header-anchor" href="#h1">${symbol}</a> H1</h1>\n`);
  });

  it("should merge duplicate class attrs", () => {
    expect(
      md({
        permalink: linkInsideHeader({
          renderAttrs: () => ({ class: "should-merge-class", id: "some-id" }),
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1 <a class="header-anchor should-merge-class" href="#h1" id="some-id">#</a></h1>\n',
    );
  });

  it("should support custom renderHref", () => {
    expect(
      md({
        permalink: linkInsideHeader({ renderHref: (slug: string): string => `/x/${slug}` }),
      }).render("# H1"),
    ).toBe('<h1 id="h1" tabindex="-1">H1 <a class="header-anchor" href="/x/h1">#</a></h1>\n');
  });
});
