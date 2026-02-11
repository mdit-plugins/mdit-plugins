import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe(inlineRule, () => {
  describe("edge cases", () => {
    it("should not match unclosed markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        double: true,
        nested: true,
        at: "before",
      });

      expect(md.render("!!not closed")).toEqual("<p>!!not closed</p>\n");
    });

    it("should not match unclosed non-nested markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^not closed")).toEqual("<p>^not closed</p>\n");
    });

    it("should handle escaped markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render(String.raw`\^not a sup^`)).toEqual("<p>^not a sup^</p>\n");
    });

    it("should not match empty content in non-nested mode", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^^")).toEqual("<p>^^</p>\n");
    });

    it("should handle double marker non-nested with no content", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      expect(md.render("%%%%")).toEqual("<p>%%%%</p>\n");
    });

    it("should not match double marker when second char differs", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      // Single % followed by text - should not match
      expect(md.render("%test%")).toEqual("<p>%test%</p>\n");
    });

    it("should support nested rule with at: 'after' and tokens_meta", () => {
      // This tests the "after" nested path with token meta processing
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        at: "after",
      });

      // Use emphasis that creates token meta entries
      expect(md.render("*==mark==*")).toEqual("<p><em><mark>mark</mark></em></p>\n");

      // Link content creates separate token_meta entries with delimiters
      expect(md.render("[==link==](url)")).toEqual('<p><a href="url"><mark>link</mark></a></p>\n');
    });
  });
});
