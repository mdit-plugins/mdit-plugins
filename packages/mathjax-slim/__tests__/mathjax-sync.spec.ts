import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/sync.js";

const examples = [
  "a=1",
  `\\frac {\\partial^r} {\\partial \\omega^r} \\left(\\frac {y^{\\omega}} {\\omega}\\right) = \\left(\\frac {y^{\\omega}} {\\omega}\\right) \\left\\{(\\log y)^r + \\sum_{i=1}^r \\frac {(-1)^ Ir \\cdots (r-i+1) (\\log y)^{ri}} {\\omega^i} \\right\\}`,
];

describe("inline mathjax", () => {
  it("should output SVG", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, createMathjaxInstance());

    examples.forEach((example) => {
      expect(markdownIt.render(`$${example}$`)).toMatchSnapshot();
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).toMatchSnapshot();

      expect(markdownIt.render(`$${example}$`)).toMatch(/<svg .*>[\s\S]*<\/svg>/);
      expect(markdownIt.render(`$${example}$`)).toMatch(/<mjx-container .*>.*<\/mjx-container>/);
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<svg .*>[\s\S]*<\/svg>/,
      );
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<mjx-container .*>.*<\/mjx-container>/,
      );
    });
  });

  it("should output HTML", () => {
    const markdownItHTML = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({
        output: "chtml",
      }),
    );

    examples.forEach((example) => {
      expect(markdownItHTML.render(`$${example}$`)).toMatchSnapshot();
      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).toMatchSnapshot();

      expect(markdownItHTML.render(`$${example}$`)).toMatch(
        /<mjx-container .*>.*<\/mjx-container>/,
      );
      expect(markdownItHTML.render(`$${example}$`)).toMatch(/<mjx-math .*>[\s\S]*<\/mjx-math>/);

      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<mjx-container .*>.*<\/mjx-container>/,
      );
      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<mjx-math .*>[\s\S]*<\/mjx-math>/,
      );
    });
  });

  it("should output A11y", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, createMathjaxInstance());
    const markdownItHTML = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({
        output: "chtml",
      }),
    );

    examples.forEach((example) => {
      expect(markdownIt.render(`$${example}$`)).toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(markdownItHTML.render(`$${example}$`)).toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
    });
  });

  it("should not output A11y", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({ a11y: false }),
    );
    const markdownItHTML = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({
        a11y: false,
        output: "chtml",
      }),
    );

    examples.forEach((example) => {
      expect(markdownIt.render(`$${example}$`)).not.toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).not.toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(markdownItHTML.render(`$${example}$`)).not.toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).not.toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
    });
  });

  it("should not render error msg when content is wrong", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, createMathjaxInstance());

    expect(markdownIt.render("$\\fra{a}{b}$")).toMatchSnapshot();
  });
});

describe("block mathjax", () => {
  it("should output SVG", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, createMathjaxInstance());

    expect(markdownIt.render("$$\\frac{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownIt.render(`
$$
\\frac{a}{b}
$$
`),
    ).toMatchSnapshot();
  });

  it("should output HTML", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({ output: "chtml" }),
    );

    expect(markdownIt.render("$$\\frac{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownIt.render(`
$$
\\frac{a}{b}
$$
`),
    ).toMatchSnapshot();
  });

  it("should not render error msg when content is wrong", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, createMathjaxInstance());

    expect(markdownIt.render("$$\\fra{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownIt.render(`
$$
\\fra{a}{b}
$$
`),
    ).toMatchSnapshot();
  });

  it("should not output warnings when content has line breaks", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, createMathjaxInstance());

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

describe("generating Style", () => {
  it("should generate correct CSS with svg", () => {
    const mathjaxInstance = createMathjaxInstance({ output: "svg" })!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render("$$\\frac{a}{b}$$")).toMatchSnapshot("content");

    expect(mathjaxInstance.outputStyle().split("\n").length).toMatchSnapshot("style");
  });

  it("should generate correct CSS with HTML", () => {
    const mathjaxInstance = createMathjaxInstance({ output: "chtml" })!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render("$$\\frac{a}{b}$$")).toMatchSnapshot("content");

    expect(mathjaxInstance.outputStyle().split("\n").length).toMatchSnapshot("style");
  });
});

describe("check label result pre page", () => {
  it("should generate correct label and CSS with svg", () => {
    const mathjaxInstance = createMathjaxInstance({ output: "svg" })!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render("$$\\label{eq:1}\\frac{a}{b}$$")).toMatchSnapshot("content1");

    mathjaxInstance.reset();

    expect(markdownIt.render("$$\\label{eq:1}\\frac{a}{b}$$")).toMatchSnapshot("content2");

    expect(mathjaxInstance.outputStyle().split("\n").length).toMatchSnapshot("style");
  });

  it("should generate correct label and CSS with HTML", () => {
    const mathjaxInstance = createMathjaxInstance({ output: "chtml" })!;
    const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

    expect(markdownIt.render("$$\\label{eq:1}\\frac{a}{b}$$")).toMatchSnapshot("content1");

    mathjaxInstance.reset();

    expect(markdownIt.render("$$\\label{eq:1}\\frac{a}{b}$$")).toMatchSnapshot("content2");

    expect(mathjaxInstance.outputStyle().split("\n").length).toMatchSnapshot("style");
  });
});

it("should work with transformer", () => {
  const mathjaxInstance = createMathjaxInstance({
    transformer: (content: string) => content.replace(/^(<[a-z-]+ )/g, "$1v-pre "),
  })!;
  const markdownIt = MarkdownIt({ linkify: true }).use(mathjax, mathjaxInstance);

  expect(markdownIt.render(`$$a=1$$`)).toContain(" v-pre ");
  expect(markdownIt.render(`$a=1$`)).toContain(" v-pre ");
});
