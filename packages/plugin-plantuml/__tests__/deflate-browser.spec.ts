import { describe, expect, it, expectTypeOf } from "vitest";

import { deflate } from "../src/deflate/browser.js";

describe("deflate-browser", () => {
  it("should deflate string", () => {
    const data = "Hello World";
    const result = deflate(data);

    expect(result).toBeDefined();
    expectTypeOf(result).toBeString();
  });
});
