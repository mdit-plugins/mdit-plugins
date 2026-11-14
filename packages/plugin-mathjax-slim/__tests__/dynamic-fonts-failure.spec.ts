import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/async/index.js";

const failingAsyncLoad = (): Promise<unknown> => Promise.reject(new Error("network error"));

describe("dynamic font failures", () => {
  it("keeps the instance and later instances usable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const instance = (await createMathjaxInstance({ asyncLoad: failingAsyncLoad }))!;
    const markdownIt = new MarkdownIt().use(mathjax, instance);

    expect(markdownIt.render("$x$")).toContain("<svg");
    await expect(instance.outputStyle()).resolves.toContain('mjx-container[jax="SVG"]');

    const nextInstance = (await createMathjaxInstance({ asyncLoad: failingAsyncLoad }))!;
    const nextMarkdownIt = new MarkdownIt().use(mathjax, nextInstance);

    expect(nextMarkdownIt.render("$x$")).toContain("<svg");
    await expect(nextInstance.outputStyle()).resolves.toContain('mjx-container[jax="SVG"]');

    warn.mockRestore();
  });
});
