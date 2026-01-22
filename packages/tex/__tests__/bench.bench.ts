import MarkdownIt from "markdown-it";
import { bench, describe } from "vitest";

import { tex as texCurrent } from "../src/index.js";
// @ts-ignore: This file only exists for benchmarking against the old version
import { tex as texOld } from "../src-old/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode ? `<p>{Tex content: ${content.trim()}}</p>\n` : `{Tex content: ${content.trim()}}`;

// Test data sets based on project requirements
const testData = {
  // 小文档: 1,000 字符
  small: {
    inline: "$a=1$ and $b=2$ with simple equations",
    block: "$$\na = 1 \\\\\nb = 2\n$$",
    mixed: "An equation $E=mc^2$ inline. $$\n\\sum_{i=1}^n i = \\frac{n(n+1)}{2}\n$$",
    mathFence: "```math\na = 1 + 2\n```",
  },

  // 中等文档: 10,000 字符
  medium: {
    inline: Array(50).fill("$x^2 + y^2 = z^2$ and $\\alpha + \\beta = \\gamma$").join(" "),
    block: Array(20)
      .fill(
        "$$\n\\frac{\\partial^2 f}{\\partial x^2} + \\frac{\\partial^2 f}{\\partial y^2} = 0\n$$",
      )
      .join("\n\n"),
    mixed: Array(30)
      .fill(
        "Complex equation $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$ inline.\n\n$$\n\\begin{aligned}\nx &= a + b \\\\\ny &= c + d\n\\end{aligned}\n$$",
      )
      .join("\n\n"),
    mathFence: Array(25)
      .fill("```math\n\\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6}\n```")
      .join("\n\n"),
  },

  // 大文档: 100,000 字符
  large: {
    inline: Array(500)
      .fill(
        "$\\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z-a} dz = f(a)$ and $\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$",
      )
      .join(" "),
    block: Array(200)
      .fill(
        "$$\n\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}\nd & -b \\\\\n-c & a\n\\end{bmatrix}\n$$",
      )
      .join("\n\n"),
    mixed: Array(150)
      .fill(
        "Advanced equation $\\oint_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega$ by Stokes' theorem.\n\n$$\n\\begin{cases}\n\\frac{\\partial u}{\\partial t} = \\Delta u + f(x,t) \\\\\nu(x,0) = u_0(x) \\\\\n\\frac{\\partial u}{\\partial n}\\bigg|_{\\partial \\Omega} = 0\n\\end{cases}\n$$",
      )
      .join("\n\n"),
    mathFence: Array(100)
      .fill(
        "```math\n\\begin{pmatrix}\n\\cos\\theta & -\\sin\\theta \\\\\n\\sin\\theta & \\cos\\theta\n\\end{pmatrix}\n\\begin{pmatrix}\nx \\\\\ny\n\\end{pmatrix}\n```",
      )
      .join("\n\n"),
  },
};

// Bracket syntax test data
const bracketTestData = {
  small: {
    inline: "\\(a=1\\) and \\(b=2\\) with simple equations",
    block: "\\[\na = 1 \\\\\nb = 2\n\\]",
    mixed: "An equation \\(E=mc^2\\) inline. \\[\n\\sum_{i=1}^n i = \\frac{n(n+1)}{2}\n\\]",
  },
  medium: {
    inline: Array(50).fill("\\(x^2 + y^2 = z^2\\) and \\(\\alpha + \\beta = \\gamma\\)").join(" "),
    block: Array(20)
      .fill(
        "\\[\n\\frac{\\partial^2 f}{\\partial x^2} + \\frac{\\partial^2 f}{\\partial y^2} = 0\n\\]",
      )
      .join("\n\n"),
    mixed: Array(30)
      .fill(
        "Complex equation \\(\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\\) inline.\n\n\\[\n\\begin{aligned}\nx &= a + b \\\\\ny &= c + d\n\\end{aligned}\n\\]",
      )
      .join("\n\n"),
  },
  large: {
    inline: Array(500)
      .fill(
        "\\(\\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z-a} dz = f(a)\\) and \\(\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}\\)",
      )
      .join(" "),
    block: Array(200)
      .fill(
        "\\[\n\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}\nd & -b \\\\\n-c & a\n\\end{bmatrix}\n\\]",
      )
      .join("\n\n"),
    mixed: Array(150)
      .fill(
        "Advanced equation \\(\\oint_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega\\) by Stokes' theorem.\n\n\\[\n\\begin{cases}\n\\frac{\\partial u}{\\partial t} = \\Delta u + f(x,t) \\\\\nu(x,0) = u_0(x) \\\\\n\\frac{\\partial u}{\\partial n}\\bigg|_{\\partial \\Omega} = 0\n\\end{cases}\n\\]",
      )
      .join("\n\n"),
  },
};

