import MarkdownIt from "markdown-it";
import type { StateCore, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import type { FootNoteMeta } from "../src/index.js";
import { footnote } from "../src/index.js";

const createMarkdown = (): InstanceType<typeof MarkdownIt> => new MarkdownIt().use(footnote);

const collectTokens = (tokens: Token[]): Token[] => {
  const result: Token[] = [];

  for (const token of tokens) {
    result.push(token);

    if (token.children) result.push(...collectTokens(token.children));
  }

  return result;
};

const findToken = (tokens: Token[], type: string): Token => {
  const result = collectTokens(tokens).find((token) => token.type === type);

  if (!result) throw new Error(`Missing token ${type}`);

  return result;
};

const findTokens = (tokens: Token[], type: string): Token[] =>
  collectTokens(tokens).filter((token) => token.type === type);

const stripAttrs = (state: StateCore): void => {
  for (const token of collectTokens(state.tokens)) token.attrs = null;
};

const customizeAttrs = (state: StateCore): void => {
  for (const token of collectTokens(state.tokens)) {
    if (token.type === "footnote_ref") token.attrJoin("class", "custom-ref");
    if (token.type === "footnote_open") token.attrJoin("class", "custom-item");
    if (token.type === "footnote_anchor") token.attrSet("aria-label", "back");
  }
};

const customizeMeta = (state: StateCore): void => {
  for (const token of collectTokens(state.tokens)) {
    const meta = token.meta as unknown as FootNoteMeta;

    if (token.type === "footnote_ref") meta.href = "#custom-ref";
    if (token.type === "footnote_anchor") meta.text = "up";
  }
};

describe("footnote token data", () => {
  it("should resolve render data while parsing", () => {
    const md = createMarkdown();
    const tokens = md.parse("text[^1] and^[inline]\n\n[^1]: note", { docId: "doc" });
    const refTokens = findTokens(tokens, "footnote_ref");

    expect(refTokens).toHaveLength(2);
    expect(refTokens[0].attrs).toStrictEqual([["class", "footnote-ref"]]);
    expect(refTokens[0].meta).toStrictEqual({
      id: 0,
      subId: 0,
      label: "1",
      href: "#footnote-doc-1",
      anchorId: "footnote-ref-doc-1",
      anchorClass: "footnote-anchor",
    });
    expect(refTokens[1].meta).toMatchObject({
      id: 1,
      href: "#footnote-doc-2",
      anchorId: "footnote-ref-doc-2",
    });

    const blockOpenToken = findToken(tokens, "footnote_block_open");

    expect(blockOpenToken.attrs).toStrictEqual([["class", "footnotes"]]);
    expect(blockOpenToken.meta).toStrictEqual({
      separatorClass: "footnotes-sep",
      listClass: "footnotes-list",
    });

    const openToken = findToken(tokens, "footnote_open");

    expect(openToken.attrs).toStrictEqual([
      ["id", "footnote-doc-1"],
      ["class", "footnote-item"],
    ]);

    const anchorToken = findToken(tokens, "footnote_anchor");

    expect(anchorToken.attrs).toStrictEqual([
      ["href", "#footnote-ref-doc-1"],
      ["class", "footnote-backref"],
    ]);
    expect(anchorToken.meta).toMatchObject({ id: 0, subId: 0, text: "\u21A9\uFE0E" });
  });

  it("should keep raw docId in tokens and escape it only when rendering", () => {
    const md = createMarkdown();
    const docId = 'a"b';
    const source = "text[^1]\n\n[^1]: note";
    const openToken = findToken(md.parse(source, { docId }), "footnote_open");

    expect(openToken.attrGet("id")).toBe('footnote-a"b-1');
    expect(md.render(source, { docId })).toContain('id="footnote-a&quot;b-1"');
  });

  it("should render only the token attributes", () => {
    const md = createMarkdown();

    md.core.ruler.after("footnoteTail", "strip-footnote-attrs", stripAttrs);

    const output = md.render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<sup><a href="#footnote1">[1]</a>');
    expect(output).toContain("<li><p>note");
    expect(output).toContain("<section>");
    expect(output).toContain('<hr class="footnotes-sep">');
  });

  it("should allow a core rule to change token attributes", () => {
    const md = createMarkdown();

    md.core.ruler.after("footnoteTail", "customize-footnote", customizeAttrs);

    const output = md.render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<sup class="footnote-ref custom-ref">');
    expect(output).toContain('<li id="footnote1" class="footnote-item custom-item">');
    expect(output).toContain(
      '<a href="#footnote-ref1" class="footnote-backref" aria-label="back">',
    );
  });

  it("should allow a core rule to change token metadata", () => {
    const md = createMarkdown();

    md.core.ruler.after("footnoteTail", "customize-footnote", customizeMeta);

    const output = md.render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<a href="#custom-ref">[1]</a>');
    expect(output).toContain(">up</a>");
  });

  it("should keep the caption renderer rule overridable", () => {
    const md = createMarkdown();

    md.renderer.rules.footnote_caption = (): string => "[X]";

    const output = md.render("text[^1] and[^1]\n\n[^1]: note");

    expect(output).toContain('href="#footnote1">[X]</a>');
    expect(output).toContain('id="footnote-ref1:1"');
  });

  it("should keep apostrophes in a docId unescaped in every generated attribute", () => {
    const md = createMarkdown();
    const docId = "a'b";
    const output = md.render("text[^1]\n\n[^1]: note", { docId });

    // Attribute values are double-quoted, so an apostrophe is safe. Compared with 1.2.0 it is no
    // longer serialized as `&#39;` anywhere, which keeps all generated ids and hrefs consistent.
    expect(output).toContain(`href="#footnote-a'b-1"`);
    expect(output).toContain(`id="footnote-ref-a'b-1"`);
    expect(output).toContain(`id="footnote-a'b-1"`);
    expect(output).toContain(`href="#footnote-ref-a'b-1"`);
    expect(output).not.toContain("&#39;");
  });
});
