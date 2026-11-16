import { MathJaxTexFont } from "@mathjax/mathjax-tex-font/js/svg.js";
import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

vi.mock(import("@mathjax/mathjax-newcm-font/js/chtml.js"), () => {
  throw new Error("not installed");
});
vi.mock(import("@mathjax/mathjax-newcm-font/js/svg.js"), () => {
  throw new Error("not installed");
});

const { createMathjaxInstance, mathjax } = await import("../src/async/index.js");

describe("custom font data without the NewCM font package", () => {
  it("creates an instance with the provided font data", async () => {
    const instance = (await createMathjaxInstance({
      output: "svg",
      svg: { fontData: MathJaxTexFont },
    }))!;
    const markdownIt = new MarkdownIt().use(mathjax, instance);

    expect(markdownIt.render("$x$")).toContain('jax="SVG"');
  });
});
