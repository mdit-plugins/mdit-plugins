import { describe, expect, it } from "vitest";

import { isBrowserRuntime } from "../src/async/runtime.js";

describe(isBrowserRuntime, () => {
  it("returns false outside a browser", () => {
    expect(isBrowserRuntime()).toBe(false);
  });
});
