// @vitest-environment happy-dom

import { MathJaxNewcmFont } from "@mathjax/mathjax-newcm-font/js/svg.js";
import { mathjax as mathjaxLib } from "@mathjax/src/js/mathjax.js";
import { describe, expect, it, vi } from "vitest";

import { loadBrowserFonts } from "../src/async/browser.js";
import { importCdnModule } from "../src/async/cdn.js";
import { getDocumentOptions } from "../src/async/plugin.js";

vi.mock(import("../src/async/browser.js"), () => ({
  isBrowserRuntime: (): boolean => true,
  loadBrowserFonts: vi.fn<typeof loadBrowserFonts>(),
}));

vi.mock(import("../src/async/cdn.js"), () => ({
  importCdnModule: vi.fn<typeof importCdnModule>(() => Promise.resolve({})),
}));

const loadBrowserFontsMock = vi.mocked(loadBrowserFonts);
const importCdnModuleMock = vi.mocked(importCdnModule);

describe("browser font loading", () => {
  it("uses the CDN font class and runtime", async () => {
    loadBrowserFontsMock.mockResolvedValue({
      fontData: MathJaxNewcmFont,
      mathjax: mathjaxLib,
      fontVersion: "4.1.2",
      runtimeVersion: "4.1.3",
      dynamic: (name) =>
        `https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/svg/dynamic/${name}.js?module`,
    });

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const documentOptions = await getDocumentOptions({ output: "svg" });

    expect(loadBrowserFontsMock).toHaveBeenCalledWith(mathjaxLib.version, "svg");
    expect(documentOptions.OutputJax.font).toBeInstanceOf(MathJaxNewcmFont);
    expect(mathjaxLib.asyncLoad).toBeTypeOf("function");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("browser fonts use"));

    await mathjaxLib.asyncLoad("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js");
    expect(importCdnModuleMock).toHaveBeenCalledWith(
      "https://unpkg.com/@mathjax/mathjax-newcm-font@4.1.3/mjs/svg/dynamic/latin.js?module",
    );

    warn.mockRestore();
  });

  it("uses a custom asyncLoad when provided", async () => {
    loadBrowserFontsMock.mockResolvedValue({
      fontData: MathJaxNewcmFont,
      mathjax: mathjaxLib,
      fontVersion: "4.1.3",
      runtimeVersion: "4.1.3",
      dynamic: (name) => `https://example.com/${name}.js`,
    });
    const asyncLoad = vi.fn<() => Promise<unknown>>(() => Promise.resolve("custom"));

    await getDocumentOptions({ output: "svg", asyncLoad });
    await mathjaxLib.asyncLoad("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js");

    expect(asyncLoad).toHaveBeenCalledTimes(1);
  });

  it("registers a custom loader with custom font data", async () => {
    const asyncLoad = vi.fn<() => Promise<unknown>>(() => Promise.resolve("custom"));

    await getDocumentOptions({
      output: "svg",
      asyncLoad,
      svg: { fontData: MathJaxNewcmFont },
    });
    await mathjaxLib.asyncLoad("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js");

    expect(asyncLoad).toHaveBeenCalledTimes(1);
  });

  it("does not fall back to the local font when unpkg fails", async () => {
    loadBrowserFontsMock.mockRejectedValue(new Error("offline"));

    await expect(getDocumentOptions({ output: "svg" })).rejects.toThrow("offline");
  });
});
