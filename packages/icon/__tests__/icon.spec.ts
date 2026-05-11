import type { PluginWithOptions } from "markdown-it";
import MarkdownIt from "markdown-it";
import { full as emoji } from "markdown-it-emoji";
import { describe, expect, it } from "vitest";

import { icon } from "../src/index.js";

describe("should work with default options", () => {
  const markdownIt = MarkdownIt()
    .use(emoji as unknown as PluginWithOptions)
    .use(icon);

  it("should render", () => {
    expect(markdownIt.render("::icon-name::")).toBe(`<p><i class="icon-name"></i></p>\n`);

    expect(markdownIt.render("::icon-name fa-fw sm::")).toBe(
      `<p><i class="icon-name fa-fw sm"></i></p>\n`,
    );

    expect(markdownIt.render("xx ::icon-name:: xx")).toBe(
      `<p>xx <i class="icon-name"></i> xx</p>\n`,
    );

    expect(
      markdownIt.render(`\
xx
::icon-name::
xx
`),
    ).toBe(`\
<p>xx
<i class="icon-name"></i>
xx</p>\n`);
  });

  it("should not render", () => {
    expect(markdownIt.render("::icon-name")).toBe("<p>::icon-name</p>\n");
    expect(markdownIt.render("icon-name::")).toBe("<p>icon-name::</p>\n");
    expect(markdownIt.render(":: icon-name::")).toBe("<p>:: icon-name::</p>\n");
    expect(markdownIt.render("::icon-name ::")).toBe("<p>::icon-name ::</p>\n");
    expect(markdownIt.render(":: icon-name:::")).toBe("<p>:: icon-name:::</p>\n");
    expect(markdownIt.render(":::icon-name ::")).toBe("<p>:::icon-name ::</p>\n");
    expect(markdownIt.render("::icon-name :::")).toBe("<p>::icon-name :::</p>\n");
    expect(markdownIt.render(":: icon-name ::")).toBe("<p>:: icon-name ::</p>\n");
    expect(markdownIt.render(":: no-icon ::icon-name::")).toBe(
      '<p>:: no-icon <i class="icon-name"></i></p>\n',
    );
  });

  it("do not allow nesting", () => {
    expect(markdownIt.render(`x ::::foo:: bar::`)).toBe(`<p>x ::<i class="foo"></i> bar::</p>\n`);
    expect(markdownIt.render(`x ::foo ::bar::::`)).toBe(`<p>x ::foo <i class="bar"></i>::</p>\n`);
    expect(markdownIt.render(`x ::::foo::::`)).toBe(`<p>x ::<i class="foo"></i>::</p>\n`);
    expect(markdownIt.render(`::foo ::bar:: baz::`)).toBe(
      `<p>::foo <i class="bar"></i> baz::</p>\n`,
    );
  });

  it("higher priority then emphases or strong", () => {
    expect(markdownIt.render(`::f **o** a::`)).toBe(`<p><i class="f **o** a"></i></p>\n`);
    expect(markdownIt.render(`*f ::o:: a*`)).toBe(`<p><em>f <i class="o"></i> a</em></p>\n`);
    expect(markdownIt.render(`::f **o ::o** b:: a r::`)).toBe(
      `<p>::f **o <i class="o** b"></i> a r::</p>\n`,
    );
    expect(markdownIt.render(`::f **o ::o b:: a** r::`)).toBe(
      `<p>::f <strong>o <i class="o b"></i> a</strong> r::</p>\n`,
    );
  });

  it("respect backticks", () => {
    expect(markdownIt.render("::`icon::`")).toBe(`<p>::<code>icon::</code></p>\n`);
    expect(markdownIt.render("` :: icon`::")).toBe(`<p><code> :: icon</code>::</p>\n`);
  });

  it("should work with markdown-it-emoji", () => {
    expect(markdownIt.render(":satellite: ::icon-name:: :satellite:")).toBe(
      '<p>📡 <i class="icon-name"></i> 📡</p>\n',
    );
  });
});

describe("should work with custom render", () => {
  const markdownIt = MarkdownIt()
    .use(emoji as unknown as PluginWithOptions)
    .use(icon, {
      render(content) {
        return `<Icon icon="${content}"></Icon>`;
      },
    });

  it("should render", () => {
    expect(markdownIt.render("::icon-name::")).toBe('<p><Icon icon="icon-name"></Icon></p>\n');

    expect(markdownIt.render("::icon-name fa-fw sm::")).toBe(
      '<p><Icon icon="icon-name fa-fw sm"></Icon></p>\n',
    );
  });
});

describe("should work with render: undefined", () => {
  const markdownIt = MarkdownIt()
    .use(emoji as unknown as PluginWithOptions)
    .use(icon, {
      render: undefined,
    });

  it("should render", () => {
    expect(markdownIt.render("::icon-name::")).toBe('<p><i class="icon-name"></i></p>\n');

    expect(markdownIt.render("::icon-name fa-fw sm::")).toBe(
      '<p><i class="icon-name fa-fw sm"></i></p>\n',
    );
  });
});

describe("silent mode", () => {
  it("should handle silent mode accurately", () => {
    const md = MarkdownIt().use(icon);
    const src = "::icon::";
    const state = new md.inline.State(src, md, {}, []);

    state.md.inline.skipToken(state);

    expect(state.pos).toBe(src.length);
    expect(state.tokens).toHaveLength(0);
  });
});
