import { describe, expect, it, vi } from "vitest";

import { getCdnFontUrls, resolveCdnMathJaxVersion } from "../src/async/cdn.js";

describe(getCdnFontUrls, () => {
  it.each(["svg", "chtml"] as const)("creates unpkg URLs for %s", (output) => {
    const urls = getCdnFontUrls("4.1.3", output);

    expect(urls.font).toBe(
      `https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/${output}.js?module`,
    );
    expect(urls.dynamic("latin")).toBe(
      `https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/${output}/dynamic/latin.js?module`,
    );
  });

  it("loads the runtime from the version resolved by unpkg", () => {
    expect(getCdnFontUrls("4.1.3", "svg", "4.2.0").mathjax).toBe(
      "https://unpkg.com/@mathjax/src@4.2.0/mjs/mathjax.js?module",
    );
  });
});

describe(resolveCdnMathJaxVersion, () => {
  it("reads the version from the redirected unpkg URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      url: "https://unpkg.com/@mathjax/src@4.2.0/mjs/mathjax.js?module",
    } as Response);

    await expect(resolveCdnMathJaxVersion("4.1.3")).resolves.toBe("4.2.0");
    fetchSpy.mockRestore();
  });

  it("falls back when the request fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    await expect(resolveCdnMathJaxVersion("4.1.3")).resolves.toBe("4.1.3");
    fetchSpy.mockRestore();
  });

  it("falls back when the redirected URL has no version", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      url: "https://unpkg.com/not-mathjax.js",
    } as Response);

    await expect(resolveCdnMathJaxVersion("4.1.3")).resolves.toBe("4.1.3");
    fetchSpy.mockRestore();
  });
});
