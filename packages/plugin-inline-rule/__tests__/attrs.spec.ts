import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

const createAttrs = (): [string, string][] => [
  ["class", "custom"],
  ["tabindex", "-1"],
];

const getOpenTokens = (md: MarkdownItType, src: string): Token[] =>
  md
    .parse(src, {})
    .flatMap((token) => token.children ?? [])
    .filter(({ type }) => type.endsWith("_open"));

describe("attrs", () => {
  describe("nested rule", () => {
    const createMd = (attrs: [string, string][]): MarkdownItType =>
      new MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "span",
        token: "highlight",
        nested: true,
        double: true,
        placement: "before-emphasis",
        attrs,
      });

    it("should assign independent attrs to each token", () => {
      const attrs = createAttrs();
      const tokens = getOpenTokens(createMd(attrs), "==a==\n\n==b==");

      expect(tokens).toHaveLength(2);
      expect(tokens[0].attrs).toStrictEqual(createAttrs());
      expect(tokens[1].attrs).toStrictEqual(createAttrs());
      expect(tokens[0].attrs).not.toBe(tokens[1].attrs);
      expect(tokens[0].attrs?.[0]).not.toBe(tokens[1].attrs?.[0]);

      // `Token#attrJoin` mutates inner attribute arrays in place, which is
      // exactly what `@mdit/plugin-attrs` does when applying attributes.
      tokens[0].attrJoin("class", "extra");

      expect(tokens[0].attrs).toStrictEqual([
        ["class", "custom extra"],
        ["tabindex", "-1"],
      ]);
      expect(tokens[1].attrs).toStrictEqual(createAttrs());
      expect(attrs).toStrictEqual(createAttrs());
    });

    it("should not accumulate attrs across repeated renders", () => {
      const md = createMd(createAttrs());

      md.renderer.rules.highlight_open = (tokens, index, options, _env, self): string => {
        tokens[index].attrJoin("class", "extra");

        return self.renderToken(tokens, index, options);
      };

      const expected = '<p><span class="custom extra" tabindex="-1">a</span></p>\n';

      expect(md.render("==a==")).toBe(expected);
      expect(md.render("==a==")).toBe(expected);
    });
  });

  describe("non-nested rule", () => {
    const createMd = (attrs: [string, string][]): MarkdownItType =>
      new MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        attrs,
      });

    it("should assign independent attrs to each token", () => {
      const attrs = createAttrs();
      const tokens = getOpenTokens(createMd(attrs), "^a^\n\n^b^");

      expect(tokens).toHaveLength(2);
      expect(tokens[0].attrs).toStrictEqual(createAttrs());
      expect(tokens[1].attrs).toStrictEqual(createAttrs());
      expect(tokens[0].attrs).not.toBe(tokens[1].attrs);
      expect(tokens[0].attrs?.[0]).not.toBe(tokens[1].attrs?.[0]);

      tokens[0].attrJoin("class", "extra");

      expect(tokens[0].attrs).toStrictEqual([
        ["class", "custom extra"],
        ["tabindex", "-1"],
      ]);
      expect(tokens[1].attrs).toStrictEqual(createAttrs());
      expect(attrs).toStrictEqual(createAttrs());
    });

    it("should not accumulate attrs across repeated renders", () => {
      const md = createMd(createAttrs());

      md.renderer.rules.sup_open = (tokens, index, options, _env, self): string => {
        tokens[index].attrJoin("class", "extra");

        return self.renderToken(tokens, index, options);
      };

      const expected = '<p><sup class="custom extra" tabindex="-1">a</sup></p>\n';

      expect(md.render("^a^")).toBe(expected);
      expect(md.render("^a^")).toBe(expected);
    });
  });
});
