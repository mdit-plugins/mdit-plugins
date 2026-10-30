import { describe, expect, it, vi } from "vitest";

vi.mock(import("katex/contrib/mhchem"), () => {
  throw new Error("mhchem extension is missing");
});

describe("mhchem extension", () => {
  it("should surface a clear error when the extension cannot be loaded", async () => {
    await expect(import("../src/mhchem.js")).rejects.toThrow(
      "[@mdit/plugin-katex-slim]: failed to load the mhchem extension",
    );
  });
});
