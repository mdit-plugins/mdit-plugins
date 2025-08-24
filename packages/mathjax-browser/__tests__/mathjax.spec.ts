import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { a11yHandler } from "../src/a11y.js";
import { chtml } from "../src/chtml.js";
import { createMathjaxInstance, mathjax } from "../src/index.js";
import { svg } from "../src/svg.js";

const examples = [
  "a=1",
  `\\frac {\\partial^r} {\\partial \\omega^r} \\left(\\frac {y^{\\omega}} {\\omega}\\right) = \\left(\\frac {y^{\\omega}} {\\omega}\\right) \\left\\{(\\log y)^r + \\sum_{i=1}^r \\frac {(-1)^ Ir \\cdots (r-i+1) (\\log y)^{ri}} {\\omega^i} \\right\\}`,
];

const svgInstance = createMathjaxInstance({
  output: svg(),
});

const markdownItSVG = MarkdownIt({ linkify: true }).use(mathjax, svgInstance);

const htmlInstance = createMathjaxInstance({
  output: chtml(),
});

const markdownItHTML = MarkdownIt({ linkify: true }).use(mathjax, htmlInstance);

describe("inline mathjax", () => {
  it("should output SVG", () => {
    examples.forEach((example) => {
      expect(markdownItSVG.render(`$${example}$`)).toMatchSnapshot();
      expect(
        markdownItSVG.render(`A tex equation $${example}$ inline.`),
      ).toMatchSnapshot();

      expect(markdownItSVG.render(`$${example}$`)).toMatch(
        /<svg .*>[\s\S]*<\/svg>/,
      );
      expect(markdownItSVG.render(`$${example}$`)).toMatch(
        /<mjx-container .*>.*<\/mjx-container>/,
      );
      expect(
        markdownItSVG.render(`A tex equation $${example}$ inline.`),
      ).toMatch(/<svg .*>[\s\S]*<\/svg>/);
      expect(
        markdownItSVG.render(`A tex equation $${example}$ inline.`),
      ).toMatch(/<mjx-container .*>.*<\/mjx-container>/);
    });
  });

  it("should output HTML", () => {
    examples.forEach((example) => {
      expect(markdownItHTML.render(`$${example}$`)).toMatchSnapshot();
      expect(
        markdownItHTML.render(`A tex equation $${example}$ inline.`),
      ).toMatchSnapshot();

      expect(markdownItHTML.render(`$${example}$`)).toMatch(
        /<mjx-container .*>.*<\/mjx-container>/,
      );
      expect(markdownItHTML.render(`$${example}$`)).toMatch(
        /<mjx-math .*>[\s\S]*<\/mjx-math>/,
      );

      expect(
        markdownItHTML.render(`A tex equation $${example}$ inline.`),
      ).toMatch(/<mjx-container .*>.*<\/mjx-container>/);
      expect(
        markdownItHTML.render(`A tex equation $${example}$ inline.`),
      ).toMatch(/<mjx-math .*>[\s\S]*<\/mjx-math>/);
    });
  });

  it("should output A11y", () => {
    const markdownItSVG = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({
        output: svg(),
        a11y: a11yHandler,
      }),
    );
    const markdownItHTML = MarkdownIt({ linkify: true }).use(
      mathjax,
      createMathjaxInstance({
        output: chtml(),
        a11y: a11yHandler,
      }),
    );

    examples.forEach((example) => {
      expect(markdownItSVG.render(`$${example}$`)).toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(
        markdownItSVG.render(`A tex equation $${example}$ inline.`),
      ).toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
      expect(markdownItHTML.render(`$${example}$`)).toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(
        markdownItHTML.render(`A tex equation $${example}$ inline.`),
      ).toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
    });
  });

  it("should not output A11y", () => {
    examples.forEach((example) => {
      expect(markdownItSVG.render(`$${example}$`)).not.toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(
        markdownItSVG.render(`A tex equation $${example}$ inline.`),
      ).not.toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
      expect(markdownItHTML.render(`$${example}$`)).not.toMatch(
        /<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/,
      );
      expect(
        markdownItHTML.render(`A tex equation $${example}$ inline.`),
      ).not.toMatch(/<mjx-assistive-mml .*>[\s\S]*<\/mjx-assistive-mml>/);
    });
  });

  it("should not render error msg when content is wrong", () => {
    expect(markdownItSVG.render("$\\fra{a}{b}$")).toMatchSnapshot();
    expect(markdownItHTML.render("$\\fra{a}{b}$")).toMatchSnapshot();
  });
});

