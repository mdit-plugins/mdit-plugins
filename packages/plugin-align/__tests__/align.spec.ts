import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { align } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(align);

describe(align, () => {
  it("should handle left", () => {
    expect(markdownIt.render("::: left\n*content*\n:::\n")).toBe(
      '<div style="text-align:left">\n<p><em>content</em></p>\n</div>\n',
    );
  });

  it("should handle right", () => {
    expect(markdownIt.render("::: right\n*content*\n:::\n")).toBe(
      '<div style="text-align:right">\n<p><em>content</em></p>\n</div>\n',
    );
  });

  it("should handle center", () => {
    expect(markdownIt.render("::: center\n*content*\n:::\n")).toBe(
      '<div style="text-align:center">\n<p><em>content</em></p>\n</div>\n',
    );
  });

  it("should handle justify", () => {
    expect(markdownIt.render("::: justify\n*content*\n:::\n")).toBe(
      '<div style="text-align:justify">\n<p><em>content</em></p>\n</div>\n',
    );
  });

  it("should handle nesting", () => {
    expect(
      markdownIt.render(
        ":::: center\nCenter contents...\n\n::: left\nLeft contents..\n:::\n\n::::",
      ),
    ).toBe(
      '<div style="text-align:center">\n<p>Center contents...</p>\n' +
        '<div style="text-align:left">\n<p>Left contents..</p>\n</div>\n' +
        "</div>\n",
    );
  });

  it("should allow escaping the marker", () => {
    expect(markdownIt.render("\\::: left\n\n:::\n")).toBe("<p>::: left</p>\n<p>:::</p>\n");
  });
});
