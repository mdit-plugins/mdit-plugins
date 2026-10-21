import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode ? `<block>${content.trim()}</block>` : `{Tex content: ${content.trim()}}`;

const createMd = (): MarkdownItType =>
  new MarkdownIt().use(tex, { delimiters: "brackets", render });

describe("bracket block silent mode", () => {
  it("should not split a paragraph on an unclosed single-line block", () => {
    expect(createMd().render("foo\n\\[a\nbar")).toBe("<p>foo\n[a\nbar</p>\n");
  });

  it("should not split a paragraph on an unclosed multi-line block", () => {
    expect(createMd().render("foo\n\\[a\nbar\nbaz")).toBe("<p>foo\n[a\nbar\nbaz</p>\n");
  });

  it("should still split the paragraph when the block is closed", () => {
    expect(createMd().render("foo\n\\[a\\]\nbar")).toBe("<p>foo</p>\n<block>a</block><p>bar</p>\n");
  });

  it("should still parse a closed multi-line block", () => {
    expect(createMd().render("foo\n\\[a\nb\\]\nbar")).toBe(
      "<p>foo</p>\n<block>a\nb</block><p>bar</p>\n",
    );
  });
});