describe("tex plugin performance benchmarks", () => {
  // Dollar syntax benchmarks
  describe("dollar syntax performance", () => {
    const currentMd = MarkdownIt().use(texCurrent, {
      delimiters: "dollars",
      mathFence: true,
      render,
    });

    const oldMd = MarkdownIt().use(texOld, {
      delimiters: "dollars",
      mathFence: true,
      render,
    });

    describe("small documents (~1K chars)", () => {
      bench("current - inline", () => {
        currentMd.render(testData.small.inline);
      });

      bench("old - inline", () => {
        oldMd.render(testData.small.inline);
      });

      bench("current - block", () => {
        currentMd.render(testData.small.block);
      });

      bench("old - block", () => {
        oldMd.render(testData.small.block);
      });

      bench("current - mixed", () => {
        currentMd.render(testData.small.mixed);
      });

      bench("old - mixed", () => {
        oldMd.render(testData.small.mixed);
      });

      bench("current - mathFence", () => {
        currentMd.render(testData.small.mathFence);
      });

      bench("old - mathFence", () => {
        oldMd.render(testData.small.mathFence);
      });
    });

    describe("medium documents (~10K chars)", () => {
      bench("current - inline", () => {
        currentMd.render(testData.medium.inline);
      });

      bench("old - inline", () => {
        oldMd.render(testData.medium.inline);
      });

      bench("current - block", () => {
        currentMd.render(testData.medium.block);
      });

      bench("old - block", () => {
        oldMd.render(testData.medium.block);
      });

      bench("current - mixed", () => {
        currentMd.render(testData.medium.mixed);
      });

      bench("old - mixed", () => {
        oldMd.render(testData.medium.mixed);
      });

      bench("current - mathFence", () => {
        currentMd.render(testData.medium.mathFence);
      });

      bench("old - mathFence", () => {
        oldMd.render(testData.medium.mathFence);
      });
    });

    describe("large documents (~100K chars)", () => {
      bench("current - inline", () => {
        currentMd.render(testData.large.inline);
      });

      bench("old - inline", () => {
        oldMd.render(testData.large.inline);
      });

      bench("current - block", () => {
        currentMd.render(testData.large.block);
      });

      bench("old - block", () => {
        oldMd.render(testData.large.block);
      });

      bench("current - mixed", () => {
        currentMd.render(testData.large.mixed);
      });

      bench("old - mixed", () => {
        oldMd.render(testData.large.mixed);
      });

      bench("current - mathFence", () => {
        currentMd.render(testData.large.mathFence);
      });

      bench("old - mathFence", () => {
        oldMd.render(testData.large.mathFence);
      });
    });
  });

  // Bracket syntax benchmarks
  describe("bracket syntax performance", () => {
    const currentMd = MarkdownIt().use(texCurrent, {
      delimiters: "brackets",
      mathFence: true,
      render,
    });

    const oldMd = MarkdownIt().use(texOld, {
      delimiters: "brackets",
      mathFence: true,
      render,
    });

    describe("small documents (~1K chars)", () => {
      bench("current - inline", () => {
        currentMd.render(bracketTestData.small.inline);
      });

      bench("old - inline", () => {
        oldMd.render(bracketTestData.small.inline);
      });

      bench("current - block", () => {
        currentMd.render(bracketTestData.small.block);
      });

      bench("old - block", () => {
        oldMd.render(bracketTestData.small.block);
      });

      bench("current - mixed", () => {
        currentMd.render(bracketTestData.small.mixed);
      });

      bench("old - mixed", () => {
        oldMd.render(bracketTestData.small.mixed);
      });
    });

    describe("medium documents (~10K chars)", () => {
      bench("current - inline", () => {
        currentMd.render(bracketTestData.medium.inline);
      });

      bench("old - inline", () => {
        oldMd.render(bracketTestData.medium.inline);
      });

      bench("current - block", () => {
        currentMd.render(bracketTestData.medium.block);
      });

      bench("old - block", () => {
        oldMd.render(bracketTestData.medium.block);
      });

      bench("current - mixed", () => {
        currentMd.render(bracketTestData.medium.mixed);
      });

      bench("old - mixed", () => {
        oldMd.render(bracketTestData.medium.mixed);
      });
    });

    describe("large documents (~100K chars)", () => {
      bench("current - inline", () => {
        currentMd.render(bracketTestData.large.inline);
      });

      bench("old - inline", () => {
        oldMd.render(bracketTestData.large.inline);
      });

      bench("current - block", () => {
        currentMd.render(bracketTestData.large.block);
      });

      bench("old - block", () => {
        oldMd.render(bracketTestData.large.block);
      });

      bench("current - mixed", () => {
        currentMd.render(bracketTestData.large.mixed);
      });

      bench("old - mixed", () => {
        oldMd.render(bracketTestData.large.mixed);
      });
    });
  });

  // Combined syntax benchmarks (both dollars and brackets)
  describe("combined syntax performance", () => {
    const currentMd = MarkdownIt().use(texCurrent, {
      delimiters: "all",
      mathFence: true,
      render,
    });

    const oldMd = MarkdownIt().use(texOld, {
      delimiters: "all",
      mathFence: true,
      render,
    });

    const combinedData = {
      small: testData.small.mixed + "\n\n" + bracketTestData.small.mixed,
      medium: testData.medium.mixed + "\n\n" + bracketTestData.medium.mixed,
      large: testData.large.mixed + "\n\n" + bracketTestData.large.mixed,
    };

    describe("small documents (~2K chars)", () => {
      bench("current - combined", () => {
        currentMd.render(combinedData.small);
      });

      bench("old - combined", () => {
        oldMd.render(combinedData.small);
      });
    });

    describe("medium documents (~20K chars)", () => {
      bench("current - combined", () => {
        currentMd.render(combinedData.medium);
      });

      bench("old - combined", () => {
        oldMd.render(combinedData.medium);
      });
    });

    describe("large documents (~200K chars)", () => {
      bench("current - combined", () => {
        currentMd.render(combinedData.large);
      });

      bench("old - combined", () => {
        oldMd.render(combinedData.large);
      });
    });
  });

  // Special edge cases benchmarks
  describe("edge cases performance", () => {
    const currentMd = MarkdownIt().use(texCurrent, {
      delimiters: "all",
      mathFence: true,
      render,
    });

    const oldMd = MarkdownIt().use(texOld, {
      delimiters: "all",
      mathFence: true,
      render,
    });

    // Test with heavy escape sequences
    const escapeHeavyContent = Array(1000)
      .fill("\\$escaped\\$ and \\\\(also\\\\) escaped")
      .join(" ");

    bench("current - escape heavy", () => {
      currentMd.render(escapeHeavyContent);
    });

    bench("old - escape heavy", () => {
      oldMd.render(escapeHeavyContent);
    });

    // Test with many unclosed markers (should be fast rejection)
    const uncloseMarkers = Array(1000).fill("$unclosed and \\(also unclosed").join(" ");

    bench("current - unclosed markers", () => {
      currentMd.render(uncloseMarkers);
    });

    bench("old - unclosed markers", () => {
      oldMd.render(uncloseMarkers);
    });

    // Test with mixed content (tex and non-tex)
    const mixedContent = Array(500)
      .fill("Normal text $a=1$ more text \\(b=2\\) end. $$\nc=3\n$$ Final text.")
      .join("\n\n");

    bench("current - mixed content", () => {
      currentMd.render(mixedContent);
    });

    bench("old - mixed content", () => {
      oldMd.render(mixedContent);
    });
  });

  // AllowInlineWithSpace mode benchmarks
  describe("allowInlineWithSpace performance", () => {
    const currentMd = MarkdownIt().use(texCurrent, {
      delimiters: "dollars",
      allowInlineWithSpace: true,
      mathFence: true,
      render,
    });

    const oldMd = MarkdownIt().use(texOld, {
      delimiters: "dollars",
      allowInlineWithSpace: true,
      mathFence: true,
      render,
    });

    const spaceHeavyContent = Array(500).fill("$ a = 1 $ and $ b = 2 $ with spaces").join(" ");

    bench("current - space heavy", () => {
      currentMd.render(spaceHeavyContent);
    });

    bench("old - space heavy", () => {
      oldMd.render(spaceHeavyContent);
    });
  });
});
