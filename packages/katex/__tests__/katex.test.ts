import MarkdownIt from "markdown-it";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { katex } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(katex);
const markdownItHTML = MarkdownIt({ linkify: true }).use(katex, {
  output: "html",
});
const markdownItMathML = MarkdownIt({ linkify: true }).use(katex, {
  output: "mathml",
});
const markdownItWithError = MarkdownIt({ linkify: true }).use(katex, {
  throwOnError: true,
});

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

const examples = [
  "a=1",
  `\\frac {\\partial^r} {\\partial \\omega^r} \\left(\\frac {y^{\\omega}} {\\omega}\\right) = \\left(\\frac {y^{\\omega}} {\\omega}\\right) \\left\\{(\\log y)^r + \\sum_{i=1}^r \\frac {(-1)^ Ir \\cdots (r-i+1) (\\log y)^{ri}} {\\omega^i} \\right\\}`,
];

describe("inline katex", () => {
  it("should output htmlAndMathML", () => {
    examples.forEach((example) => {
      expect(markdownIt.render(`$${example}$`)).toMatchSnapshot();
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).toMatchSnapshot();

      expect(markdownIt.render(`$${example}$`)).toMatch(
        /<span class="katex"><span class="katex-mathml"><math .*>[.\n]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
      expect(markdownIt.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<span class="katex"><span class="katex-mathml"><math .*>[.\n]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
    });
  });

  it("should output HTML", () => {
    examples.forEach((example) => {
      expect(markdownItHTML.render(`$${example}$`)).toMatchSnapshot();
      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).toMatchSnapshot();

      expect(markdownItHTML.render(`$${example}$`)).toMatch(
        /<span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
      expect(markdownItHTML.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
    });
  });

  it("should output MathML", () => {
    examples.forEach((example) => {
      expect(markdownItMathML.render(`$${example}$`)).toMatchSnapshot();
      expect(markdownItMathML.render(`$${example}$`)).toMatch(
        /<span class="katex"><math .*>[.\n]*<\/math><\/span>/,
      );
      expect(markdownItMathML.render(`A tex equation $${example}$ inline.`)).toMatchSnapshot();
      expect(markdownItMathML.render(`A tex equation $${example}$ inline.`)).toMatch(
        /<span class="katex"><math .*>[.\n]*<\/math><\/span>/,
      );
    });
  });

  it("should not render error msg when content is wrong", () => {
    expect(markdownIt.render(String.raw`$\fra{a}{b}$`)).toMatchSnapshot();
  });

  it("should render error msg when content is wrong", () => {
    const originalError = globalThis.console.error;

    globalThis.console.error = vi.fn();

    expect(markdownItWithError.render(String.raw`$\fra{a}{b}$`)).toEqual(
      "<p><span class='katex-error' title='ParseError: KaTeX parse error: Undefined control sequence: \\fra at position 1: \\̲f̲r̲a̲{a}{b}'>\\fra{a}{b}</span></p>\n",
    );

    expect(globalThis.console.error).toHaveBeenCalledOnce();
    globalThis.console.error = originalError;
  });
});

describe("block katex", () => {
  it("should output htmlAndMathML", () => {
    examples.forEach((example) => {
      expect(markdownIt.render(`$$${example}$$`)).toMatchSnapshot();
      expect(markdownIt.render(`$$\n${example}\n$$`)).toMatchSnapshot();

      expect(markdownIt.render(`$$${example}$$`)).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-mathml"><math .*>[\s\S]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
      expect(markdownIt.render(`$$\n${example}\n$$`)).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-mathml"><math .*>[\s\S]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
    });
  });

  it("should output HTML", () => {
    examples.forEach((example) => {
      expect(markdownItHTML.render(`$$${example}$$`)).toMatchSnapshot();
      expect(markdownItHTML.render(`$$\n${example}\n$$`)).toMatchSnapshot();

      expect(markdownItHTML.render(`$$${example}$$`)).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
      expect(markdownItHTML.render(`$$\n${example}\n$$`)).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
    });
  });

  it("should output MathML", () => {
    examples.forEach((example) => {
      expect(markdownItMathML.render(`$$${example}$$`)).toMatchSnapshot();
      expect(markdownItMathML.render(`$$${example}$$`)).toMatch(
        /<p class='katex-block'><span class="katex"><math .*>[\s\S]*<\/math><\/span><\/p>/,
      );
      expect(markdownItMathML.render(`$$\n${example}\n$$`)).toMatchSnapshot();
      expect(markdownItMathML.render(`$$\n${example}\n$$`)).toMatch(
        /<p class='katex-block'><span class="katex"><math .*>[\s\S]*<\/math><\/span><\/p>/,
      );
    });
  });

  it("should not render error msg when content is wrong", () => {
    expect(markdownIt.render(String.raw`$$\fra{a}{b}$$`)).toMatchSnapshot();

    expect(
      markdownIt.render(`
$$
\\fra{a}{b}
$$
`),
    ).toMatchSnapshot();
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

  it("should render error msg when content is wrong", () => {
    const originalError = global.console.error;

    global.console.error = vi.fn();
    expect(markdownItWithError.render(String.raw`$$\fra{a}{b}$$`)).toMatch(
      /<p class='katex-block katex-error' title='[\s\S]*?'>[\s\S]*?<\/p>/,
    );

    expect(
      markdownItWithError.render(`
$$
\\fra{a}{b}
$$
`),
    ).toMatch(/<p class='katex-block katex-error' title='[\s\S]*?'>[\s\S]*?<\/p>/);

    expect(global.console.error).toHaveBeenCalledTimes(2);
    global.console.error = originalError;
  });
});

describe("default logger", () => {
  it("should not give warnings about new lines", () => {
    const mockConsole = {
      warn: vi.fn(),
    };

    vi.stubGlobal("console", mockConsole);

    markdownIt.render(`
$$
a = 1\\\\
b = 2
$$
`);

    expect(mockConsole.warn).toHaveBeenCalledTimes(0);

    markdownIt.render(`
$$
中文
$$
`);

    expect(mockConsole.warn).toHaveBeenCalledTimes(2);
  });
});

it("should support custom logger", () => {
  const logger1 = vi.fn();

  const markdownIt1 = MarkdownIt({ linkify: true }).use(katex, {
    logger: logger1,
  });

  markdownIt1.render(`$$中文$$`);

  markdownIt1.render(`
$$
中文
$$
`);

  expect(logger1).toHaveBeenCalledTimes(4);

  const logger2 = vi.fn();

  const markdownIt2 = MarkdownIt({ linkify: true }).use(katex, {
    logger: logger2,
  });

  markdownIt2.render(`
$$
a = 1\\\\
b = 2
$$
`);

  expect(logger2).toHaveBeenCalledOnce();
});

it("should work with transformer", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(katex, {
    transformer: (content: string) => content.replaceAll(/^(<[a-z]+ )/g, "$1v-pre "),
  });

  expect(markdownIt.render(`$$a=1$$`)).toContain(" v-pre ");
  expect(markdownIt.render(`$a=1$`)).toContain(" v-pre ");
});
