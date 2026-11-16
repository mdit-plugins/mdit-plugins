import { describe, expect, it, vi } from "vitest";

vi.mock(import("@mathjax/mathjax-newcm-font/package.json"), () => {
  throw new Error("not installed");
});

const { getFontPackageVersion } = await import("../src/async/cdn.js");

describe(getFontPackageVersion, () => {
  it("returns null when the package manifest cannot be read", async () => {
    await expect(getFontPackageVersion()).resolves.toBeNull();
  });
});
