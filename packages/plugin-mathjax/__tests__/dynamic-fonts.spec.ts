import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/async/index.js";

// These commands map to glyphs that MathJax 4 ships in dynamic font files. Rendering them through
// the synchronous `render()` of the async entry used to throw "MathJax retry" because the glyph
// data was not loaded yet.
const DYNAMIC_GLYPHS = String.raw`\mathbb{R} \mathcal{C} \mathfrak{g}`;

describe("dynamic fonts", () => {
  it.each([
    { output: "svg", container: "<svg" },
    { output: "chtml", container: "<mjx-math" },
  ] as const)(
    "renders $output glyphs that live in dynamic font files",
    async ({ output, container }) => {
      const instance = (await createMathjaxInstance({ output }))!;
      const markdownIt = new MarkdownIt().use(mathjax, instance);

      const result = markdownIt.render(`$${DYNAMIC_GLYPHS}$`);

      expect(result).toContain(`jax="${output.toUpperCase()}"`);
      expect(result).toContain(container);
      expect(result).not.toContain("mjx-merror");
    },
  );
});
