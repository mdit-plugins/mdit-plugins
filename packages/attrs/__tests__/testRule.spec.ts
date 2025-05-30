import type Token from "markdown-it/lib/token.mjs";
import { describe, expect, it } from "vitest";

import { testRule } from "../src/helper/testRule.js";
import type { RuleSet } from "../src/rules/types.js";

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

describe("testRule", () => {
  it("string rules", () => {
    const tokens = [
      createToken({ type: "paragraph" }),
      createToken({ type: "text" }),
    ];

    // Should match when types are equal
    expect(testRule(tokens, 0, { shift: 0, type: "paragraph" }).match).toBe(
      true,
    );

    // Should not match when types differ
    expect(testRule(tokens, 1, { shift: 0, type: "paragraph" }).match).toBe(
      false,
    );
  });

  it("function rules", () => {
    const tokens = [
      createToken({ type: "paragraph" }),
      createToken({ type: "text" }),
    ];
    const typeCheck = (type: string): boolean => type === "paragraph";

    // Should match when function returns true
    expect(testRule(tokens, 0, { shift: 0, type: typeCheck }).match).toBe(true);

    // Should not match when function returns false
    expect(testRule(tokens, 1, { shift: 0, type: typeCheck }).match).toBe(
      false,
    );
  });

  it("boolean rules", () => {
    const tokens = [
      createToken({ block: true }),
      createToken({ block: false }),
    ];

    // Should match when values are equal
    expect(testRule(tokens, 0, { shift: 0, block: true }).match).toBe(true);

    // Should not match when values differ
    expect(testRule(tokens, 0, { shift: 0, block: false }).match).toBe(false);
  });

  it("number rules", () => {
    const tokens = [createToken({ nesting: 1 }), createToken({ nesting: 0 })];

    // Should match when values are equal
    expect(testRule(tokens, 0, { shift: 0, nesting: 1 }).match).toBe(true);

    // Should not match when values differ
    expect(testRule(tokens, 0, { shift: 0, nesting: 0 }).match).toBe(false);
  });

  it("function arrays", () => {
    const tokens = [createToken({ type: "code_block" })];
    const rule = {
      shift: 0,
      type: [
        (type: string): boolean => type.includes("code"),
        (type: string): boolean => type.includes("block"),
      ],
    };
    const failRule = {
      shift: 0,
      type: [
        (type: string): boolean => type.includes("code"),
        (type: string): boolean => type.includes("inline"),
      ],
    };

    // Should match when all functions return true
    expect(testRule(tokens, 0, rule).match).toBe(true);

    // Should not match when any function returns false
    expect(testRule(tokens, 0, failRule).match).toBe(false);
  });

  it("position and shift", () => {
    const tokens = [
      createToken({ type: "text" }),
      createToken({ type: "paragraph" }),
    ];

    // Should handle shift correctly
    expect(testRule(tokens, 0, { shift: 1, type: "paragraph" }).match).toBe(
      true,
    );

    // Should handle position correctly
    expect(testRule(tokens, 0, { position: 0, type: "text" }).match).toBe(true);

    // Should return false when shift results in negative index
    expect(testRule(tokens, 0, { shift: -2, type: "text" }).match).toBe(false);

    // Should return false when out of bounds
    expect(testRule(tokens, 0, { shift: 5, type: "text" }).match).toBe(false);
  });

  it("undefined properties", () => {
    const tokens = [createToken({ type: "text" })];

    // Should return false when token property is undefined
    expect(testRule(tokens, 0, { shift: 0, info: "some-info" }).match).toBe(
      false,
    );
  });

  it("children with positions", () => {
    const childTokens = [
      createToken({ type: "text", content: "hello" }),
      createToken({ type: "strong_open" }),
    ];
    const tokens = [createToken({ type: "inline", children: childTokens })];

    const rule: RuleSet = {
      shift: 0,
      type: "inline",
      children: [
        { position: 0, type: "text" },
        { position: 1, type: "strong_open" },
      ],
    };

    const result = testRule(tokens, 0, rule);

    expect(result.match).toBe(true);
    expect(result.position).toBe(1); // Position of last child test
  });

  it("children with shifts", () => {
    const childTokens = [
      createToken({ type: "text", content: "hello" }),
      createToken({ type: "strong_open" }),
    ];
    const tokens = [createToken({ type: "inline", children: childTokens })];

    const rule: RuleSet = {
      shift: 0,
      type: "inline",
      children: [
        { shift: 0, type: "text" },
        { shift: 1, type: "strong_open" },
      ],
    };

    const result = testRule(tokens, 0, rule);

    expect(result.match).toBe(true);
    expect(result.position).toBe(0); // Position where match was found
  });

  it("children edge cases", () => {
    const tokens = [
      createToken({ type: "inline", children: [] }),
      createToken({
        type: "inline",
        children: [createToken({ type: "text" })],
      }),
    ];

    // Should return false when children array is empty
    expect(
      testRule(tokens, 0, {
        shift: 0,
        type: "inline",
        children: [{ shift: 0, type: "text" }],
      }).match,
    ).toBe(false);

    // Should handle children as function
    const childrenFunc = (children: unknown): boolean =>
      Array.isArray(children) && children.length > 0;

    expect(
      testRule(tokens, 0, { shift: 0, type: "inline", children: childrenFunc })
        .match,
    ).toBe(false);
    expect(
      testRule(tokens, 1, { shift: 0, type: "inline", children: childrenFunc })
        .match,
    ).toBe(true);
  });

  it("negative position in children", () => {
    const childTokens = [
      createToken({ type: "text", content: "hello" }),
      createToken({ type: "strong_open" }),
    ];
    const tokens = [createToken({ type: "inline", children: childTokens })];

    const rule: RuleSet = {
      shift: 0,
      type: "inline",
      children: [{ position: -1, type: "strong_open" }], // Last element
    };

    const result = testRule(tokens, 0, rule);

    expect(result.match).toBe(true);
    expect(result.position).toBe(1); // Should resolve to actual index 1
  });

  it("unsupported types", () => {
    const tokens = [createToken({ type: "heading", level: 1, tag: "h1" })];

    // Complex object should throw error
    const rule1: RuleSet = {
      shift: 0,
      type: "heading",
      level: 1,
      tag: { complex: "object", that: "continues" } as any,
    };

    expect(() => testRule(tokens, 0, rule1)).toThrow(
      "Unknown type of pattern test (key: tag). Test should be of type boolean, number, string, function or array of functions.",
    );

    // Symbol type should throw error
    const rule2 = {
      shift: 0,
      type: Symbol("test"),
    } as unknown as RuleSet;

    expect(() => testRule(tokens, 0, rule2)).toThrow(
      "Unknown type of pattern test (key: type). Test should be of type boolean, number, string, function or array of functions.",
    );
  });
});
