import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode ? `<block>${content.trim()}</block>` : `{Tex content: ${content.trim()}}`;

const createMd = (delimiters: "brackets" | "dollars"): MarkdownItType =>
  new MarkdownIt().use(tex, { delimiters, render });

describe("inline tex posMax boundaries", () => {
  describe("bracket delimiters", () => {
    it("should not swallow the closing bracket of a link label", () => {
      expect(createMd("brackets").render(String.raw`[\(a](url)\)`)).toBe(
        '<p><a href="url">(a</a>)</p>\n',
      );
    });

    it("should still parse inline tex inside link labels", () => {
      expect(createMd("brackets").render(String.raw`[\(a\)](url)`)).toBe(
        '<p><a href="url">{Tex content: a}</a></p>\n',
      );
    });
  });

  describe("dollar delimiters", () => {
    it("should not swallow the closing bracket of a link label", () => {
      expect(createMd("dollars").render("[$a](url)$")).toBe('<p><a href="url">$a</a>$</p>\n');
    });

    it("should still parse inline tex inside link labels", () => {
      expect(createMd("dollars").render("[$a$](url)")).toBe(
        '<p><a href="url">{Tex content: a}</a></p>\n',
      );
    });
  });
});
