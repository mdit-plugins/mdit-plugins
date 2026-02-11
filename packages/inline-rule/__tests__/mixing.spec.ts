import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe(inlineRule, () => {
  describe("multiple registrations", () => {
    it("should support multiple different rules on the same instance", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        })
        .use(inlineRule, {
          marker: "~",
          tag: "sub",
          token: "sub",
        });

      expect(md.render("^sup^ and ~sub~")).toEqual("<p><sup>sup</sup> and <sub>sub</sub></p>\n");
    });

    it("should support mixing nested and non-nested rules", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          double: true,
          nested: true,
          at: "before",
        });

      expect(md.render("==marked ^sup^ text==")).toEqual(
        "<p><mark>marked <sup>sup</sup> text</mark></p>\n",
      );
    });
  });

  describe("nesting behavior", () => {
    it("nested: false should not parse inner inline markup", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "~",
        tag: "sub",
        token: "sub",
        allowSpace: true,
      });

      // inner **bold** should NOT be parsed
      expect(md.render("~sub **bold**~")).toEqual("<p><sub>sub **bold**</sub></p>\n");
    });

    it("nested: true should parse inner inline markup", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        double: true,
        nested: true,
        at: "before",
        attrs: [["class", "spoiler"]],
      });

      expect(md.render("!!spoiler **bold**!!")).toEqual(
        '<p><span class="spoiler">spoiler <strong>bold</strong></span></p>\n',
      );
    });
  });

  describe("cross-rule interaction", () => {
    it("should support spoiler with mark inside", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "!",
          tag: "span",
          token: "spoiler",
          double: true,
          nested: true,
          at: "before",
          attrs: [["class", "spoiler"]],
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          double: true,
          nested: true,
          at: "before",
        });

      expect(md.render("!!spoiler with ==mark== inside!!")).toEqual(
        '<p><span class="spoiler">spoiler with <mark>mark</mark> inside</span></p>\n',
      );
    });
  });
});
