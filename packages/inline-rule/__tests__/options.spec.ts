import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe("options", () => {
  it("should throw error if required options are missing", () => {
    const md = MarkdownIt();

    expect(() => md.use(inlineRule, {})).toThrow(
      "Invalid options for inlineRule plugin: 'marker', 'token', and 'tag' are required string properties.",
    );
    expect(() => md.use(inlineRule, { marker: "*", token: "star" })).toThrow(
      "Invalid options for inlineRule plugin: 'marker', 'token', and 'tag' are required string properties.",
    );
    expect(() => md.use(inlineRule, { marker: "*", tag: "star" })).toThrow(
      "Invalid options for inlineRule plugin: 'marker', 'token', and 'tag' are required string properties.",
    );
    expect(() => md.use(inlineRule, { token: "star", tag: "star" })).toThrow(
      "Invalid options for inlineRule plugin: 'marker', 'token', and 'tag' are required string properties.",
    );
  });

  it("should throw error if marker is not a single character", () => {
    const md = MarkdownIt();

    expect(() => md.use(inlineRule, { marker: "**", token: "bold", tag: "strong" })).toThrow(
      "Invalid marker for inlineRule plugin: 'marker' must be a single character.",
    );
  });

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

    it("non-nested + single + allowSpace: false (explicit)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        allowSpace: false,
      });

      expect(md.render("^foo bar^")).toEqual("<p>^foo bar^</p>\n");
      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
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

    it("non-nested + double + allowSpace: false (explicit)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
        allowSpace: false,
      });

      expect(md.render("%%foo bar%%")).toEqual("<p>%%foo bar%%</p>\n");
      expect(md.render("%%test%%")).toEqual("<p><span>test</span></p>\n");
    });

    it("non-nested + single + attrs + before-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "span",
        token: "custom",
        attrs: [["class", "test"]],
        placement: "before-emphasis",
      });

      expect(md.render("^test^")).toEqual('<p><span class="test">test</span></p>\n');
    });

    it("non-nested + single + attrs + after-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "span",
        token: "custom",
        attrs: [["class", "test"]],
        placement: "after-emphasis",
      });

      expect(md.render("^test^")).toEqual('<p><span class="test">test</span></p>\n');
      expect(md.render("^a b^")).toEqual("<p>^a b^</p>\n");
    });

    it("non-nested + double + attrs + before-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
        attrs: [["data-type", "custom"]],
        placement: "before-emphasis",
      });

      expect(md.render("%%test%%")).toEqual('<p><span data-type="custom">test</span></p>\n');
    });

    it("non-nested + double + attrs + after-emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
        attrs: [["data-type", "custom"]],
        placement: "after-emphasis",
      });

      expect(md.render("%%test%%")).toEqual('<p><span data-type="custom">test</span></p>\n');
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
      expect(md.render("_abc_")).toEqual("<p><u>abc</u></p>\n");

      // __abc__ should now be <u> instead of <strong>
      expect(md.render("__abc__")).toEqual("<p><u>abc</u></p>\n");

      // *abc* asterisk-based italics should still work
      expect(md.render("*abc*")).toEqual("<p><em>abc</em></p>\n");

      // **abc** asterisk-based bold should still work
      expect(md.render("**abc**")).toEqual("<p><strong>abc</strong></p>\n");
    });
  });
});
