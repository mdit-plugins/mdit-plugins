import { describe, expect, it, vi } from "vitest";

import {
  clearDynamicFontLoaders,
  getDynamicFontOutput,
  loadDynamicFontFile,
  registerDynamicFontLoader,
} from "../src/async/loader.js";

describe(getDynamicFontOutput, () => {
  it("reads the output from a dynamic font file path", () => {
    expect(getDynamicFontOutput("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js")).toBe("svg");
    expect(getDynamicFontOutput("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin.js")).toBe(
      "chtml",
    );
    expect(getDynamicFontOutput("test-module.js")).toBeNull();
  });
});

describe(registerDynamicFontLoader, () => {
  it("routes a dynamic font file to the loader registered for its output", async () => {
    clearDynamicFontLoaders();
    const svgLoader = vi.fn<() => Promise<string>>(() => Promise.resolve("svg font"));
    const chtmlLoader = vi.fn<() => Promise<string>>(() => Promise.resolve("chtml font"));

    registerDynamicFontLoader("svg", svgLoader);
    registerDynamicFontLoader("chtml", chtmlLoader);

    await expect(
      loadDynamicFontFile("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js"),
    ).resolves.toBe("svg font");
    await expect(
      loadDynamicFontFile("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin.js"),
    ).resolves.toBe("chtml font");
    expect(svgLoader).toHaveBeenCalledTimes(1);
    expect(chtmlLoader).toHaveBeenCalledTimes(1);
  });

  it("throws when no loader is registered for the output", () => {
    clearDynamicFontLoaders();
    registerDynamicFontLoader("svg", () => Promise.resolve("svg font"));

    expect(() =>
      loadDynamicFontFile("@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin.js"),
    ).toThrow(
      'no dynamic font loader is registered for "@mathjax/mathjax-newcm-font/js/chtml/dynamic/latin.js"',
    );
  });
});
