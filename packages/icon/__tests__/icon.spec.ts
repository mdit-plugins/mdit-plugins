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
      '<p><i class="icon-name"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name fa-fw sm::")).toEqual(
      '<p><i class="icon-name fa-fw sm"></i></p>\n',
    );

    expect(markdownIt.render("xx ::icon-name:: xx")).toEqual(
      '<p>xx <i class="icon-name"></i> xx</p>\n',
    );

    expect(markdownIt.render(":satellite: ::icon-name:: :satellite:")).toEqual(
      '<p>📡 <i class="icon-name"></i> 📡</p>\n',
    );
  });

  it("should render with size", () => {
    expect(markdownIt.render("::icon-name =24px::")).toEqual(
      '<p><i class="icon-name" style="width:24px;height:24px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name =1.2emx1.2em::")).toEqual(
      '<p><i class="icon-name" style="width:1.2em;height:1.2em;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name =16x16::")).toEqual(
      '<p><i class="icon-name" style="width:16px;height:16px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name =16x::")).toEqual(
      '<p><i class="icon-name" style="width:16px;height:16px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name =x16::")).toEqual(
      '<p><i class="icon-name" style="height:16px;"></i></p>\n',
    );
  });

  it("should render with color", () => {
    expect(markdownIt.render("::icon-name =24px #ccc::")).toEqual(
      '<p><i class="icon-name" style="color:#ccc;width:24px;height:24px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name #fff::")).toEqual(
      '<p><i class="icon-name" style="color:#fff;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name #ffffff::")).toEqual(
      '<p><i class="icon-name" style="color:#ffffff;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name #ffffff00::")).toEqual(
      '<p><i class="icon-name" style="color:#ffffff00;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name rgb(255, 255, 255)::")).toEqual(
      '<p><i class="icon-name" style="color:rgb(255, 255, 255);"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name rgba(0,0,0,0)::")).toEqual(
      '<p><i class="icon-name" style="color:rgba(0,0,0,0);"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name hsl(30deg 82% 43%)::")).toEqual(
      '<p><i class="icon-name" style="color:hsl(30deg 82% 43%);"></i></p>\n',
    );

    expect(
      markdownIt.render("::icon-name hsla(30deg 82% 43% / 60%)::"),
    ).toEqual(
      '<p><i class="icon-name" style="color:hsla(30deg 82% 43% / 60%);"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name var(--color)::")).toEqual(
      '<p><i class="icon-name" style="color:var(--color);"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name /currentColor::")).toEqual(
      '<p><i class="icon-name" style="color:currentColor;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name /red::")).toEqual(
      '<p><i class="icon-name" style="color:red;"></i></p>\n',
    );
  });

  it("should render with mixed disruption", () => {
    expect(markdownIt.render("::icon-name =24px #ccc::")).toEqual(
      '<p><i class="icon-name" style="color:#ccc;width:24px;height:24px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name =24px #ccc extra::")).toEqual(
      '<p><i class="icon-name extra" style="color:#ccc;width:24px;height:24px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name #ccc extra =24px::")).toEqual(
      '<p><i class="icon-name extra" style="color:#ccc;width:24px;height:24px;"></i></p>\n',
    );

    expect(markdownIt.render("::icon-name #ccc =24pxx16px fa-fw sm::")).toEqual(
      '<p><i class="icon-name fa-fw sm" style="color:#ccc;width:24px;height:16px;"></i></p>\n',
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

describe("should not work", () => {
  const markdownIt = MarkdownIt()
    .use(emoji as unknown as PluginWithOptions)
    .use(icon);

  it("should not work with invalid syntax", () => {
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
});
