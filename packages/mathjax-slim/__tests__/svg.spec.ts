import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/index.js";
import { examples } from "./utils.js";

describe("mathjax-svg", () => {
  describe("inline mathjax", async () => {
    const instance = (await createMathjaxInstance())!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, instance);

    it("reset and clearStyle should not throw", () => {
      expect(() => {
        instance.clearStyle();
        instance.reset();
      }).not.toThrow();
    });

    it("should output SVG", () => {
      examples.forEach((example) => {
        const inline = markdownIt.render(`$${example}$`);
        const inlineInText = markdownIt.render(`A tex equation $${example}$ inline.`);

        expect(inline).toMatchSnapshot();
        expect(inline).toMatch(/jax="SVG"/);
        expect(inline).toMatch(/<mjx-container .*>.*<\/mjx-container>/);
        expect(inline).toMatch(/<svg .*>[\s\S]*<\/svg>/);

        expect(inlineInText).toMatchSnapshot();
        expect(inlineInText).toMatch(/jax="SVG"/);
        expect(inlineInText).toMatch(/<mjx-container .*>.*<\/mjx-container>/);
        expect(inlineInText).toMatch(/<svg .*>[\s\S]*<\/svg>/);
      });
    });

    it("should output A11y", () => {
      examples.forEach((example) => {
        const inline = markdownIt.render(`$${example}$`);
        const inlineInText = markdownIt.render(`A tex equation $${example}$ inline.`);

        expect(inline).toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
        expect(inlineInText).toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
      });
    });

    it("should not output A11y", async () => {
      const markdownItNoA11y = MarkdownIt({ linkify: true }).use(
        mathjax,
        await createMathjaxInstance({ a11y: false }),
      );

      examples.forEach((example) => {
        const inline = markdownItNoA11y.render(`$${example}$`);
        const inlineInText = markdownItNoA11y.render(`A tex equation $${example}$ inline.`);

        expect(inline).not.toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
        expect(inlineInText).not.toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
      });
    });

    it("should not render error msg when content is wrong", () => {
      const result = markdownIt.render(String.raw`$\fra{a}{b}$`);

      expect(result).not.toMatch(/mjx-error/);
      expect(result).toMatchSnapshot();
    });
  });

  describe("block mathjax", async () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, await createMathjaxInstance());

    it("should render", () => {
      const blocks = [
        markdownIt.render(String.raw`$$\frac{a}{b}$$`),
        markdownIt.render(`
$$
\\frac{a}{b}
$$
`),
      ];

      blocks.forEach((block) => {
        expect(block).toMatchSnapshot();
        expect(block).toMatch(/jax="SVG"/);
        expect(block).toMatch(/<mjx-container.*>[\s\S]+<\/mjx-container>/);
        expect(block).toMatch(/<svg[\s\S]*>[\s\S]+<\/svg>/);
      });
    });

    it("should not render error msg when content is wrong", () => {
      const blocks = [
        markdownIt.render(String.raw`$$\fra{a}{b}$$`),
        markdownIt.render(`
$$
\\fra{a}{b}
$$
`),
      ];

      blocks.forEach((block) => {
        expect(block).not.toMatch(/mjx-error/);
        expect(block).toMatchSnapshot();
      });
    });

    it("should not output warnings when content has line breaks", () => {
      expect(
        markdownIt.render(`
$$
\\begin{alignedat}{2}
    10&x+ &3&y = 2 \\\\
    3&x+&13&y = 4
\\end{alignedat}
$$    
`),
      ).toMatchSnapshot();
    });
  });

  it("generating style", async () => {
    const mathjaxInstance = (await createMathjaxInstance())!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render(String.raw`$$\frac{a}{b}$$`)).toMatchSnapshot("content");

    const style = await mathjaxInstance.outputStyle();

    expect(style.split("\n").length).toMatchSnapshot("style");
  });

  describe("check label result pre page", () => {
    const source = String.raw`$$\label{eq:1}\frac{a}{b}$$`;

    it("should log error when label is multiply defined", async () => {
      const mathjaxInstance = (await createMathjaxInstance())!;
      const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

      expect(markdownIt.render(source)).not.toMatch(/mjx-error/);
      expect(markdownIt.render(source)).toMatch(/mjx-error/);

      const style = await mathjaxInstance.outputStyle();

      expect(style.split("\n").length).toMatchSnapshot("style");
    });

    it("should reset label with reset", async () => {
      const mathjaxInstance = (await createMathjaxInstance())!;
      const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

      const content1 = markdownIt.render(String.raw`$$\label{eq:1}\frac{a}{b}$$`);

      expect(content1).not.toMatch(/mjx-error/);
      expect(content1).toMatchSnapshot("content1");

      mathjaxInstance.reset();

      const content2 = markdownIt.render(String.raw`$$\label{eq:1}\frac{a}{b}$$`);

      expect(content2).not.toMatch(/mjx-error/);
      expect(content2).toMatchSnapshot("content2");

      const style = await mathjaxInstance.outputStyle();

      expect(style.split("\n").length).toMatchSnapshot("style");
    });
  });

  it("should work with transformer", async () => {
    const mathjaxInstance = (await createMathjaxInstance({
      transformer: (content: string) => content.replaceAll(/^(<[a-z-]+ )/g, "$1v-pre "),
    }))!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render(`$$a=1$$`)).toContain(" v-pre ");
    expect(markdownIt.render(`$a=1$`)).toContain(" v-pre ");
  });
});
