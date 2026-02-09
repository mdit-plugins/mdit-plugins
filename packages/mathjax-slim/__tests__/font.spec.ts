import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";
import { MathJaxTexFont as MathJaxTexCHTMLFont } from "@mathjax/mathjax-tex-font/js/chtml.js";
import { MathJaxTexFont as MathJaxTexSVGFont } from "@mathjax/mathjax-tex-font/js/svg.js";
import { createMathjaxInstance, mathjax } from "../src/index.js";

describe("mathjax-html", () => {
  it("should support custom chtml font data", async () => {
    const mathjaxInstance = (await createMathjaxInstance({
      output: "chtml",
      chtml: {
        fontData: MathJaxTexCHTMLFont,
        fontURL: "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-tex-font/chtml/woff2",
      },
    }))!;

    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render(String.raw`$$\frac{a}{b}$$`)).toMatchSnapshot("content");

    const style = await mathjaxInstance.outputStyle();

    expect(style).toContain("https://cdn.jsdelivr.net/npm/@mathjax/mathjax-tex-font/chtml/woff2");
    expect(style.split("\n").length).toMatchSnapshot("style");
  });

  it("should support custom svg font data", async () => {
    const mathjaxInstance = (await createMathjaxInstance({
      output: "svg",
      svg: {
        fontData: MathJaxTexSVGFont,
      },
    }))!;

    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render(String.raw`$$\frac{a}{b}$$`)).toMatchSnapshot("content-svg");

    const style = await mathjaxInstance.outputStyle();

    expect(style).toContain('mjx-container[jax="SVG"]');
  });
});
