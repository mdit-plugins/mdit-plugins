import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode ? `<block>${content.trim()}</block>` : `{Tex content: ${content.trim()}}`;

const createMd = (delimiters: "dollars" | "brackets" | "all"): MarkdownItType =>
  new MarkdownIt().use(tex, { delimiters, render });

describe("unclosed block math", () => {
  it("should keep rendering content after an unclosed $$ block", () => {
    expect(createMd("dollars").render("$$\na = 1\n\nplain paragraph")).toBe(
      "<p>$$\na = 1</p>\n<p>plain paragraph</p>\n",
    );
  });

  it("should keep rendering content between unclosed $$ and following blocks", () => {
    expect(createMd("dollars").render("before\n\n$$\na = 1\n\nafter")).toBe(
      "<p>before</p>\n<p>$$\na = 1</p>\n<p>after</p>\n",
    );
  });

  it("should keep an unclosed single-line $$ as paragraph text", () => {
    expect(createMd("dollars").render("$$\na = 1\ntrailing text")).toBe(
      "<p>$$\na = 1\ntrailing text</p>\n",
    );
  });

  it("should keep an unclosed $$ block at the end of the document as paragraph text", () => {
    expect(createMd("dollars").render("$$\na = 1\nb = 2")).toBe("<p>$$\na = 1\nb = 2</p>\n");
  });

  it("should not split a paragraph on an unclosed $$ block", () => {
    expect(createMd("dollars").render("foo\n$$a\nbar")).toBe("<p>foo\n$$a\nbar</p>\n");
    expect(createMd("dollars").render("foo\n$$\na\nbar")).toBe("<p>foo\n$$\na\nbar</p>\n");
  });

  it("should keep an unclosed $$ block inside a list item as paragraph text", () => {
    expect(createMd("dollars").render("- test\n\n  $$a = 1\n\ntest.")).toBe(
      "<ul>\n<li>\n<p>test</p>\n<p>$$a = 1</p>\n</li>\n</ul>\n<p>test.</p>\n",
    );
  });

  it("should keep rendering content after an unclosed $$ block in all mode", () => {
    expect(createMd("all").render("$$\na = 1\n\nplain paragraph")).toBe(
      "<p>$$\na = 1</p>\n<p>plain paragraph</p>\n",
    );
  });

  it("should still render a closed $$ block", () => {
    expect(createMd("dollars").render("$$\na = 1\n$$\n\nafter")).toBe(
      "<block>a = 1</block><p>after</p>\n",
    );
  });

  it(String.raw`should match the existing \[ behavior for unclosed blocks`, () => {
    expect(createMd("brackets").render("\\[\na = 1\n\nplain paragraph")).toBe(
      "<p>[\na = 1</p>\n<p>plain paragraph</p>\n",
    );
  });

  it(String.raw`should still render a closed \[ block`, () => {
    expect(createMd("brackets").render("\\[\na = 1\n\\]\n\nafter")).toBe(
      "<block>a = 1</block><p>after</p>\n",
    );
  });
});
