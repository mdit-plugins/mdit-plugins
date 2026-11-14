import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { dynamicFontLoaders, loadMathJaxFile } from "../src/async/dynamic-fonts.js";

const require = createRequire(import.meta.url);
const FONT_OUTPUTS = ["svg", "chtml"] as const;

describe("dynamic font loaders", () => {
  it.each(FONT_OUTPUTS)("covers every %s dynamic font file", async (output) => {
    const directory = path.dirname(
      require.resolve(`@mathjax/mathjax-newcm-font/js/${output}/dynamic/latin.js`),
    );
    const files = (await readdir(directory)).filter((file) => file.endsWith(".js"));
    const names = files.map((file) => file.slice(0, -3)).sort();
    const loaders = Object.keys(dynamicFontLoaders)
      .filter((key) => key.startsWith(`${output}/`))
      .map((key) => key.slice(output.length + 1))
      .sort();

    expect(loaders).toStrictEqual(names);
  });

  it("loads a bundled dynamic font file through its static loader", async () => {
    await expect(
      loadMathJaxFile("@mathjax/mathjax-newcm-font/js/svg/dynamic/latin.js"),
    ).resolves.toBeTypeOf("object");
  });

  it("falls back to a runtime import for other files", async () => {
    await expect(loadMathJaxFile("markdown-it")).resolves.toBeTypeOf("object");
  });

  it("rejects dynamic font files that are missing", async () => {
    await expect(
      loadMathJaxFile("@mathjax/mathjax-newcm-font/js/svg/dynamic/missing.js"),
    ).rejects.toThrow("@mathjax/mathjax-newcm-font/js/svg/dynamic/missing.js");
  });
});
