import type { Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import {
  canonicalizeTokens,
  collapseWhitespace,
  composeNormalizers,
  findTokenDifference,
  normalizeHtml,
  removeMatches,
  replaceMatches,
  sortAttributes,
} from "../normalize.ts";

describe("html normalization", () => {
  it("sorts attributes alphabetically", () => {
    expect(normalizeHtml('<p class="a" id="b">text</p>')).toBe('<p class="a" id="b">text</p>');
    expect(normalizeHtml('<p id="b" class="a">text</p>')).toBe('<p class="a" id="b">text</p>');
  });

  it("keeps attribute values with spaces untouched", () => {
    expect(normalizeHtml('<p title="a b" class="c">x</p>')).toBe('<p class="c" title="a b">x</p>');
  });

  it("keeps boolean attributes", () => {
    expect(normalizeHtml("<input disabled checked>")).toBe("<input checked disabled>");
  });

  it("keeps self-closing tags", () => {
    expect(normalizeHtml('<img src="a.png" alt="a" />')).toBe('<img alt="a" src="a.png" />');
  });

  it("does not touch text content", () => {
    expect(normalizeHtml("plain <b>text</b> here")).toBe("plain <b>text</b> here");
  });

  it("keeps whitespace because it is meaningful in code blocks", () => {
    expect(normalizeHtml("<pre><code>a\n  b</code></pre>")).toBe("<pre><code>a\n  b</code></pre>");
  });
});

describe("attribute sorting", () => {
  it("sorts multiple tags", () => {
    expect(sortAttributes('<p b="1" a="2"></p><span d="4" c="3"></span>')).toBe(
      '<p a="2" b="1"></p><span c="3" d="4"></span>',
    );
  });

  it("does not treat escaped HTML as tags", () => {
    expect(sortAttributes("&lt;div b=&quot;1&quot;&gt;")).toBe("&lt;div b=&quot;1&quot;&gt;");
  });
});

describe("whitespace collapsing", () => {
  it("collapses runs of whitespace", () => {
    expect(collapseWhitespace("  a\n\n b\t c  ")).toBe("a b c");
  });
});

describe("match removal", () => {
  it("removes matches", () => {
    expect(removeMatches("<p>a</p><p>b</p>", /<p>|<\/p>/gu)).toBe("ab");
  });
});

describe("match replacement", () => {
  it("replaces matches", () => {
    expect(replaceMatches('<p id="x-1">a</p>', /x-\d+/gu, "x")).toBe('<p id="x">a</p>');
  });
});

describe("normalizer composition", () => {
  it("applies steps from left to right", () => {
    expect(composeNormalizers(collapseWhitespace, normalizeHtml)('  <p b="1" a="2">x</p> ')).toBe(
      '<p a="2" b="1">x</p>',
    );
  });
});

describe("token comparison", () => {
  const createToken = (overrides: Partial<Token>): Token =>
    ({
      type: "paragraph_open",
      tag: "p",
      nesting: 1,
      level: 0,
      map: [0, 1],
      markup: "",
      info: "",
      content: "",
      attrs: null,
      block: true,
      hidden: false,
      meta: null,
      children: null,
      ...overrides,
    }) as Token;

  it("sorts attributes and keeps the token contract fields", () => {
    const [token] = canonicalizeTokens([
      createToken({
        attrs: [
          ["b", "2"],
          ["a", "1"],
        ] as Token["attrs"],
      }),
    ]);

    expect(token?.attrs).toStrictEqual([
      ["a", "1"],
      ["b", "2"],
    ]);
    expect(token).toMatchObject({ type: "paragraph_open", tag: "p", map: [0, 1] });
  });

  it("returns no difference for equal streams", () => {
    const tokens = [createToken({})];

    expect(findTokenDifference(canonicalizeTokens(tokens), canonicalizeTokens(tokens))).toBe(
      void 0,
    );
  });

  it("reports the first differing path", () => {
    const difference = findTokenDifference(
      canonicalizeTokens([createToken({ map: [0, 1] })]),
      canonicalizeTokens([createToken({ map: [0, 0] })]),
    );

    expect(difference).toStrictEqual({ path: "[0].map[1]", current: "1", reference: "0" });
  });

  it("reports missing and extra tokens", () => {
    const difference = findTokenDifference(
      canonicalizeTokens([createToken({})]),
      canonicalizeTokens([createToken({}), createToken({ type: "paragraph_close", nesting: -1 })]),
    );

    expect(difference?.path).toBe("[1]");
    expect(difference?.current).toBe("undefined");
  });
});
