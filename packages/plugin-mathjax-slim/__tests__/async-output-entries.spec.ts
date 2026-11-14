import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import {
  createMathjaxInstance as createChtmlInstance,
  getDocumentOptions as getChtmlDocumentOptions,
} from "../src/async/chtml.js";
import {
  createMathjaxInstance as createDefaultInstance,
  getDocumentOptions as getDefaultDocumentOptions,
  mathjax,
} from "../src/async/index.js";
import {
  createMathjaxInstance as createSvgInstance,
  getDocumentOptions as getSvgDocumentOptions,
} from "../src/async/svg.js";

const ENTRIES = [
  { create: createSvgInstance, jax: "SVG", name: "svg" },
  { create: createChtmlInstance, jax: "CHTML", name: "chtml" },
] as const;

describe("output-specific async entries", () => {
  it.each(ENTRIES)("bundles and renders the $name output", async ({ create, jax }) => {
    const instance = (await create())!;
    const markdownIt = new MarkdownIt().use(mathjax, instance);

    expect(markdownIt.render(String.raw`$\mathbb{R}$`)).toContain(`jax="${jax}"`);
  });

  it("defaults the output to svg", async () => {
    const instance = (await createDefaultInstance())!;
    const markdownIt = new MarkdownIt().use(mathjax, instance);

    expect(markdownIt.render(String.raw`$\mathbb{R}$`)).toContain('jax="SVG"');
    await expect(getDefaultDocumentOptions({})).resolves.toBeDefined();
  });

  it("creates document options for each output entry", async () => {
    await expect(getSvgDocumentOptions()).resolves.toBeDefined();
    await expect(getChtmlDocumentOptions()).resolves.toBeDefined();
  });
});
