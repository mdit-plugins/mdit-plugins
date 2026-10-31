import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const md = new MarkdownIt().use(tex, { delimiters: "all", render: (content) => content });

const blockContent = (src: string): string | undefined =>
  md.parse(src, {}).find((token) => token.type === "math_block")?.content;

describe("block tex content", () => {
  describe("indentation", () => {
    it("should continue a tab-indented block in a list item", () => {
      // `tShift` counts characters while `blkIndent` counts columns: a single tab
      // at the start of a continuation line is one character but four columns, so
      // it must not be treated as a negative indent.
      expect(blockContent("- $$\n\ta = 1\n\t$$")).toBe("  a = 1\n");
    });

    it("should continue a tab-indented bracket block in a list item", () => {
      expect(blockContent("- \\[\n\ta = 1\n\t\\]")).toBe("  a = 1\n");
    });

    it("should still stop at a line indented less than blkIndent", () => {
      expect(blockContent("- $$\n  a = 1\n b = 2\n  $$")).toBeUndefined();
    });

    it("should dedent a tab-indented block with column counts", () => {
      // The dedent width passed to `getLines` must be a column count, like the
      // negative-indent guard above: a leading tab inside a blockquote is four
      // columns, so no padding character may survive in the content.
      expect(blockContent("> \t$$\n> \ta\n> \t$$")).toBe("a\n");
      expect(blockContent("> \t\\[\n> \ta\n> \t\\]")).toBe("a\n");
    });

    it("should not continue through a lazy blockquote line", () => {
      // An unquoted continuation line after a blockquote is not a lazy
      // continuation of a block math block (same as markdown-it's fence rule),
      // so the block must not swallow the following document content.
      expect(blockContent("> $$\n> a\n$$")).toBeUndefined();
    });
  });

  describe("trailing whitespace", () => {
    it("should preserve trailing whitespace in dollar blocks", () => {
      expect(blockContent("$$\na\nb   $$")).toBe("a\nb   \n");
    });

    it("should preserve trailing whitespace in bracket blocks", () => {
      // The last content line is spliced like every other line of the block, so
      // trailing spaces before the closing marker must not be trimmed only here.
      expect(blockContent("\\[\na\nb   \\]")).toBe("a\nb   \n");
    });

    it("should handle trailing whitespace consistently for single-line blocks", () => {
      expect(blockContent("$$a   $$")).toBe("a   \n");
      expect(blockContent(String.raw`\[a   \]`)).toBe("a   \n");
    });
  });

  describe("trailing newline", () => {
    // markdown-it's own block tokens follow the convention "every content line is
    // newline-terminated, an empty block is the empty string" (e.g. fence:
    // "```\na\n```" => "a\n", "```\n```" => ""). Block math follows the same
    // convention, so single-line and multi-line blocks share one content shape.
    it("should end single-line and multi-line content with a newline", () => {
      expect(blockContent("$$a$$")).toBe("a\n");
      expect(blockContent("$$\na\n$$")).toBe("a\n");
      expect(blockContent(String.raw`\[a\]`)).toBe("a\n");
      expect(blockContent("\\[\na\n\\]")).toBe("a\n");
    });

    it("should keep empty single-line and multi-line content empty", () => {
      expect(blockContent("$$$$")).toBe("");
      expect(blockContent("$$\n$$")).toBe("");
      expect(blockContent(String.raw`\[\]`)).toBe("");
      expect(blockContent("\\[\n\\]")).toBe("");
    });
  });
});
