import { describe, expect, it, expectTypeOf } from "vitest";

import { deflate } from "../src/deflate/browser.js";

describe("deflate-browser", () => {
  it("should deflate string", () => {
    const data = "Hello World";
    const result = deflate(data);

    expect(result).toBeDefined();
    expectTypeOf(result).toBeString();
  });

  it("should not throw on large incompressible input", () => {
    // ~200KB of incompressible (deterministic pseudo-random) content keeps the
    // compressed output large, which used to overflow the stack when spreading
    // the whole Uint8Array via `Function.prototype.apply`.
    let seed = 0x2f6e2b1;
    const random = (): number => {
      seed = (seed * 48271) % 0x7fffffff;

      return seed / 0x7fffffff;
    };
    const data = Array.from({ length: 200_000 }, () =>
      String.fromCodePoint(32 + Math.floor(random() * 94)),
    ).join("");

    expect(() => deflate(data)).not.toThrow();
  });
});
