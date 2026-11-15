import { MathJaxTexFont } from "@mathjax/mathjax-tex-font/js/svg.js";
import { describe, expect, it, vi } from "vitest";

import { createMathjaxInstance } from "../src/async/index.js";

describe("preloadDynamicFonts", () => {
  it("skips font preloading when disabled", async () => {
    const loadDynamicFiles = vi.spyOn(MathJaxTexFont.prototype, "loadDynamicFiles");
    const instance = (await createMathjaxInstance({
      output: "svg",
      preloadDynamicFonts: false,
      svg: { fontData: MathJaxTexFont },
    }))!;

    expect(loadDynamicFiles).not.toHaveBeenCalled();

    await instance.outputStyle();
    expect(loadDynamicFiles).not.toHaveBeenCalled();

    loadDynamicFiles.mockRestore();
  });
});
