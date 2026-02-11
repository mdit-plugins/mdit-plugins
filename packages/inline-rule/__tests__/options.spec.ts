import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe("options", () => {
  describe("placement option", () => {
    it("should register before emphasis with placement: 'before-emphasis'", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        placement: "before-emphasis",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });

    it("should register after emphasis with placement: 'after-emphasis' (default)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("should register non-nested rule before emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        placement: "before-emphasis",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("should register nested rule after emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        placement: "after-emphasis",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });
  });

  describe("allowSpace option", () => {
    it("should allow spaces when allowSpace is true", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        allowSpace: true,
      });

      expect(md.render("^foo bar^")).toEqual("<p><sup>foo bar</sup></p>\n");
    });

    it("should disallow spaces when allowSpace is false (default)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^a b^")).toEqual("<p>^a b^</p>\n");
    });
  });

  describe("attrs option", () => {
    it("should apply attrs on non-nested rule", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "span",
        token: "custom",
        attrs: [["class", "custom"]],
      });

      expect(md.render("^test^")).toEqual('<p><span class="custom">test</span></p>\n');
    });

    it("should apply attrs on nested rule", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "span",
        token: "highlight",
        nested: true,
        placement: "before-emphasis",
        attrs: [["class", "highlight"]],
      });

      expect(md.render("==text==")).toEqual('<p><span class="highlight">text</span></p>\n');
    });
  });

  describe("double option", () => {
    it("non-nested double: false (default) uses single marker", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("non-nested double: true uses double marker", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      expect(md.render("%%test%%")).toEqual("<p><span>test</span></p>\n");
      expect(md.render("%test%")).toEqual("<p>%test%</p>\n");
    });

    it("nested always uses double markers regardless of double option", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        placement: "before-emphasis",
      });

      // Single = should not match
      expect(md.render("=test=")).toEqual("<p>=test=</p>\n");
      // Double == should match
      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });
  });

  describe("exhaustive option matrix", () => {
    it("non-nested + single + after-emphasis (sup-like)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        placement: "after-emphasis",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
      expect(md.render("**^test^ bold**")).toEqual(
        "<p><strong><sup>test</sup> bold</strong></p>\n",
      );
    });

    it("non-nested + single + before-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        placement: "before-emphasis",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("non-nested + double + after-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
        placement: "after-emphasis",
      });

      expect(md.render("%%test%%")).toEqual("<p><span>test</span></p>\n");
    });

    it("non-nested + double + before-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
        placement: "before-emphasis",
      });

      expect(md.render("%%test%%")).toEqual("<p><span>test</span></p>\n");
    });

    it("non-nested + single + allowSpace: true", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        allowSpace: true,
      });

      expect(md.render("^foo bar^")).toEqual("<p><sup>foo bar</sup></p>\n");
    });

    it("non-nested + double + allowSpace: true", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
        allowSpace: true,
      });

      expect(md.render("%%foo bar%%")).toEqual("<p><span>foo bar</span></p>\n");
    });

    it("non-nested + attrs + allowSpace: false", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "span",
        token: "custom",
        attrs: [["class", "test"]],
      });

      expect(md.render("^test^")).toEqual('<p><span class="test">test</span></p>\n');
      expect(md.render("^a b^")).toEqual("<p>^a b^</p>\n");
    });

    it("nested + before-emphasis (mark-like)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        placement: "before-emphasis",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });

    it("nested + after-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        nested: true,
        placement: "after-emphasis",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });

    it("nested + attrs + before-emphasis (spoiler-like)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        nested: true,
        placement: "before-emphasis",
        attrs: [
          ["class", "spoiler"],
          ["tabindex", "-1"],
        ],
      });

      expect(md.render("!!test!!")).toEqual(
        '<p><span class="spoiler" tabindex="-1">test</span></p>\n',
      );
    });

    it("nested + attrs + after-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        nested: true,
        placement: "after-emphasis",
        attrs: [["class", "spoiler"]],
      });

      expect(md.render("!!test!!")).toEqual('<p><span class="spoiler">test</span></p>\n');
    });
  });

  describe("emphasis override", () => {
    it("should override underscore emphasis with placement: 'before-emphasis'", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "_",
        tag: "u",
        token: "underline",
        nested: true,
        placement: "before-emphasis",
      });

      // _abc_ should now be <u> instead of <em>
      expect(md.render("__abc__")).toEqual("<p><u>abc</u></p>\n");

      // *abc* asterisk-based italics should still work
      expect(md.render("*abc*")).toEqual("<p><em>abc</em></p>\n");

      // **abc** asterisk-based bold should still work
      expect(md.render("**abc**")).toEqual("<p><strong>abc</strong></p>\n");
    });
  });
});
