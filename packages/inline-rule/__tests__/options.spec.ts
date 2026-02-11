import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe(inlineRule, () => {
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
        double: true,
        nested: true,
        at: "before",
        attrs: [["class", "highlight"]],
      });

      expect(md.render("==text==")).toEqual('<p><span class="highlight">text</span></p>\n');
    });
  });

  describe("at option (positioning)", () => {
    it("should register before emphasis with at: 'before'", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        at: "before",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });

    it("should register after emphasis with at: 'after' (default)", () => {
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
        at: "before",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("should register nested rule after emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        at: "after",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });
  });
});
