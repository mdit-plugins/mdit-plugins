import { readFileSync } from "node:fs";

import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { cjkFriendly } from "../src/index.js";

const md = new MarkdownIt().use(cjkFriendly);
const mdOriginal = new MarkdownIt();

/**
 * Read a fixture file
 *
 * @param name Fixture file name
 * @returns File content
 */
const readFixture = (name: string): string =>
  readFileSync(new URL(`__fixtures__/${name}`, import.meta.url), "utf-8");

/** A CommonMark spec test case */
interface CommonMarkTestCase {
  readonly example: number;
  readonly markdown: string;
}

const commonMarkTestCases = JSON.parse(readFixture("commonmark.json")) as CommonMarkTestCase[];

describe(cjkFriendly, () => {
  describe("strong emphasis", () => {
    it("should convert ** around Kana/Han to <strong>", () => {
      const result = md.render(readFixture("strong.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toMatch(/\*\*[^\n]+\*\*/u);

      expect(result).toMatchSnapshot();
    });

    it("should convert ** around Korean to <strong>", () => {
      const result = md.render(readFixture("korean.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toMatch(/\*\*[^\n]+\*\*/u);

      expect(result).toMatchSnapshot();
    });

    it("should convert ** around pseudo-emoji to <strong>", () => {
      const result = md.render(readFixture("pseudo-emoji.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toMatch(/\*\*[^\n]+\*\*/u);

      expect(result).toMatchSnapshot();
    });

    it("should not recognize non-BMP punctuation and symbols", () => {
      const result = md.render(readFixture("non-bmp.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toContain("<strong>");

      expect(result).toMatchSnapshot();
    });

    it("should process underscores around CJK punctuation", () => {
      const result = md.render(readFixture("underscore-cjk-punct.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toContain("_");

      expect(result).toMatchSnapshot();
    });

    it("should render the reference README example", () => {
      const result = md.render(readFixture("readme-example.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toMatch(/\*\*[^\n]+\*\*/u);

      expect(result).toMatchSnapshot();
    });
  });

  describe("gfm strikethrough", () => {
    it("should convert ~~ around CJK to <del>", () => {
      const result = md.render(readFixture("gfm-strikethrough.md"));

      for (const line of result.split(/\r?\n/)) expect(line).not.toMatch(/~~[^\n]+~~/u);

      expect(result).toContain("<s>");
      expect(result).toMatchSnapshot();
    });

    it("should keep the output for non-CJK GFM strikethrough unchanged", () => {
      const source = readFixture("gfm-non-cjk.md");
      const result = md.render(source);

      expect(result).toContain("<s>");
      expect(result).toBe(mdOriginal.render(source));
    });
  });

  describe("commonmark compatibility", () => {
    it("should keep the CommonMark output unchanged", () => {
      const mismatches = commonMarkTestCases
        .filter(({ markdown }) => md.render(markdown) !== mdOriginal.render(markdown))
        .map(({ example }) => example);

      expect(mismatches).toStrictEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle spaces adjacent to markers", () => {
      expect(md.render("** a**")).toBe("<p>** a**</p>\n");
      expect(md.render("a **b**")).toBe("<p>a <strong>b</strong></p>\n");
      expect(md.render("a**")).toBe("<p>a**</p>\n");
    });

    it("should handle CJK punctuation adjacent to markers", () => {
      expect(md.render("。**あ**")).toBe("<p>。<strong>あ</strong></p>\n");
      expect(md.render("あ**。**あ")).toBe("<p>あ<strong>。</strong>あ</p>\n");
    });

    it("should handle narrow characters above the Hangul block", () => {
      expect(md.render("a**⟦**a")).toBe("<p>a**⟦**a</p>\n");
      expect(md.render("⟦**a**")).toBe("<p>⟦<strong>a</strong></p>\n");
      expect(md.render("a**b⟧**")).toBe("<p>a<strong>b⟧</strong></p>\n");
    });

    it("should handle halfwidth characters", () => {
      expect(md.render("a**ｱ**a")).toBe("<p>a<strong>ｱ</strong>a</p>\n");
    });

    it("should not treat emoji presentation characters as CJK", () => {
      expect(md.render("a**😀**a")).toBe("<p>a**😀**a</p>\n");
      expect(md.render("a**👩**a")).toBe("<p>a**👩**a</p>\n");
      expect(md.render("a**❤️**a")).toBe("<p>a**❤️**a</p>\n");
    });

    it("should handle variation selectors", () => {
      expect(md.render("a\uFE00**b**")).toBe("<p>a\uFE00<strong>b</strong></p>\n");
      expect(md.render("a \uFE00**b**")).toBe("<p>a \uFE00<strong>b</strong></p>\n");
      expect(md.render("\uFE00**b**")).toBe("<p>\uFE00<strong>b</strong></p>\n");
      expect(md.render("a ”\uFE00**b**")).toBe("<p>a ”\uFE00<strong>b</strong></p>\n");
      expect(md.render("∇\uFE01**b**")).toBe("<p>∇\uFE01<strong>b</strong></p>\n");
      expect(md.render("**“︁Git”︁**Hub")).toBe("<p><strong>“︁Git”︁</strong>Hub</p>\n");
    });

    it("should handle ideographic variation selectors", () => {
      expect(md.render("禰󠄀**a**")).toBe("<p>禰󠄀<strong>a</strong></p>\n");
      expect(md.render("a**禰󠄀**a")).toBe("<p>a<strong>禰󠄀</strong>a</p>\n");
    });

    it("should handle Hangul", () => {
      expect(md.render("ᅡ**(a)**")).toBe("<p>ᅡ<strong>(a)</strong></p>\n");
      expect(md.render("ㅏ**a**")).toBe("<p>ㅏ<strong>a</strong></p>\n");
      expect(md.render("ᄏ**(k)**")).toBe("<p>ᄏ<strong>(k)</strong></p>\n");
    });

    it("should handle non-BMP characters", () => {
      expect(md.render("𰻞**（x）**")).toBe("<p>𰻞<strong>（x）</strong></p>\n");
    });

    it("should keep intraword underscores literal", () => {
      expect(md.render("foo_bar_baz")).toBe("<p>foo_bar_baz</p>\n");
      expect(md.render("あ_い_う")).toBe("<p>あ_い_う</p>\n");
    });

    it("should handle stray surrogates", () => {
      expect(md.render("a\uDC00**b**")).toBe("<p>a\uDC00<strong>b</strong></p>\n");
      expect(md.render("\uDC00**a**")).toBe("<p>\uDC00<strong>a</strong></p>\n");
    });

    it("should handle newlines inside strong emphasis", () => {
      expect(md.render("**あ\nい**")).toBe("<p><strong>あ\nい</strong></p>\n");
    });
  });

  describe("plugin installation", () => {
    it("should be safe to install twice", () => {
      const instance = new MarkdownIt().use(cjkFriendly).use(cjkFriendly);

      expect(instance.render("**あ**")).toBe("<p><strong>あ</strong></p>\n");
      expect(instance.render("a**b**c")).toBe("<p>a<strong>b</strong>c</p>\n");
    });
  });
});
