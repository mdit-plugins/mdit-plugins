// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import { isBrowserRuntime } from "../src/async/runtime.js";

describe(isBrowserRuntime, () => {
  it("returns true when window and document exist", () => {
    expect(isBrowserRuntime()).toBe(true);
  });
});
