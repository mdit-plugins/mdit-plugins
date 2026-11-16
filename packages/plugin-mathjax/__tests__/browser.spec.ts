// @vitest-environment happy-dom

import { MathJaxNewcmFont } from "@mathjax/mathjax-newcm-font/js/svg.js";
import { describe, expect, it, vi } from "vitest";

import { loadBrowserFonts } from "../src/async/browser.js";
import { clearCdnMathJaxVersionCache } from "../src/async/cdn.js";

const CDN_REDIRECT = "https://unpkg.com/@mathjax/src@4.2.0/mjs/mathjax.js?module";

describe(loadBrowserFonts, () => {
  it("loads the font class and runtime from unpkg", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      url: CDN_REDIRECT,
    } as Response);
    const mathjax = { asyncLoad: undefined };
    const importModule = vi
      .fn<(url: string) => Promise<unknown>>()
      .mockResolvedValueOnce({ MathJaxNewcmFont })
      .mockResolvedValueOnce({ mathjax });

    const fonts = await loadBrowserFonts("4.1.3", "svg", importModule);

    expect(fonts.fontData).toBe(MathJaxNewcmFont);
    expect(fonts.mathjax).toBe(mathjax);
    expect(fonts.fontVersion).toBe("4.1.3");
    expect(fonts.runtimeVersion).toBe("4.2.0");
    expect(fonts.dynamic("latin")).toBe(
      "https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/svg/dynamic/latin.js?module",
    );
    expect(importModule).toHaveBeenCalledWith(
      "https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/svg.js?module",
    );
    expect(importModule).toHaveBeenCalledWith(CDN_REDIRECT);

    fetchSpy.mockRestore();
  });

  it("throws when the runtime version cannot be resolved", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(loadBrowserFonts("4.1.3", "svg")).rejects.toThrow(
      "could not resolve the MathJax runtime version from unpkg",
    );

    fetchSpy.mockRestore();
  });

  it("throws when a remote module fails to load", async () => {
    clearCdnMathJaxVersionCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      url: CDN_REDIRECT,
    } as Response);

    await expect(
      loadBrowserFonts("4.1.3", "svg", () => Promise.reject(new Error("network error"))),
    ).rejects.toThrow("failed to load the browser font files from unpkg");

    fetchSpy.mockRestore();
  });
});
