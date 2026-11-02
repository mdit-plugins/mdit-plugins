import { readFileSync } from "node:fs";

import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { cjkBreaks } from "../src/index.js";
import { processInlines } from "../src/plugin.js";

const md = new MarkdownIt().use(cjkBreaks);

/** A parsed `cjk_breaks.txt` fixture */
interface FixtureCase {
  /** Fixture header / 测试用例标题 */
  readonly name: string;
  /** Markdown input / Markdown 输入 */
  readonly input: string;
  /** Expected HTML output without the trailing newline / 期望的 HTML 输出（不含末尾换行） */
  readonly expected: string;
}

/**
 * Parse the upstream `markdown-it-testgen` fixture format
 *
 * @param source Fixture file content
 * @returns Parsed fixtures
 */
const parseFixtures = (source: string): FixtureCase[] => {
  const fixtures: FixtureCase[] = [];
  let name = "";
  let input: string[] = [];
  let expected: string[] = [];
  let state = 0;

  for (const line of source.split(/\r?\n/)) {
    if (line === ".") {
      if (state === 0) {
        state = 1;
      } else if (state === 1) {
        state = 2;
      } else {
        fixtures.push({ name, input: input.join("\n"), expected: expected.join("\n") });
        name = "";
        input = [];
        expected = [];
        state = 0;
      }

      continue;
    }

    if (state === 0) name = name === "" ? line : `${name}\n${line}`;
    else if (state === 1) input.push(line);
    else expected.push(line);
  }

  return fixtures;
};

/**
 * Create a minimal token for token-level tests
 *
 * @param type Token type
 * @param content Token content
 * @returns Token
 */
const createToken = (type: string, content: string): Token =>
  ({ type, content }) as unknown as Token;

const fixtures = parseFixtures(
  readFileSync(new URL("__fixtures__/cjk_breaks.txt", import.meta.url), "utf-8"),
);

describe(cjkBreaks, () => {
  describe("upstream fixtures", () => {
    it("should match every upstream fixture", () => {
      const mismatches = fixtures
        .filter((fixture) => md.render(fixture.input) !== `${fixture.expected}\n`)
        .map((fixture) => fixture.name);

      expect(mismatches).toStrictEqual([]);
    });
  });

  describe("rendered output", () => {
    it("should remove soft breaks between CJK characters", () => {
      expect(md.render("あ\nい")).toBe("<p>あい</p>\n");
    });

    it("should keep soft breaks between Latin characters", () => {
      expect(md.render("a\nb")).toBe("<p>a\nb</p>\n");
    });

    it("should keep soft breaks between CJK and Latin characters", () => {
      expect(md.render("あ\na")).toBe("<p>あ\na</p>\n");
      expect(md.render("a\nあ")).toBe("<p>a\nあ</p>\n");
    });

    it("should remove soft breaks adjacent to a zero-width space", () => {
      expect(md.render("foo\u200B\nbar")).toBe("<p>foo\u200Bbar</p>\n");
      expect(md.render("foo\n\u200Bbar")).toBe("<p>foo\u200Bbar</p>\n");
    });

    it("should handle halfwidth and fullwidth characters", () => {
      expect(md.render("ｱ\nｲ")).toBe("<p>ｱｲ</p>\n");
      expect(md.render("！\n＄")).toBe("<p>！＄</p>\n");
    });

    it("should keep soft breaks adjacent to Hangul", () => {
      expect(md.render("ㅏ\nㅏ")).toBe("<p>ㅏ\nㅏ</p>\n");
      expect(md.render("あ\nㅏ")).toBe("<p>あ\nㅏ</p>\n");
      expect(md.render("ㅏ\nあ")).toBe("<p>ㅏ\nあ</p>\n");
    });

    it("should handle non-BMP characters", () => {
      expect(md.render("🈀\n🈀")).toBe("<p>🈀🈀</p>\n");
      expect(md.render("foo🈀\n🈀foo")).toBe("<p>foo🈀🈀foo</p>\n");
    });

    it("should handle stray surrogates", () => {
      expect(md.render("a\uD800\uD800\nあ")).toBe("<p>a\uD800\uD800\nあ</p>\n");
      expect(md.render("a\uDC00\uDC00\nあ")).toBe("<p>a\uDC00\uDC00\nあ</p>\n");
    });

    it("should not touch hard breaks, spaces and empty input", () => {
      expect(md.render("あ  \nい")).toBe("<p>あ<br>\nい</p>\n");
      expect(md.render("あ い")).toBe("<p>あ い</p>\n");
      expect(md.render("")).toBe("");
    });

    it("should process nested block contents", () => {
      expect(md.render("> あ\n> い")).toBe("<blockquote>\n<p>あい</p>\n</blockquote>\n");
      expect(md.render("- あ\n- い")).toBe("<ul>\n<li>あ</li>\n<li>い</li>\n</ul>\n");
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

    it("should skip non-text tokens while looking for adjacent characters", () => {
      const tokens = [
        createToken("text", "あ"),
        createToken("em_open", ""),
        createToken("text", "い"),
        createToken("em_close", ""),
        createToken("softbreak", ""),
        createToken("text", "う"),
      ];

      processInlines(tokens);

      expect(tokens[4].type).toBe("text");
      expect(tokens[4].content).toBe("");
    });

    it("should ignore token streams without soft breaks", () => {
      const tokens = [createToken("text", "あ"), createToken("text", "い")];

      processInlines(tokens);

      expect(tokens).toStrictEqual([
        { type: "text", content: "あ" },
        { type: "text", content: "い" },
      ]);
    });
  });

  describe("plugin installation", () => {
    it("should be safe to install twice", () => {
      const instance = new MarkdownIt().use(cjkBreaks).use(cjkBreaks);

      expect(instance.render("あ\nい")).toBe("<p>あい</p>\n");
      expect(instance.render("a\nb")).toBe("<p>a\nb</p>\n");
    });
  });
});
