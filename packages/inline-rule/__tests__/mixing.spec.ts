import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe("mixing", () => {
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
          nested: true,
          placement: "before-emphasis",
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
        nested: true,
        placement: "before-emphasis",
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
          nested: true,
          placement: "before-emphasis",
          attrs: [["class", "spoiler"]],
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        });

      expect(md.render("!!spoiler with ==mark== inside!!")).toEqual(
        '<p><span class="spoiler">spoiler with <mark>mark</mark> inside</span></p>\n',
      );
    });

    it("should support three rules stacked together", () => {
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
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        });

      expect(md.render("==marked ^sup^ and ~sub~ text==")).toEqual(
        "<p><mark>marked <sup>sup</sup> and <sub>sub</sub> text</mark></p>\n",
      );
    });

    it("should support non-nested + nested + attrs stacked", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        })
        .use(inlineRule, {
          marker: "!",
          tag: "span",
          token: "spoiler",
          nested: true,
          placement: "before-emphasis",
          attrs: [["class", "spoiler"]],
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        });

      expect(md.render("!!==highlighted== ^sup^ spoiler!!")).toEqual(
        '<p><span class="spoiler"><mark>highlighted</mark> <sup>sup</sup> spoiler</span></p>\n',
      );
    });

    it("should support mixing before-emphasis and after-emphasis rules", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
          placement: "after-emphasis",
        });

      expect(md.render("==mark ^sup^ text==")).toEqual(
        "<p><mark>mark <sup>sup</sup> text</mark></p>\n",
      );
    });

    it("should support double non-nested + single non-nested stacked", () => {
      const md = MarkdownIt()
        .use(inlineRule, {
          marker: "%",
          tag: "span",
          token: "custom",
          double: true,
        })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        });

      expect(md.render("%%custom%% and ^sup^")).toEqual(
        "<p><span>custom</span> and <sup>sup</sup></p>\n",
      );
    });
  });

  describe("rule ordering and priority", () => {
    it("last registered rule takes precedence for same marker", () => {
      const md = MarkdownIt()
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        })
        .use(inlineRule, {
          marker: "^",
          tag: "sub",
          token: "sub",
        });

      // Last registration (sub) wins because it is added after in the ruler chain
      expect(md.render("^test^")).toEqual("<p><sub>test</sub></p>\n");
    });

    it("rules registered with different placements do not interfere", () => {
      const md = MarkdownIt()
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        })
        .use(inlineRule, {
          marker: "!",
          tag: "span",
          token: "spoiler",
          nested: true,
          placement: "after-emphasis",
          attrs: [["class", "spoiler"]],
        });

      expect(md.render("==mark== and !!spoiler!!")).toEqual(
        '<p><mark>mark</mark> and <span class="spoiler">spoiler</span></p>\n',
      );
    });

    it("ordering between custom rules is handled by registration order, not dependency arrays", () => {
      // This test demonstrates that simple before/after emphasis is sufficient
      // and complex dependency arrays (e.g., [['before', 'mark'], ['after', 'emphasis']])
      // are not needed — rules work correctly regardless of registration order
      const md1 = MarkdownIt()
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        })
        .use(inlineRule, {
          marker: "!",
          tag: "span",
          token: "spoiler",
          nested: true,
          placement: "before-emphasis",
          attrs: [["class", "spoiler"]],
        });

      const md2 = MarkdownIt()
        .use(inlineRule, {
          marker: "!",
          tag: "span",
          token: "spoiler",
          nested: true,
          placement: "before-emphasis",
          attrs: [["class", "spoiler"]],
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          nested: true,
          placement: "before-emphasis",
        });

      // Both orderings produce the same correct output
      const input = "!!spoiler with ==mark== inside!!";
      const expected =
        '<p><span class="spoiler">spoiler with <mark>mark</mark> inside</span></p>\n';

      expect(md1.render(input)).toEqual(expected);
      expect(md2.render(input)).toEqual(expected);
    });
  });
});