describe("block mathjax", () => {
  it("should output SVG", () => {
    expect(markdownItSVG.render("$$\\frac{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownItSVG.render(`
$$
\\frac{a}{b}
$$
`),
    ).toMatchSnapshot();
  });

  it("should output HTML", () => {
    expect(markdownItHTML.render("$$\\frac{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownItHTML.render(`
$$
\\frac{a}{b}
$$
`),
    ).toMatchSnapshot();
  });

  it("should not render error msg when content is wrong", () => {
    expect(markdownItSVG.render("$$\\fra{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownItSVG.render(`
$$
\\fra{a}{b}
$$
`),
    ).toMatchSnapshot();

    expect(markdownItHTML.render("$$\\fra{a}{b}$$")).toMatchSnapshot();

    expect(
      markdownItHTML.render(`
$$
\\fra{a}{b}
$$
`),
    ).toMatchSnapshot();
  });

  it("should not output warnings when content has line breaks", () => {
    expect(
      markdownItSVG.render(`
$$
\\begin{alignedat}{2}
    10&x+ &3&y = 2 \\\\
    3&x+&13&y = 4
\\end{alignedat}
$$    
`),
    ).toMatchSnapshot();

    expect(
      markdownItHTML.render(`
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
    expect(markdownItSVG.render("$$\\frac{a}{b}$$")).toMatchSnapshot("content");

    expect(svgInstance.outputStyle().split("\n").length).toMatchSnapshot(
      "style",
    );
  });

  it("should generate correct CSS with HTML", () => {
    expect(markdownItHTML.render("$$\\frac{a}{b}$$")).toMatchSnapshot(
      "content",
    );

    expect(htmlInstance.outputStyle().split("\n").length).toMatchSnapshot(
      "style",
    );
  });
});

describe("check label result pre page", () => {
  it("should generate correct label and CSS with svg", () => {
    expect(
      markdownItSVG.render("$$\\label{eq:1}\\frac{a}{b}$$"),
    ).toMatchSnapshot("content1");

    svgInstance.reset();

    expect(
      markdownItSVG.render("$$\\label{eq:1}\\frac{a}{b}$$"),
    ).toMatchSnapshot("content2");

    expect(svgInstance.outputStyle().split("\n").length).toMatchSnapshot(
      "style",
    );
  });

  it("should generate correct label and CSS with HTML", () => {
    expect(
      markdownItHTML.render("$$\\label{eq:1}\\frac{a}{b}$$"),
    ).toMatchSnapshot("content1");

    htmlInstance.reset();

    expect(
      markdownItHTML.render("$$\\label{eq:1}\\frac{a}{b}$$"),
    ).toMatchSnapshot("content2");

    expect(htmlInstance.outputStyle().split("\n").length).toMatchSnapshot(
      "style",
    );
  });
});

it("should work with transformer", () => {
  const mathjaxInstance = createMathjaxInstance({
    output: svg(),
    transformer: (content: string) =>
      content.replace(/^(<[a-z-]+ )/g, "$1v-pre "),
  });
  const markdownIt = MarkdownIt({ linkify: true }).use(
    mathjax,
    mathjaxInstance,
  );

  expect(markdownIt.render(`$$a=1$$`)).toContain(" v-pre ");
  expect(markdownIt.render(`$a=1$`)).toContain(" v-pre ");
});
