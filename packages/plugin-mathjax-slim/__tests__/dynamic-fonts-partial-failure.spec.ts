import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { dynamicFontLoaders } from "../src/async/dynamic-fonts-svg.js";
import { loadMathJaxFile } from "../src/async/dynamic-fonts.js";
import { createMathjaxInstance, mathjax } from "../src/async/index.js";

const FAILING_FILE = "@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js";

const createAsyncLoad =
  (failingFile: string) =>
  async (file: string): Promise<unknown> => {
    if (file === failingFile) throw new Error("network error");

    return loadMathJaxFile(file, dynamicFontLoaders);
  };

describe("dynamic font partial failures", () => {
  it("keeps the instance and later instances usable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const asyncLoad = vi.fn<(file: string) => Promise<unknown>>(createAsyncLoad(FAILING_FILE));

    const instance = (await createMathjaxInstance({
      output: "svg",
      asyncLoad,
    }))!;

    expect(asyncLoad).toHaveBeenCalledWith(FAILING_FILE);

    await expect(instance.outputStyle()).resolves.toContain('mjx-container[jax="SVG"]');

    const nextInstance = (await createMathjaxInstance({ output: "svg" }))!;
    const markdownIt = new MarkdownIt().use(mathjax, nextInstance);

    expect(markdownIt.render(String.raw`$\mathbb{R}$`)).toContain("<svg");
    await expect(nextInstance.outputStyle()).resolves.toContain('mjx-container[jax="SVG"]');

    warn.mockRestore();
  });
});
