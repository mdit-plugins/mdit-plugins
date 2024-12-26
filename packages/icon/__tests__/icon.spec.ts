/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { icon } from "../src/index.js";

describe("should work with default options", () => {
  const markdownIt = MarkdownIt().use(icon);

  it("should render", () => {
    expect(markdownIt.render("::icon-name::")).toEqual(
      '<p><span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span></p>\n',
    );

    expect(markdownIt.render("::icon-name 24px::")).toEqual(
      '<p><span class="icon" name="icon-name" color="currentColor" width="24px" height="24px"></span></p>\n',
    );

    expect(markdownIt.render("::icon-name 24px/#ccc::")).toEqual(
      '<p><span class="icon" name="icon-name" color="#ccc" width="24px" height="24px"></span></p>\n',
    );

    expect(markdownIt.render("::icon-name /#fff::")).toEqual(
      '<p><span class="icon" name="icon-name" color="#fff" width="1em" height="1em"></span></p>\n',
    );

    expect(markdownIt.render("xx ::icon-name:: xx")).toEqual(
      '<p>xx <span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span> xx</p>\n',
    );
  });

  it("should render with multiple icons", () => {
    expect(markdownIt.render("::icon-name:: ::icon-name::")).toEqual(
      '<p><span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span> <span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span></p>\n',
    );

    expect(
      markdownIt.render("xxx ::icon-name:: ::icon-name 24px:: :: xxx"),
    ).toEqual(
      '<p>xxx <span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span> <span class="icon" name="icon-name" color="currentColor" width="24px" height="24px"></span> :: xxx</p>\n',
    );

    expect(markdownIt.render(":::icon-name:::")).toEqual(
      '<p>:<span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span>:</p>\n',
    );
  });
});

describe("should work with attrs mapping", () => {
  const markdownIt = MarkdownIt().use(icon, {
    tag: "Icon",
    attrs: {
      icon: ({ name }) => name,
      color: ({ color }) => color || "#000",
      size: ({ size }) => size || "1.2em",
    },
  });

  it("should render", () => {
    expect(markdownIt.render("::icon-name::")).toEqual(
      '<p><Icon icon="icon-name" color="#000" size="1.2em"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name 24px::")).toEqual(
      '<p><Icon icon="icon-name" color="#000" size="24px"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name 24px/#ccc::")).toEqual(
      '<p><Icon icon="icon-name" color="#ccc" size="24px"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name /#fff::")).toEqual(
      '<p><Icon icon="icon-name" color="#fff" size="1.2em"></Icon></p>\n',
    );

    expect(markdownIt.render("xx ::icon-name-1:: ::icon-name-2:: xx")).toEqual(
      '<p>xx <Icon icon="icon-name-1" color="#000" size="1.2em"></Icon> <Icon icon="icon-name-2" color="#000" size="1.2em"></Icon> xx</p>\n',
    );
  });
});

describe("should work with attrs function", () => {
  const markdownIt = MarkdownIt().use(icon, {
    tag: "Icon",
    attrs: ({ name, size, color }) => [
      ["icon", name],
      ["color", !color || color === "currentColor" ? undefined : color],
      ["size", !size || size === "1em" ? undefined : size],
    ],
  });

  it("should render", () => {
    expect(markdownIt.render("::icon-name::")).toEqual(
      '<p><Icon icon="icon-name"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name 24px::")).toEqual(
      '<p><Icon icon="icon-name" size="24px"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name 24px/#ccc::")).toEqual(
      '<p><Icon icon="icon-name" color="#ccc" size="24px"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name /#fff::")).toEqual(
      '<p><Icon icon="icon-name" color="#fff"></Icon></p>\n',
    );

    expect(markdownIt.render("::icon-name 1em/currentColor::")).toEqual(
      '<p><Icon icon="icon-name"></Icon></p>\n',
    );

    expect(markdownIt.render("xx ::icon-name-1:: ::icon-name-2:: xx")).toEqual(
      '<p>xx <Icon icon="icon-name-1"></Icon> <Icon icon="icon-name-2"></Icon> xx</p>\n',
    );
  });
});

describe("should not work", () => {
  const markdownIt = MarkdownIt().use(icon);

  it("should not work with invalid syntax", () => {
    expect(markdownIt.render("::icon-name")).toEqual("<p>::icon-name</p>\n");
    expect(markdownIt.render(":: icon-name::")).toEqual(
      "<p>:: icon-name::</p>\n",
    );
    expect(markdownIt.render("::icon-name :::")).toEqual(
      "<p>::icon-name :::</p>\n",
    );
    expect(markdownIt.render(":: icon-name ::")).toEqual(
      "<p>:: icon-name ::</p>\n",
    );
    expect(markdownIt.render(":: no-icon ::icon-name::")).toEqual(
      '<p>:: no-icon <span class="icon" name="icon-name" color="currentColor" width="1em" height="1em"></span></p>\n',
    );
  });
});
