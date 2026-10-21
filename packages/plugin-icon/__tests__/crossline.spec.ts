import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { icon } from "../src/index.js";

describe("plugin-icon: cross-line syntax", () => {
  const markdownIt = new MarkdownIt().use(icon);

  it("should not match across a line break", () => {
    expect(markdownIt.render("::foo\nbar::")).toBe("<p>::foo\nbar::</p>\n");
    expect(markdownIt.render("::foo\n::")).toBe("<p>::foo\n::</p>\n");
    expect(markdownIt.render("a ::foo\nbar:: b")).toBe("<p>a ::foo\nbar:: b</p>\n");
  });

  it("should not include a line break from a skipped token in the icon content", () => {
    expect(markdownIt.render("::`foo\nbar`::")).toBe("<p>::<code>foo bar</code>::</p>\n");
  });

  it("should still match single-line icons on other lines", () => {
    expect(markdownIt.render("::ok::\nx")).toBe('<p><i class="ok"></i>\nx</p>\n');
    expect(markdownIt.render("::foo\nbar:: ::ok::")).toBe(
      '<p>::foo\nbar:: <i class="ok"></i></p>\n',
    );
  });
});
