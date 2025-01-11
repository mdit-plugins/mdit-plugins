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
    expect(markdownIt.render("::icon-name::")).toEqual(
      `<p><i class="icon-name"></i></p>\n`,
    );

    expect(markdownIt.render("::icon-name fa-fw sm::")).toEqual(
      `<p><i class="icon-name fa-fw sm"></i></p>\n`,
    );

    expect(markdownIt.render("xx ::icon-name:: xx")).toEqual(
      `<p>xx <i class="icon-name"></i> xx</p>\n`,
    );
  });

  it("should not render", () => {
    expect(markdownIt.render("::icon-name")).toEqual("<p>::icon-name</p>\n");
    expect(markdownIt.render("icon-name::")).toEqual("<p>icon-name::</p>\n");
    expect(markdownIt.render(":: icon-name::")).toEqual(
      "<p>:: icon-name::</p>\n",
    );
    expect(markdownIt.render("::icon-name ::")).toEqual(
      "<p>::icon-name ::</p>\n",
    );
    expect(markdownIt.render(":: icon-name:::")).toEqual(
      "<p>:: icon-name:::</p>\n",
    );
    expect(markdownIt.render(":::icon-name ::")).toEqual(
      "<p>:::icon-name ::</p>\n",
    );
    expect(markdownIt.render("::icon-name :::")).toEqual(
      "<p>::icon-name :::</p>\n",
    );
    expect(markdownIt.render(":: icon-name ::")).toEqual(
      "<p>:: icon-name ::</p>\n",
    );
    expect(markdownIt.render(":: no-icon ::icon-name::")).toEqual(
      '<p>:: no-icon <i class="icon-name"></i></p>\n',
    );
  });

  it("do not allow nesting", () => {
    expect(markdownIt.render(`x ::::foo:: bar::`)).toEqual(
      `<p>x ::<i class="foo"></i> bar::</p>\n`,
    );
    expect(markdownIt.render(`x ::foo ::bar::::`)).toEqual(
      `<p>x ::foo <i class="bar"></i>::</p>\n`,
    );
    expect(markdownIt.render(`x ::::foo::::`)).toEqual(
      `<p>x ::<i class="foo"></i>::</p>\n`,
    );
    expect(markdownIt.render(`::foo ::bar:: baz::`)).toEqual(
      `<p>::foo <i class="bar"></i> baz::</p>\n`,
    );
  });

  // FIXME: This is not working as expected
  it.skip("lower priority then emphases or strong", () => {
    expect(markdownIt.render(`::f **o** a::`)).toEqual(
      `<p>::f <strong>o</string> a::</p>\n`,
    );
    expect(markdownIt.render(`::f *o* a::`)).toEqual(
      `<p>::f <em>o</em> a::</p>\n`,
    );
    expect(markdownIt.render(`::f **o ::o** b:: a r::`)).toEqual(
      `<p>::f <strong>0 ::</strong> b:: a r::</p>\n`,
    );
    expect(markdownIt.render(`::f **o ::o b:: a** r::`)).toEqual(
      `<p>::f <strong>o <i class="o b"></i> a</strong> r::</p>\n`,
    );
  });

  it("respect backticks", () => {
    expect(markdownIt.render("::`icon::`")).toEqual(
      `<p>::<code>icon::</code></p>\n`,
    );
    expect(markdownIt.render("` :: icon`::")).toEqual(
      `<p><code> :: icon</code>::</p>\n`,
    );
  });

  it("should work with markdown-it-emoji", () => {
    expect(markdownIt.render(":satellite: ::icon-name:: :satellite:")).toEqual(
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
    expect(markdownIt.render("::icon-name::")).toEqual(
      '<p><Icon icon="icon-name"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name fa-fw sm::")).toEqual(
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
    expect(markdownIt.render("::icon-name::")).toEqual(
      '<p><i class="icon-name"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name fa-fw sm::")).toEqual(
      '<p><i class="icon-name fa-fw sm"></i></p>\n',
    );
  });
});
