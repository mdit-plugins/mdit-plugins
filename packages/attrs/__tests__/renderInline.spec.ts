/**
 * Tests for md.renderInline() behavior.
 *
 * Why renderInline() was crashing while render() was not:
 *
 * md.render() produces multiple top-level tokens, e.g.:
 *   [paragraph_open, inline, paragraph_close]
 *
 * md.renderInline() produces only ONE top-level token:
 *   [inline]
 *
 * The softbreak rule searches forward from the current inline token index to
 * find a matching opening block token:
 *   getMatchingOpeningToken(tokens, index + 1)
 *
 * With render, tokens[index+1] is paragraph_close — a valid token.
 * With renderInline, tokens[index+1] is undefined — out of bounds, causing:
 *   TypeError: Cannot read properties of undefined (reading 'type')
 *
 * The null guard added to getMatchingOpeningToken() prevents this crash and
 * returns null, which addAttrs() handles safely by doing nothing.
 */

import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../src/index.js";

describe("renderInline", () => {
  const markdownIt = MarkdownIt().use(attrs);

  describe("inline nesting self-close", () => {
    it("should apply attrs to code_inline", () => {
      expect(markdownIt.renderInline("`code`{.desc}")).toBe('<code class="desc">code</code>');
    });

    it("should apply multiple attrs to code_inline", () => {
      expect(markdownIt.renderInline("`code`{.a #id}")).toBe('<code class="a" id="id">code</code>');
    });
  });

  describe("inline attributes (closing tag before attrs text)", () => {
    it("should apply attrs to strong", () => {
      expect(markdownIt.renderInline("**bold**{.desc}")).toBe('<strong class="desc">bold</strong>');
    });

    it("should apply attrs to em", () => {
      expect(markdownIt.renderInline("*em*{.desc}")).toBe('<em class="desc">em</em>');
    });

    it("should apply attrs to nested inline elements", () => {
      expect(markdownIt.renderInline("**bold *em*{.b}**{.a}")).toBe(
        '<strong class="a">bold <em class="b">em</em></strong>',
      );
    });
  });

  describe("softbreak rule", () => {
    it("should not throw and remove softbreak and attrs tokens when attrs follow a softbreak", () => {
      // The softbreak rule's getMatchingOpeningToken(tokens, index+1) accesses
      // tokens[1] which is undefined in renderInline (only one top-level token).
      // The null guard prevents a TypeError crash.
      // Since there is no block token to apply attrs to in renderInline,
      // addAttrs receives null and is a no-op; the softbreak and attrs text
      // are still consumed (removed from children).
      expect(() => markdownIt.renderInline("some text\n{.desc}")).not.toThrow();
      expect(markdownIt.renderInline("some text\n{.desc}")).toBe("some text");
    });

    it("should not throw and consume softbreak and attrs when no block target exists", () => {
      expect(() => markdownIt.renderInline("**bold**\n{.desc}")).not.toThrow();
      expect(markdownIt.renderInline("**bold**\n{.desc}")).toBe("<strong>bold</strong>");
    });
  });
});
