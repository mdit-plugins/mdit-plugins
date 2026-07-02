import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { linkAfterHeader } from "../src/permalink/index.js";
import { anchor } from "../src/plugin.js";

const md = (options?: Record<string, unknown>): MarkdownIt =>
  MarkdownIt({ html: true }).use(anchor, options as Parameters<typeof anchor>[1]);

const opts = {
  symbol: '<i class="icon"></i>',
  style: "visually-hidden" as const,
  assistiveText: (title: string): string => `Permalink to \u201C${title}\u201D`,
  visuallyHiddenClass: "visually-hidden",
};

describe("permalink.linkAfterHeader", () => {
  it("should render default", () => {
    expect(md({ permalink: linkAfterHeader(opts) }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1"><span class="visually-hidden">Permalink to \u201CH1\u201D</span> <span aria-hidden="true"><i class="icon"></i></span></a>',
    );
  });

  it("should render without symbol", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          style: "visually-hidden",
          assistiveText: (title: string): string => `Permalink to \u201C${title}\u201D`,
          visuallyHiddenClass: "visually-hidden",
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1"><span class="visually-hidden">Permalink to \u201CH1\u201D</span> <span aria-hidden="true">#</span></a>',
    );
  });

  it("should render multiple headers", () => {
    const multiOpts = {
      style: "visually-hidden" as const,
      assistiveText: (title: string): string => `Permalink to \u201C${title}\u201D`,
      visuallyHiddenClass: "visually-hidden",
    };

    expect(
      md({ permalink: linkAfterHeader(multiOpts) }).render(
        "# H1\n\n## H2\n\n### H3\n\n#### H4\n\n## H2-2",
      ),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1"><span class="visually-hidden">Permalink to \u201CH1\u201D</span> <span aria-hidden="true">#</span></a>' +
        '<h2 id="h2" tabindex="-1">H2</h2>\n<a class="header-anchor" href="#h2"><span class="visually-hidden">Permalink to \u201CH2\u201D</span> <span aria-hidden="true">#</span></a>' +
        '<h3 id="h3" tabindex="-1">H3</h3>\n<a class="header-anchor" href="#h3"><span class="visually-hidden">Permalink to \u201CH3\u201D</span> <span aria-hidden="true">#</span></a>' +
        '<h4 id="h4" tabindex="-1">H4</h4>\n<a class="header-anchor" href="#h4"><span class="visually-hidden">Permalink to \u201CH4\u201D</span> <span aria-hidden="true">#</span></a>' +
        '<h2 id="h2-2" tabindex="-1">H2-2</h2>\n<a class="header-anchor" href="#h2-2"><span class="visually-hidden">Permalink to \u201CH2-2\u201D</span> <span aria-hidden="true">#</span></a>',
    );
  });

  it("should render without explicit style and class", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          assistiveText: (title: string): string => `Permalink to \u201C${title}\u201D`,
          visuallyHiddenClass: "visually-hidden",
          class: "",
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a href="#h1"><span class="visually-hidden">Permalink to \u201CH1\u201D</span> <span aria-hidden="true">#</span></a>',
    );
  });

  it("should render aria-label style", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          style: "aria-label",
          assistiveText: (title: string): string => `Permalink to \u201C${title}\u201D`,
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1" aria-label="Permalink to \u201CH1\u201D">#</a>',
    );
  });

  it("should render aria-describedby style", () => {
    expect(
      md({
        permalink: linkAfterHeader({ style: "aria-describedby" }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1" aria-describedby="h1">#</a>',
    );
  });

  it("should render with custom symbol and no text heading", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          style: "aria-describedby",
          symbol: "X",
        }),
      }).render("# ![img](url)"),
    ).toBe(
      '<h1 id="" tabindex="-1"><img src="url" alt="img"></h1>\n<a class="header-anchor" href="#" aria-describedby="">X</a>',
    );
  });

  it("should respect placement before", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          style: "visually-hidden",
          assistiveText: (title: string): string => `Permalink to \u201C${title}\u201D`,
          visuallyHiddenClass: "visually-hidden",
          placement: "before",
          space: false,
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1"><span aria-hidden="true">#</span><span class="visually-hidden">Permalink to \u201CH1\u201D</span></a>',
    );
  });

  it("should render with string space", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          ...opts,
          space: "&nbsp;",
        }),
      }).render("# H1"),
    ).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1"><span class="visually-hidden">Permalink to \u201CH1\u201D</span>&nbsp;<span aria-hidden="true"><i class="icon"></i></span></a>',
    );
  });

  it("should support native wrapper", () => {
    expect(
      md({
        permalink: linkAfterHeader({
          ...opts,
          wrapper: ['<div class="wrapper">', "</div>"],
        }),
      }).render("# H1"),
    ).toBe(
      '<div class="wrapper">\n<h1 id="h1" tabindex="-1">H1</h1>\n<a class="header-anchor" href="#h1"><span class="visually-hidden">Permalink to \u201CH1\u201D</span> <span aria-hidden="true"><i class="icon"></i></span></a></div>\n',
    );
  });
});

describe("linkAfterHeader error handling", () => {
  it("should throw on unknown style", () => {
    expect(() => {
      md({
        permalink: linkAfterHeader({ style: "invalid-style" as "visually-hidden" }),
      }).render("# H1");
    }).toThrow(`"permalink.linkAfterHeader" called with unknown style option "invalid-style"`);
  });

  it("should throw on missing assistiveText for visually-hidden", () => {
    expect(() => {
      md({
        permalink: linkAfterHeader({
          style: "visually-hidden",
          visuallyHiddenClass: "sr-only",
        }),
      }).render("# H1");
    }).toThrow(
      `"linkAfterHeader" called without the "assistiveText" option in "visually-hidden" style`,
    );
  });

  it("should throw on missing visuallyHiddenClass", () => {
    expect(() => {
      md({
        permalink: linkAfterHeader({
          style: "visually-hidden",
          assistiveText: () => "permalink",
        }),
      }).render("# H1");
    }).toThrow(
      `"linkAfterHeader" called without the "visuallyHiddenClass" option in "visually-hidden" style`,
    );
  });

  it("should throw on missing assistiveText for aria-label", () => {
    expect(() => {
      md({
        permalink: linkAfterHeader({ style: "aria-label" }),
      }).render("# H1");
    }).toThrow(`"linkAfterHeader" called without the "assistiveText" option in "aria-label" style`);
  });
});
