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
        nested: true,
        double: true,
        placement: "before-emphasis",
      });

      expect(md.render("!!not closed")).toBe("<p>!!not closed</p>\n");
    });

    it("should not match unclosed non-nested markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^not closed")).toBe("<p>^not closed</p>\n");
    });

    it("should handle escaped markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render(String.raw`\^not a sup^`)).toBe("<p>^not a sup^</p>\n");
    });

    it("should not match empty content in non-nested mode", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^^")).toBe("<p>^^</p>\n");
    });

    it("should handle double marker non-nested with no content", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      expect(md.render("%%%%")).toBe("<p>%%%%</p>\n");
    });

    it("should not match double marker when second char differs", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      // Single % followed by text - should not match
      expect(md.render("%test%")).toBe("<p>%test%</p>\n");
    });

    it("should support nested rule with placement: 'after-emphasis' and tokens_meta", () => {
      // This tests the "after" nested path with token meta processing
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        double: true,
        placement: "after-emphasis",
      });

      // Use emphasis that creates token meta entries
      expect(md.render("*==mark==*")).toBe("<p><em><mark>mark</mark></em></p>\n");

      // Link content creates separate token_meta entries with delimiters
      expect(md.render("[==link==](url)")).toBe('<p><a href="url"><mark>link</mark></a></p>\n');
    });

    it("should not parse inside code spans (nested double)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        double: true,
        placement: "before-emphasis",
      });

      expect(md.render("`==not mark==`")).toBe("<p><code>==not mark==</code></p>\n");
    });

    it("should not parse inside code spans (nested single)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      expect(md.render("`+not ins+`")).toBe("<p><code>+not ins+</code></p>\n");
    });

    it("should parse inside link text (nested single)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      expect(md.render("[+link+](url)")).toBe('<p><a href="url"><ins>link</ins></a></p>\n');
    });

    it("should handle escaped marker (nested single)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      expect(md.render(String.raw`\+not ins+`)).toBe("<p>+not ins+</p>\n");
      expect(md.render(String.raw`+not ins\+`)).toBe("<p>+not ins+</p>\n");
    });

    it("should handle unicode text (nested single)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      expect(md.render("你好+插入+世界")).toBe("<p>你好<ins>插入</ins>世界</p>\n");
    });

    it("should handle punctuation adjacency (nested single)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      expect(md.render("(+text+)")).toBe("<p>(<ins>text</ins>)</p>\n");
      expect(md.render("+text+.")).toBe("<p><ins>text</ins>.</p>\n");
    });

    it("should handle emphasis inside single-marker nested", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      expect(md.render("+*em* inside+")).toBe("<p><ins><em>em</em> inside</ins></p>\n");
      expect(md.render("+**strong** inside+")).toBe(
        "<p><ins><strong>strong</strong> inside</ins></p>\n",
      );
      expect(md.render("*+ins inside em+*")).toBe("<p><em><ins>ins inside em</ins></em></p>\n");
    });

    it("should handle single marker as regular character", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      // Single + between letters: open+close, but only one + so can't pair
      expect(md.render("a+b=c")).toBe("<p>a+b=c</p>\n");
    });

    it("should not match across blocks (nested single)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        nested: true,
        double: false,
        placement: "before-emphasis",
      });

      // Opening marker at end of paragraph, closing in next — shouldn't match
      expect(md.render("+start\n\n+end")).toBe("<p>+start</p>\n<p>+end</p>\n");
    });
  });
});
