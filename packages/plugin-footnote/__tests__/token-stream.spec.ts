import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../src/index.js";

const collectTokens = (tokens: Token[]): Token[] => {
  const result: Token[] = [];

  for (const token of tokens) {
    result.push(token);
    if (token.children) result.push(...collectTokens(token.children));
  }

  return result;
};

const getTokens = (markdown: string, env: Record<string, unknown> = {}): Token[] =>
  new MarkdownIt().use(footnote).parse(markdown, env);

const findLastInlineToken = (tokens: Token[]): Token => {
  for (let index = tokens.length - 1; index >= 0; index--) {
    const token = tokens[index];

    if (token.type === "inline") return token;
  }

  throw new Error("No inline token found");
};

const findLastToken = (tokens: Token[], type: string): Token => {
  for (let index = tokens.length - 1; index >= 0; index--) {
    const token = tokens[index];

    if (token.type === type) return token;
  }

  throw new Error(`No ${type} token found`);
};

describe("footnote standard tokens", () => {
  it("should not emit plugin-specific token types", () => {
    const tokens = getTokens("A[^a] B[^b]\n\n[^a]: one\n\n[^b]: two");
    const types = collectTokens(tokens).map((token) => token.type);

    expect(types.some((type) => type.startsWith("footnote_"))).toBe(false);
  });

  it("should assign standard nesting levels", () => {
    const tokens = getTokens("A[^a]\n\n[^a]: note");
    const sectionOpenToken = tokens.find((token) => token.type === "section_open")!;
    const orderedListOpenToken = tokens.find((token) => token.type === "ordered_list_open")!;
    const listItemOpenToken = tokens.find((token) => token.type === "list_item_open")!;
    const listItemOpenIndex = tokens.indexOf(listItemOpenToken);
    const paragraphOpenToken = tokens[listItemOpenIndex + 1];
    const inlineToken = tokens[listItemOpenIndex + 2];
    const sectionCloseToken = tokens.find((token) => token.type === "section_close")!;

    expect(sectionOpenToken.level).toBe(0);
    expect(orderedListOpenToken.level).toBe(1);
    expect(listItemOpenToken.level).toBe(2);
    expect(paragraphOpenToken.level).toBe(3);
    expect(inlineToken.level).toBe(4);
    expect(sectionCloseToken.level).toBe(0);
  });

  it("should expose generated attributes on tokens", () => {
    const tokens = getTokens("A[^a]\n\n[^a]: note");
    const inlineToken = tokens.find((token) => token.type === "inline")!;
    const children = inlineToken.children!;

    expect(children.map((token) => token.type)).toStrictEqual([
      "text",
      "sup_open",
      "link_open",
      "text",
      "link_close",
      "link_open",
      "link_close",
      "sup_close",
    ]);
    expect(children.map((token) => token.level)).toStrictEqual([0, 0, 1, 2, 1, 1, 1, 0]);
    expect(children[1].attrs).toStrictEqual([["class", "footnote-ref"]]);
    expect(children[2].attrs).toStrictEqual([["href", "#footnote1"]]);
    expect(children[3].content).toBe("[1]");
    expect(children[5].attrs).toStrictEqual([
      ["class", "footnote-anchor"],
      ["id", "footnote-ref1"],
    ]);
  });

  it("should set standard block flags", () => {
    const tokens = getTokens("A[^a]\n\n[^a]: note");
    const listItemOpenIndex = tokens.findIndex((token) => token.type === "list_item_open");
    const listItemOpenToken = tokens[listItemOpenIndex];
    const blockTokens = tokens.filter((token) =>
      [
        "hr",
        "section_open",
        "ordered_list_open",
        "paragraph_open",
        "inline",
        "paragraph_close",
        "list_item_close",
        "ordered_list_close",
        "section_close",
      ].includes(token.type),
    );

    expect(blockTokens.every((token) => token.block)).toBe(true);
    // Deliberate: a block-level `<li>` opening token would make the default renderer emit a
    // newline before the paragraph, changing the historical single-line `<li><p>` output.
    expect(listItemOpenToken.block).toBe(false);
  });

  it("should keep raw attribute values on tokens and escape them at render time", () => {
    const tokens = getTokens("A[^a]\n\n[^a]: note", { docId: 'a"b' });
    const children = tokens.find((token) => token.type === "inline")!.children!;

    expect(children[2].attrs).toStrictEqual([["href", '#footnote-a"b-1']]);
  });

  it("should append back-references to the last inline token", () => {
    const tokens = getTokens("A[^a]\n\n[^a]: note");
    const children = findLastInlineToken(tokens).children!;
    const backReferenceToken = findLastToken(children, "link_open");
    const backReferenceIndex = children.indexOf(backReferenceToken);

    expect(backReferenceToken.attrGet("href")).toBe("#footnote-ref1");
    // The leading space is merged into the previous text token by the `text_join` core rule.
    expect(children[backReferenceIndex - 1].content.endsWith(" ")).toBe(true);
    expect(backReferenceToken.attrs).toStrictEqual([
      ["href", "#footnote-ref1"],
      ["class", "footnote-backref"],
    ]);
    expect(children[backReferenceIndex].level).toBe(0);
    expect(children[backReferenceIndex + 1].content).toBe("\u21A9\uFE0E");
    expect(children[backReferenceIndex + 1].level).toBe(1);
    expect(children[backReferenceIndex + 2].type).toBe("link_close");
    expect(children[backReferenceIndex + 2].level).toBe(0);

    const listItemCloseIndex = tokens.findIndex((token) => token.type === "list_item_close");

    expect(tokens[listItemCloseIndex - 1].type).toBe("paragraph_close");
  });

  it("should keep back-references after block content", () => {
    const tokens = getTokens("A[^a]\n\n[^a]: # title");
    const listItemCloseIndex = tokens.findIndex((token) => token.type === "list_item_close");
    const backReferenceContainer = tokens[listItemCloseIndex - 1];

    expect(backReferenceContainer.type).toBe("inline");
    expect(backReferenceContainer.block).toBe(true);
    expect(backReferenceContainer.children!.map((token) => token.type)).toStrictEqual([
      "text",
      "link_open",
      "text",
      "link_close",
    ]);
    expect(backReferenceContainer.children!.map((token) => token.level)).toStrictEqual([
      0, 0, 1, 0,
    ]);
  });

  it("should keep image alt text free of reference markers", () => {
    const markdown = "![text[^a]](#img)\n\n[^a]: note";
    const tokens = getTokens(markdown);
    const allTokens = collectTokens(tokens);
    const imageToken = allTokens.find((token) => token.type === "image")!;

    expect(allTokens.some((token) => token.type.startsWith("footnote_"))).toBe(false);
    expect(imageToken.children!.some((token) => token.type === "footnote_ref")).toBe(false);

    const output = new MarkdownIt().use(footnote).render(markdown);

    expect(output).toContain('<img src="#img" alt="text">');
  });

  it("should strip reference markers from nested image alt text", () => {
    const markdown = "![outer ![inner[^a]](inner.png)](#outer.png)\n\n[^a]: note";
    const tokens = getTokens(markdown);
    const allTokens = collectTokens(tokens);
    const imageTokens = allTokens.filter((token) => token.type === "image");

    expect(allTokens.some((token) => token.type.startsWith("footnote_"))).toBe(false);
    expect(imageTokens.flatMap((token) => token.children!)).not.toContainEqual(
      expect.objectContaining({ type: "footnote_ref" }),
    );

    const output = new MarkdownIt().use(footnote).render(markdown);

    expect(output).toContain('alt="outer inner"');
  });

  it("should render attributes added to standard tokens by a core rule", () => {
    const markdownIt = new MarkdownIt().use(footnote);

    markdownIt.core.ruler.push("testAttrs", (state) => {
      const allTokens = collectTokens(state.tokens);
      const supOpenTokens = allTokens.filter((token) => token.type === "sup_open");
      const listItemOpenTokens = allTokens.filter((token) => token.type === "list_item_open");

      for (const token of supOpenTokens) token.attrJoin("class", "custom-ref");
      for (const token of listItemOpenTokens) token.attrSet("data-item", "custom");
    });

    const output = markdownIt.render("A[^a]\n\n[^a]: note");

    expect(output).toContain('<sup class="footnote-ref custom-ref">');
    expect(output).toContain('data-item="custom"');
  });

  it("should resolve env.docId while parsing", () => {
    const markdownIt = new MarkdownIt().use(footnote);
    const tokens = markdownIt.parse("A[^a]\n\n[^a]: note", { docId: "parse" });
    const html = markdownIt.renderer.render(tokens, markdownIt.options, { docId: "render" });

    expect(html).toContain('id="footnote-parse-1"');
    expect(html).toContain('href="#footnote-ref-parse-1"');
    expect(html).not.toContain("render");
  });

  it("should not duplicate back-references when the env is reused", () => {
    const markdownIt = new MarkdownIt().use(footnote);
    const env = {};
    const markdown = "A[^a] and ^[inline]\n\n[^a]: note";
    const first = markdownIt.render(markdown, env);
    const second = markdownIt.render(markdown, env);

    expect(first.match(/href="#footnote-ref1"/gu)).toHaveLength(1);
    expect(second.match(/href="#footnote-ref1"/gu)).toHaveLength(1);
  });

  it("should set standard block flags for inline notes", () => {
    const tokens = getTokens("A^[note]");
    const inlineToken = tokens.find((token) => token.type === "inline")!;
    const listItemOpenToken = tokens.find((token) => token.type === "list_item_open")!;
    const paragraphOpenTokens = tokens.filter((token) => token.type === "paragraph_open");
    const paragraphCloseTokens = tokens.filter((token) => token.type === "paragraph_close");

    expect(inlineToken.block).toBe(true);
    expect(paragraphOpenTokens.every((token) => token.block)).toBe(true);
    expect(paragraphCloseTokens.every((token) => token.block)).toBe(true);
    // Deliberate: see the block flag test for definition footnotes.
    expect(listItemOpenToken.block).toBe(false);
  });

  it("should stringify numeric option values on tokens", () => {
    const markdownIt = new MarkdownIt().use(footnote, {
      refAttrs: { "data-index": 1 },
    });
    const tokens = markdownIt.parse("A[^a]\n\n[^a]: note", {});
    const supOpenToken = collectTokens(tokens).find((token) => token.type === "sup_open")!;

    expect(supOpenToken.attrGet("data-index")).toBe("1");
  });
});
