import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe(inlineRule, () => {
  describe("non-nested (linear scan)", () => {
    describe("sup configuration (marker: ^, tag: sup)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      it("should render", () => {
        expect(md.render("^test^")).toBe("<p><sup>test</sup></p>\n");
      });

      it("should not render when escape", () => {
        expect(md.render(String.raw`^foo\^`)).toBe("<p>^foo^</p>\n");
        expect(md.render(String.raw`\^foo^`)).toBe("<p>^foo^</p>\n");
      });

      it("should not render when having spaces", () => {
        expect(md.render("2^4 + 3^5")).toBe("<p>2^4 + 3^5</p>\n");
      });

      it("should render when spaces are escaped", () => {
        expect(md.render(String.raw`^foo\ bar\ baz^`)).toBe("<p><sup>foo bar baz</sup></p>\n");
        expect(md.render(String.raw`^\ foo\ ^`)).toBe("<p><sup> foo </sup></p>\n");
      });

      it("should render when having other symbols", () => {
        expect(md.render("^foo~bar^baz^bar~foo^")).toBe(
          "<p><sup>foo~bar</sup>baz<sup>bar~foo</sup></p>\n",
        );
      });

      it(String.raw`should handle multiple '\'`, () => {
        expect(md.render(String.raw`^foo\\\\\\\ bar^`)).toBe("<p><sup>foo\\\\\\ bar</sup></p>\n");
        expect(md.render(String.raw`^foo\\\\\\ bar^`)).toBe("<p>^foo\\\\\\ bar^</p>\n");
      });

      it("should work with other marker", () => {
        expect(md.render("**^foo^ bar**")).toBe("<p><strong><sup>foo</sup> bar</strong></p>\n");
        expect(md.render("*^f")).toBe("<p>*^f</p>\n");
        expect(md.render("b*^")).toBe("<p>b*^</p>\n");
      });
    });

    describe("sub configuration (marker: ~, tag: sub)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "~",
        tag: "sub",
        token: "sub",
      });

      it("should render", () => {
        expect(md.render("~test~")).toBe("<p><sub>test</sub></p>\n");
      });

      it("should not render when escape", () => {
        expect(md.render(String.raw`~foo\~`)).toBe("<p>~foo~</p>\n");
        expect(md.render(String.raw`\~foo~`)).toBe("<p>~foo~</p>\n");
      });

      it("should not render when having spaces", () => {
        expect(md.render("~foo bar~")).toBe("<p>~foo bar~</p>\n");
      });

      it("should render when spaces are escaped", () => {
        expect(md.render(String.raw`~foo\ bar\ baz~`)).toBe("<p><sub>foo bar baz</sub></p>\n");
        expect(md.render(String.raw`~\ foo\ ~`)).toBe("<p><sub> foo </sub></p>\n");
      });

      it(String.raw`should handle multiple '\'`, () => {
        expect(md.render(String.raw`~foo\\\\\ bar~`)).toBe("<p><sub>foo\\\\ bar</sub></p>\n");
        expect(md.render(String.raw`~foo\\\\ bar~`)).toBe("<p>~foo\\\\ bar~</p>\n");
      });

      it("should work with other marker", () => {
        expect(md.render("**~foo~ bar**")).toBe("<p><strong><sub>foo</sub> bar</strong></p>\n");
        expect(md.render("*~f")).toBe("<p>*~f</p>\n");
        expect(md.render("b*~")).toBe("<p>b*~</p>\n");
      });
    });
  });
});
