import MarkdownIt from "markdown-it";
import type { Env } from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import type { KatexLogger } from "../src/index.js";
import { katex } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(katex);
const markdownItHTML = new MarkdownIt({ linkify: true }).use(katex, {
  output: "html",
});
const markdownItMathML = new MarkdownIt({ linkify: true }).use(katex, {
  output: "mathml",
});
const markdownItWithError = new MarkdownIt({ linkify: true }).use(katex, {
  throwOnError: true,
});

const examples = [
  "a=1",
  `\\frac {\\partial^r} {\\partial \\omega^r} \\left(\\frac {y^{\\omega}} {\\omega}\\right) = \\left(\\frac {y^{\\omega}} {\\omega}\\right) \\left\\{(\\log y)^r + \\sum_{i=1}^r \\frac {(-1)^ Ir \\cdots (r-i+1) (\\log y)^{ri}} {\\omega^i} \\right\\}`,
];

describe("inline katex", () => {
  it("should output htmlAndMathML", () => {
    examples.forEach((example) => {
      const inline = markdownIt.render(`$${example}$`);
      const inlineInText = markdownIt.render(`A tex equation $${example}$ inline.`);

      expect(inline).toMatchSnapshot("inline");
      expect(inline).toMatch(
        /<span class="katex"><span class="katex-mathml"><math .*>[.\n]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
      expect(inlineInText).toMatchSnapshot("inline-in-text");
      expect(inlineInText).toMatch(
        /<span class="katex"><span class="katex-mathml"><math .*>[.\n]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
    });
  });

  it("should output HTML", () => {
    examples.forEach((example) => {
      const inline = markdownItHTML.render(`$${example}$`);
      const inlineInText = markdownItHTML.render(`A tex equation $${example}$ inline.`);

      expect(inline).toMatchSnapshot("inline");
      expect(inline).toMatch(
        /<span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );

      expect(inlineInText).toMatchSnapshot("inline-in-text");
      expect(inlineInText).toMatch(
        /<span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span>/,
      );
    });
  });

  it("should output MathML", () => {
    examples.forEach((example) => {
      const inline = markdownItMathML.render(`$${example}$`);
      const inlineInText = markdownItMathML.render(`A tex equation $${example}$ inline.`);

      expect(inline).toMatchSnapshot("inline");
      expect(inline).toMatch(/<span class="katex"><math .*>[.\n]*<\/math><\/span>/);

      expect(inlineInText).toMatchSnapshot("inline-in-text");
      expect(inlineInText).toMatch(/<span class="katex"><math .*>[.\n]*<\/math><\/span>/);
    });
  });

  it("should not render error msg when content is wrong", () => {
    expect(markdownIt.render(String.raw`$\fra{a}{b}$`)).toMatchSnapshot();
  });

  it("should render error msg when content is wrong", () => {
    const consoleError = vi.spyOn(globalThis.console, "error").mockImplementation(() => {});

    expect(markdownItWithError.render(String.raw`$\fra{a}{b}$`)).toBe(
      "<p><span class='katex-error' title='ParseError: KaTeX parse error: Undefined control sequence: \\fra at position 1: \\̲f̲r̲a̲{a}{b}'>\\fra{a}{b}</span></p>\n",
    );

    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

describe("block katex", () => {
  it("should output htmlAndMathML", () => {
    examples.forEach((example) => {
      const block = markdownIt.render(`$$${example}$$`);
      const blockWithLineBreaks = markdownIt.render(`$$\n${example}\n$$`);

      expect(block).toMatchSnapshot("block");
      expect(blockWithLineBreaks).toMatchSnapshot("block-with-line-breaks");

      expect(block).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-mathml"><math .*>[\s\S]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
      expect(blockWithLineBreaks).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-mathml"><math .*>[\s\S]*<\/math><\/span><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
    });
  });

  it("should output HTML", () => {
    examples.forEach((example) => {
      const block = markdownItHTML.render(`$$${example}$$`);
      const blockWithLineBreaks = markdownItHTML.render(`$$\n${example}\n$$`);

      expect(block).toMatchSnapshot("block");
      expect(blockWithLineBreaks).toMatchSnapshot("block-with-line-breaks");

      expect(block).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
      expect(blockWithLineBreaks).toMatch(
        /<p class='katex-block'><span class="katex-display"><span class="katex"><span class="katex-html" aria-hidden="true">.*<\/span><\/span><\/span><\/p>/,
      );
    });
  });

  it("should output MathML", () => {
    examples.forEach((example) => {
      const block = markdownItMathML.render(`$$${example}$$`);
      const blockWithLineBreaks = markdownItMathML.render(`$$\n${example}\n$$`);

      expect(block).toMatchSnapshot("block");
      expect(blockWithLineBreaks).toMatchSnapshot("block-with-line-breaks");

      expect(block).toMatch(
        /<p class='katex-block'><span class="katex"><math .*>[\s\S]*<\/math><\/span><\/p>/,
      );
      expect(blockWithLineBreaks).toMatch(
        /<p class='katex-block'><span class="katex"><math .*>[\s\S]*<\/math><\/span><\/p>/,
      );
    });
  });

  it("should not render error msg when content is wrong", () => {
    const block = markdownIt.render(String.raw`$$\fra{a}{b}$$`);
    const blockWithLineBreaks = markdownIt.render(`
$$
\\fra{a}{b}
$$
`);

    expect(block).not.toMatch(/mjx-error/);
    expect(blockWithLineBreaks).not.toMatch(/mjx-error/);

    expect(block).toMatchSnapshot("block");
    expect(blockWithLineBreaks).toMatchSnapshot("block-with-line-breaks");
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
    const consoleError = vi.spyOn(globalThis.console, "error").mockImplementation(() => {});

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

    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});

describe("default logger", () => {
  it("should not give warnings about new lines", () => {
    const mockConsole = {
      warn: vi.fn<(...args: unknown[]) => void>(),
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

    vi.unstubAllGlobals();
  });
});

describe("options", () => {
  it("should support custom logger", () => {
    const logger1 = vi.fn<KatexLogger<Env>>();

    const markdownIt1 = new MarkdownIt({ linkify: true }).use(katex, {
      logger: logger1,
    });

    markdownIt1.render(`$$中文$$`);

    markdownIt1.render(`
$$
中文
$$
`);

    expect(logger1).toHaveBeenCalledTimes(4);

    const logger2 = vi.fn<KatexLogger<Env>>();

    const markdownIt2 = new MarkdownIt({ linkify: true }).use(katex, {
      logger: logger2,
    });

    markdownIt2.render(`
$$
a = 1\\\\
b = 2
$$
`);

    expect(logger2).toHaveBeenCalledTimes(1);
  });

  it("should work with transformer", () => {
    const markdownItTransformer = new MarkdownIt({ linkify: true }).use(katex, {
      transformer: (content: string) => content.replaceAll(/^(?<tag><[a-z]+ )/g, "$<tag>v-pre "),
    });

    expect(markdownItTransformer.render(`$$a=1$$`)).toContain(" v-pre ");
    expect(markdownItTransformer.render(`$a=1$`)).toContain(" v-pre ");
  });
});

describe("gdef macros", () => {
  const macroSource = String.raw`$\gdef\foo{\text{LEAKED-MACRO}} \foo$`;

  it(String.raw`should not leak \gdef macros across documents`, () => {
    // doc 1 defines a macro with \gdef and uses it
    markdownIt.render(macroSource);

    // doc 2 must not know about \foo defined in doc 1
    const result = markdownIt.render(String.raw`$\foo$`);

    expect(result).not.toContain("LEAKED-MACRO");
  });

  it(String.raw`should keep \gdef macros within a single document`, () => {
    // use the html output to avoid the MathML annotation echoing the source tex
    const result = markdownItHTML.render(macroSource);

    expect(result).toContain("LEAKED-MACRO");
  });

  it(String.raw`should share \gdef macros across expressions within a document`, () => {
    const result = markdownItHTML.render(String.raw`$\gdef\foo{\text{LEAKED-MACRO}}$ and $\foo$`);

    expect(result).toContain("LEAKED-MACRO");
  });

  it("should not throw when rendering tokens without env", () => {
    const markdownItNoEnv = new MarkdownIt({ linkify: true }).use(katex);
    const tokens = markdownItNoEnv.parse(String.raw`$\gdef\foo{\text{LEAKED-MACRO}} \foo$`, {});

    expect(() =>
      markdownItNoEnv.renderer.render(tokens, markdownItNoEnv.options, void 0),
    ).not.toThrow();
  });

  it("should support global macros from options", () => {
    const markdownItMacros = new MarkdownIt({ linkify: true }).use(katex, {
      macros: { [String.raw`\foo`]: String.raw`\text{global}` },
    });

    expect(markdownItMacros.render(String.raw`$\foo$`)).toContain("global");
  });

  it(String.raw`should not leak \gdef macros via renderInline`, () => {
    markdownItHTML.renderInline(String.raw`$\gdef\foo{\text{LEAKED-MACRO}} \foo$`);

    // a following renderInline must not know about \foo defined above
    const result = markdownItHTML.renderInline(String.raw`$\foo$`);

    expect(result).not.toContain("LEAKED-MACRO");
  });
});
