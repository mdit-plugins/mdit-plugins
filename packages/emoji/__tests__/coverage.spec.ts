import { describe, it, expect } from "vitest";

import { normalizeOption } from "../src/normalizeOption.js";

describe("coverage", () => {
  it("normalize_opts handles undefined definitions/shortcuts", () => {
    const res = normalizeOption({});
    expect(res.definitions).toEqual({});
    expect(res.shortcuts).toEqual({});
  });
});
