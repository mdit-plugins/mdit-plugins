import type Token from "markdown-it/lib/token.mjs";
import { describe, expect, it } from "vitest";

import { getMatchingOpeningToken } from "../../src/helper/getMatchingOpeningToken.js";

// Helper function to create a basic token
const createToken = (overrides: Partial<Token> = {}): Token =>
  ({
    type: "text",
    tag: "",
    attrs: null,
    map: null,
    nesting: 0,
    level: 0,
    children: null,
    content: "",
    markup: "",
    info: undefined,
    meta: null,
    block: true,
    hidden: false,
    attrIndex: (): number => -1,
    attrPush: (): void => {},
    attrSet: (): void => {},
    attrGet: (): null => null,
    attrJoin: (): void => {},
    ...overrides,
  }) as Token;

describe("getMatchingOpeningToken", () => {
  it("should return null for softbreak tokens", () => {
    const tokens = [createToken({ type: "softbreak" })];

    expect(getMatchingOpeningToken(tokens, 0)).toBe(null);
  });

  it("should return the same token for self-closing tokens (nesting: 0)", () => {
    const token = createToken({ type: "image", nesting: 0 });
    const tokens = [token];

    expect(getMatchingOpeningToken(tokens, 0)).toBe(token);
  });

  it("should find matching opening token for closing tokens", () => {
    const openingToken = createToken({
      type: "paragraph_open",
      nesting: 1,
      level: 0,
    });
    const contentToken = createToken({
      type: "inline",
      nesting: 0,
      level: 1,
    });
    const closingToken = createToken({
      type: "paragraph_close",
      nesting: -1,
      level: 0,
    });
    const tokens = [openingToken, contentToken, closingToken];

    expect(getMatchingOpeningToken(tokens, 2)).toBe(openingToken);
  });

  it("should find correct opening token with nested elements", () => {
    const tokens = [
      createToken({ type: "div_open", nesting: 1, level: 0 }),
      createToken({ type: "paragraph_open", nesting: 1, level: 1 }),
      createToken({ type: "inline", nesting: 0, level: 2 }),
      createToken({ type: "paragraph_close", nesting: -1, level: 1 }),
      createToken({ type: "div_close", nesting: -1, level: 0 }),
    ];

    // Should find paragraph_open for paragraph_close
    expect(getMatchingOpeningToken(tokens, 3)).toBe(tokens[1]);

    // Should find div_open for div_close
    expect(getMatchingOpeningToken(tokens, 4)).toBe(tokens[0]);
  });

  it("should handle multiple nested elements at same level", () => {
    const tokens = [
      createToken({ type: "paragraph_open", nesting: 1, level: 0 }),
      createToken({ type: "text", nesting: 0, level: 1 }),
      createToken({ type: "paragraph_close", nesting: -1, level: 0 }),
      createToken({ type: "paragraph_open", nesting: 1, level: 0 }),
      createToken({ type: "text", nesting: 0, level: 1 }),
      createToken({ type: "paragraph_close", nesting: -1, level: 0 }),
    ];

    // Should find the correct opening token for each closing token
    expect(getMatchingOpeningToken(tokens, 2)).toBe(tokens[0]);
    expect(getMatchingOpeningToken(tokens, 5)).toBe(tokens[3]);
  });

  it("should handle complex nested structure", () => {
    const tokens = [
      createToken({ type: "blockquote_open", nesting: 1, level: 0 }),
      createToken({ type: "paragraph_open", nesting: 1, level: 1 }),
      createToken({ type: "strong_open", nesting: 1, level: 2 }),
      createToken({ type: "text", nesting: 0, level: 3 }),
      createToken({ type: "strong_close", nesting: -1, level: 2 }),
      createToken({ type: "paragraph_close", nesting: -1, level: 1 }),
      createToken({ type: "blockquote_close", nesting: -1, level: 0 }),
    ];

    expect(getMatchingOpeningToken(tokens, 4)).toBe(tokens[2]); // strong_close -> strong_open
    expect(getMatchingOpeningToken(tokens, 5)).toBe(tokens[1]); // paragraph_close -> paragraph_open
    expect(getMatchingOpeningToken(tokens, 6)).toBe(tokens[0]); // blockquote_close -> blockquote_open
  });

  it("should return null when no matching opening token found", () => {
    const tokens = [createToken({ type: "paragraph_close", nesting: -1, level: 0 })];

    expect(getMatchingOpeningToken(tokens, 0)).toBe(null);
  });

  it("should handle edge case with single token", () => {
    const token = createToken({ type: "hr", nesting: 0 });
    const tokens = [token];

    expect(getMatchingOpeningToken(tokens, 0)).toBe(token);
  });
});
