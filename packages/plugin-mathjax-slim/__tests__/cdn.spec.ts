import { describe, expect, it, vi } from "vitest";

import {
  clearCdnMathJaxVersionCache,
  getCdnFontUrls,
  getFontPackageVersion,
  importCdnModule,
  resolveCdnMathJaxVersion,
} from "../src/async/cdn.js";

describe(getCdnFontUrls, () => {
  it.each(["svg", "chtml"] as const)("creates unpkg URLs for %s", (output) => {
    const urls = getCdnFontUrls("4.1.3", output, "4.1.3");

    expect(urls.font).toBe(
      `https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/${output}.js?module`,
    );
    expect(urls.dynamic("latin")).toBe(
      `https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/${output}/dynamic/latin.js?module`,
    );
  });

  it("uses independent font and runtime versions", () => {
    const urls = getCdnFontUrls("4.1.2", "svg", "4.2.0");

    expect(urls.font).toContain("@mathjax/mathjax-newcm-font@4.1.2/");
    expect(urls.mathjax).toBe("https://unpkg.com/@mathjax/src@4.2.0/mjs/mathjax.js?module");
  });
});

describe(getFontPackageVersion, () => {
  it("reads the installed font package version", async () => {
    await expect(getFontPackageVersion()).resolves.toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe(importCdnModule, () => {
  it("imports an absolute module URL", async () => {
    const module = await importCdnModule("data:text/javascript,export default 42");

    expect(module).toHaveProperty("default", 42);
  });
});

describe(resolveCdnMathJaxVersion, () => {
  it("reads the version from the redirected unpkg URL and caches it", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      url: "https://unpkg.com/@mathjax/src@4.2.0/mjs/mathjax.js?module",
    } as Response);

    await expect(resolveCdnMathJaxVersion()).resolves.toBe("4.2.0");
    await expect(resolveCdnMathJaxVersion()).resolves.toBe("4.2.0");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://unpkg.com/@mathjax/src@latest/mjs/mathjax.js?module",
      expect.objectContaining({ method: "HEAD", signal: expect.any(AbortSignal) }),
    );

    fetchSpy.mockRestore();
  });

  it("returns null when the request fails", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    await expect(resolveCdnMathJaxVersion()).resolves.toBeNull();
    fetchSpy.mockRestore();
  });

  it("returns null for a failed response", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      url: "https://unpkg.com/@mathjax/src@4.2.0/mjs/mathjax.js?module",
    } as Response);

    await expect(resolveCdnMathJaxVersion()).resolves.toBeNull();
    fetchSpy.mockRestore();
  });

  it("returns null when unpkg does not resolve to a concrete version", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      url: "https://unpkg.com/@mathjax/src@latest/mjs/mathjax.js?module",
    } as Response);

    await expect(resolveCdnMathJaxVersion()).resolves.toBeNull();
    fetchSpy.mockRestore();
  });
});
