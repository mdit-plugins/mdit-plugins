import { describe, expect, it, vi } from "vitest";

import { createMathjaxInstance } from "../src/async/index.js";

describe("preloadDynamicFonts", () => {
  it("skips the create-time and outputStyle preload when disabled", async () => {
    const asyncLoad = vi.fn<(file: string) => Promise<unknown>>(() => Promise.resolve({}));

    const instance = (await createMathjaxInstance({
      output: "svg",
      preloadDynamicFonts: false,
      asyncLoad,
    }))!;

    expect(asyncLoad).not.toHaveBeenCalled();
    await expect(instance.outputStyle()).resolves.toContain('mjx-container[jax="SVG"]');
    expect(asyncLoad).not.toHaveBeenCalled();
  });
});
