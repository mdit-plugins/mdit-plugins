// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";

vi.mock(import("../src/async/cdn.js"), () => ({
  getCdnFontUrls: (): { font: string; mathjax: string; dynamic: (name: string) => string } => ({
    font: "font-url",
    mathjax: "runtime-url",
    dynamic: (name): string => `dynamic/${name}`,
  }),
  getFontPackageVersion: (): Promise<null> => Promise.resolve(null),
  importCdnModule: vi.fn<(url: string) => Promise<unknown>>(),
  resolveCdnMathJaxVersion: (): Promise<string> => Promise.resolve("4.2.0"),
}));

const { loadBrowserFonts } = await import("../src/async/browser.js");

describe(loadBrowserFonts, () => {
  it("falls back to the MathJax version when the font manifest is unreadable", async () => {
    const importModule = vi
      .fn<(url: string) => Promise<unknown>>()
      .mockResolvedValueOnce({ MathJaxNewcmFont: {} })
      .mockResolvedValueOnce({ mathjax: {} });

    const fonts = await loadBrowserFonts("4.1.3", "svg", importModule);

    expect(fonts.fontVersion).toBe("4.1.3");
    expect(fonts.runtimeVersion).toBe("4.2.0");
  });
});
