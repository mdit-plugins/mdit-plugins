import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { cjkBreaks } from "../src/index.js";
import { processInlines } from "../src/plugin.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(cjkBreaks);

/**
 * Create a token for token-level tests
 *
 * @param type Token type
 * @param content Token content
 * @returns Token
 */
const createToken = (type: string, content: string): Token => {
  const token = new MarkdownIt.Token(type, "", 0);

  token.content = content;

  return token;
};

describe(cjkBreaks, () => {
  describe("cjk line breaks", () => {
    it("should remove soft breaks between East Asian characters", () => {
      const testCases = [
        ["あおえ\nいう", "<p>あおえいう</p>\n"],
        ["あ\nい", "<p>あい</p>\n"],
        ["漢字\nかな", "<p>漢字かな</p>\n"],
        ["！＂＃\n＄％", "<p>！＂＃＄％</p>\n"],
        ["ｱｵｴ\nｲｳ", "<p>ｱｵｴｲｳ</p>\n"],
        ["！\n＄", "<p>！＄</p>\n"],
        ["ｱ\nｲ", "<p>ｱｲ</p>\n"],
        ["𩸽\n🈀", "<p>𩸽🈀</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should remove soft breaks adjacent to zero-width spaces", () => {
      const testCases = [
        ["foo\u200B\nbar", "<p>foo\u200Bbar</p>\n"],
        ["foo\n\u200Bbar", "<p>foo\u200Bbar</p>\n"],
        ["foo\u200B\nbar\n\u200Bbaz", "<p>foo\u200Bbar\u200Bbaz</p>\n"],
        ["\u200B\n\u200B", "<p>\u200B\u200B</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("non-CJK line breaks", () => {
    it("should keep soft breaks in other cases", () => {
      const testCases = [
        ["a\nb", "<p>a\nb</p>\n"],
        ["Hello\nWorld", "<p>Hello\nWorld</p>\n"],
        ["foo\nbar\nbaz", "<p>foo\nbar\nbaz</p>\n"],
        ["あ\na", "<p>あ\na</p>\n"],
        ["a\nあ", "<p>a\nあ</p>\n"],
        ["あおえ\naoe\nあおえ", "<p>あおえ\naoe\nあおえ</p>\n"],
        ["a\n\nb", "<p>a</p>\n<p>b</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("hangul", () => {
    it("should keep soft breaks adjacent to Hangul", () => {
      const testCases = [
        ["ㅏㅗㅔ\nㅣㅜ", "<p>ㅏㅗㅔ\nㅣㅜ</p>\n"],
        ["가나\n다라", "<p>가나\n다라</p>\n"],
        ["한국어\n테스트", "<p>한국어\n테스트</p>\n"],
        ["あ\nㅏ", "<p>あ\nㅏ</p>\n"],
        ["ㅏ\nあ", "<p>ㅏ\nあ</p>\n"],
        // U+302E/U+302F are combining Hangul tone marks (East Asian Width: wide)
        ["！\n\u302E", "<p>！\n\u302E</p>\n"],
        ["\u302F\n！", "<p>\u302F\n！</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("hard breaks", () => {
    it("should keep hard breaks", () => {
      const testCases = [
        ["あ  \nい", "<p>あ<br>\nい</p>\n"],
        ["あ\\\nい", "<p>あ<br>\nい</p>\n"],
        ["a  \nb", "<p>a<br>\nb</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("nested blocks", () => {
    it("should process nested block contents", () => {
      const testCases = [
        ["> あ\n> い", "<blockquote>\n<p>あい</p>\n</blockquote>\n"],
        ["- あ\n- い", "<ul>\n<li>あ</li>\n<li>い</li>\n</ul>\n"],
        ["1. あ\n2. い", "<ol>\n<li>あ</li>\n<li>い</li>\n</ol>\n"],
        ["## あ\n## い", "<h2>あ</h2>\n<h2>い</h2>\n"],
        ["> a\n> b", "<blockquote>\n<p>a\nb</p>\n</blockquote>\n"],
        ["> あ\n>\n> い", "<blockquote>\n<p>あ</p>\n<p>い</p>\n</blockquote>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("inline markup", () => {
    it("should handle inline markup between soft breaks", () => {
      const testCases = [
        ["*あおえ*\n*いう*", "<p><em>あおえ</em><em>いう</em></p>\n"],
        ["**あ**\n**い**", "<p><strong>あ</strong>\n<strong>い</strong></p>\n"],
        ["あ\n**a**", "<p>あ\n<strong>a</strong></p>\n"],
        ["**foo**\nbar", "<p><strong>foo</strong>\nbar</p>\n"],
        ["![img](image.png)\ntext", '<p><img src="image.png" alt="img">\ntext</p>\n'],
        ["`あ`\n`い`", "<p><code>あ</code>\n<code>い</code></p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("non-BMP characters and surrogates", () => {
    it("should handle non-BMP characters and stray surrogates", () => {
      const testCases = [
        ["a\uD800\uD800\nあ", "<p>a\uD800\uD800\nあ</p>\n"],
        ["a\uDC00\uDC00\nあ", "<p>a\uDC00\uDC00\nあ</p>\n"],
        ["🈀\n🈀", "<p>🈀🈀</p>\n"],
        ["foo🈀\n🈀foo", "<p>foo🈀🈀foo</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle documents without soft breaks", () => {
      expect(markdownIt.render("")).toBe("");
      expect(markdownIt.render("あ い")).toBe("<p>あ い</p>\n");
      expect(markdownIt.render("a")).toBe("<p>a</p>\n");
      expect(markdownIt.render("あ")).toBe("<p>あ</p>\n");
      expect(markdownIt.render("あ\nい\nう")).toBe("<p>あいう</p>\n");
    });
  });

  describe("inline token processing", () => {
    it("should stop at empty text tokens", () => {
      const tokens = [
        createToken("text", "あ"),
        createToken("text", ""),
        createToken("softbreak", ""),
        createToken("text", ""),
        createToken("text", "い"),
      ];

      processInlines(tokens);

      expect(tokens[2].type).toBe("softbreak");
    });
  });

  describe("plugin installation", () => {
    it("should be safe to install twice", () => {
      const instance = new MarkdownIt({ linkify: true }).use(cjkBreaks).use(cjkBreaks);

      expect(instance.render("あ\nい")).toBe("<p>あい</p>\n");
      expect(instance.render("a\nb")).toBe("<p>a\nb</p>\n");
    });
  });
});
