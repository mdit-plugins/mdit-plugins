import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/async/index.js";

const loadWithoutLatin = (file: string): Promise<unknown> =>
  file.endsWith("/latin.js") ? Promise.reject(new Error("network error")) : import(file);

describe("partial dynamic font failure", () => {
  it("keeps the instance usable when one dynamic font file fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const instance = (await createMathjaxInstance({
      output: "svg",
      asyncLoad: loadWithoutLatin,
    }))!;

    await expect(instance.outputStyle()).resolves.toContain('mjx-container[jax="SVG"]');
    expect(warn).toHaveBeenCalledWith(expect.any(Error));

    const fallback = (await createMathjaxInstance({ output: "svg" }))!;
    const markdownIt = new MarkdownIt().use(mathjax, fallback);

    expect(markdownIt.render(String.raw`$\mathbb{R}$`)).toContain('jax="SVG"');

    warn.mockRestore();
  });
});
