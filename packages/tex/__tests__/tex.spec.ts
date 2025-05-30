import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode
    ? `<p>{Tex content: ${content.trim()}}</p>`
    : `{Tex content: ${content.trim()}}`;

// Test configurations
const defaultMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  mathFence: true,
  render,
});

const allowSpaceMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  allowInlineWithSpace: true,
  mathFence: true,
  render,
});

const noMathFenceMarkdownIt = MarkdownIt().use(tex, { render });

describe("tex plugin configuration", () => {
  it("should require render option", () => {
    expect(() => MarkdownIt({ linkify: true }).use(tex)).toThrowError();
  });
});

describe("inline tex rendering", () => {
  describe("default mode (no spaces allowed)", () => {
    const testCases: [string, string][] = [
      ["$a=1$", "<p>{Tex content: a=1}</p>\n"],
      [
        "A tex equation $a=1$ inline.",
        "<p>A tex equation {Tex content: a=1} inline.</p>\n",
      ],
      [
        "$a=1$ $b=2$ and $c=3$",
        "<p>{Tex content: a=1} {Tex content: b=2} and {Tex content: c=3}</p>\n",
      ],
    ];

    testCases.forEach(([input, expected]) => {
      it(`should render: ${input}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });

    const multilineTestCases: [string, string][] = [
      [
        `A tex equation
$a=1$
inline.`,
        `<p>A tex equation
{Tex content: a=1}
inline.</p>\n`,
      ],
      [
        `A tex equation $a=1$ $b=2$ inline with $1 hot dogs and $c=3$.`,
        "<p>A tex equation {Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
      ],
    ];

    multilineTestCases.forEach(([input, expected]) => {
      it(`should render multiline: ${input.replace(/\n/g, "\\n")}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });
  });

  describe("rejection cases (default mode)", () => {
    const rejectionCases: [string, string, string][] = [
      ["unclosed marker", "$a = 1", "<p>$a = 1</p>\n"],
      ["escaped opening", "\\$a = 1$", "<p>$a = 1$</p>\n"],
      ["escaped closing", "$a = 1\\$", "<p>$a = 1$</p>\n"],
      ["space before content", "$ a = 1$", "<p>$ a = 1$</p>\n"],
      ["space after content", "$a = 1 $", "<p>$a = 1 $</p>\n"],
      ["spaces around content", "$ a = 1 $", "<p>$ a = 1 $</p>\n"],
      ["closing followed by number", "$1=$1", "<p>$1=$1</p>\n"],
      ["currency context", "Of course $1 = $1", "<p>Of course $1 = $1</p>\n"],
      ["tab after opening", "$\ttest", "<p>$\ttest</p>\n"],
      ["tab before closing", "$test\t$", "<p>$test\t$</p>\n"],
      ["number after closing", "$test$1", "<p>$test$1</p>\n"],
    ];

    rejectionCases.forEach(([description, input, expected]) => {
      it(`should not render when ${description}: ${input}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });

    // Complex escape sequences
    it("should handle complex escape sequences", () => {
      expect(defaultMarkdownIt.render("$test\\\\$")).toEqual(
        "<p>{Tex content: test\\\\}</p>\n",
      );
      expect(defaultMarkdownIt.render("$test\\\\\\$")).toEqual(
        "<p>$test\\$</p>\n",
      );
      expect(defaultMarkdownIt.render("$test\\\\\\\\$")).toEqual(
        "<p>{Tex content: test\\\\\\\\}</p>\n",
      );
    });

    // Special characters
    it("should handle lone dollar sign", () => {
      expect(defaultMarkdownIt.render("$")).toEqual("<p>$</p>\n");
    });
  });

  describe("allowInlineWithSpace mode", () => {
    const spaceAllowedCases: [string, string][] = [
      ["$a=1$", "<p>{Tex content: a=1}</p>\n"],
      ["$ a = 1 $", "<p>{Tex content: a = 1}</p>\n"],
      ["$a = 1 $", "<p>{Tex content: a = 1}</p>\n"],
      ["$ a = 1$", "<p>{Tex content: a = 1}</p>\n"],
      [
        "A tex equation $ a=1 $ inline.",
        "<p>A tex equation {Tex content: a=1} inline.</p>\n",
      ],
    ];

    spaceAllowedCases.forEach(([input, expected]) => {
      it(`should render with spaces: ${input}`, () => {
        expect(allowSpaceMarkdownIt.render(input)).toEqual(expected);
      });
    });

    it("should handle escaped currency", () => {
      expect(
        allowSpaceMarkdownIt.render(
          `$a=1$ $b=2$ inline with \\$1 hot dogs and $c=3$.`,
        ),
      ).toEqual(
        "<p>{Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
      );
    });
  });
});

describe("block tex rendering", () => {
  describe("basic block syntax", () => {
    const blockCases: [string, string][] = [
      ["$$a=1$$", "<p>{Tex content: a=1}</p>"],
      [
        `$$
a = 1 \\\\
b = 2
$$`,
        "<p>{Tex content: a = 1 \\\\\nb = 2}</p>",
      ],
      [
        `$$a = 1 \\\\
b = 2
$$`,
        "<p>{Tex content: a = 1 \\\\\nb = 2}</p>",
      ],
    ];

    blockCases.forEach(([input, expected]) => {
      it(`should render block: ${input.replace(/\n/g, "\\n")}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });
  });

  describe("block positioning and context", () => {
    const contextCases: [string, string][] = [
      [
        `test.
$$a = 1$$`,
        `<p>test.</p>\n<p>{Tex content: a = 1}</p>`,
      ],
      [
        `test.
$$
a = 1
$$`,
        `<p>test.</p>\n<p>{Tex content: a = 1}</p>`,
      ],
      [
        `- test

  $$a = 1

test.`,
        `<ul>\n<li>\n<p>test</p>\n<p>{Tex content: a = 1}</p></li>\n</ul>\n<p>test.</p>\n`,
      ],
    ];

    contextCases.forEach(([input, expected]) => {
      it(`should handle context: ${input.replace(/\n/g, "\\n")}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });
  });

  describe("block rejection cases", () => {
    const blockRejectionCases: [string, string, string][] = [
      [
        "inline with spaces",
        "All $$ a = 1 $$ is true.",
        "<p>All $$ a = 1 $$ is true.</p>\n",
      ],
      ["escaped block", "\\$\\$a = 1$$", "<p>$$a = 1$$</p>\n"],
      [
        "escaped multiline block",
        `\\$\\$
a = 1
\\$\\$`,
        `<p>$$\na = 1\n$$</p>\n`,
      ],
    ];

    blockRejectionCases.forEach(([description, input, expected]) => {
      it(`should not render when ${description}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });

    // Empty content and complex scenarios
    it("should handle empty block content", () => {
      expect(defaultMarkdownIt.render("$$")).toEqual("<p>{Tex content: }</p>");
      expect(defaultMarkdownIt.render("A $$ B")).toEqual("<p>A $$ B</p>\n");
    });

    it("should handle complex block scenarios", () => {
      // Unclosed block at end of input
      expect(
        defaultMarkdownIt.render(`$$
a = 1
b = 2`),
      ).toMatch(/{Tex content:/);

      // Block with indentation issues
      expect(
        defaultMarkdownIt.render(`  $$
    a = 1
  b = 2
$$`),
      ).toMatch(/{Tex content:/);

      // List context with indentation
      expect(
        defaultMarkdownIt.render(`- list item
  $$
  a = 1
    b = 2
  $$`),
      ).toMatch(/{Tex content:/);
    });
  });
});

describe("math fence rendering", () => {
  describe("math fence syntax", () => {
    const fenceCases: [string, string][] = [
      [
        `\`\`\`math
a=1
\`\`\``,
        "<p>{Tex content: a=1}</p>",
      ],
      [
        `\`\`\`math
a = 1 \\\\
b = 2
\`\`\``,
        "<p>{Tex content: a = 1 \\\\\nb = 2}</p>",
      ],
      [
        `\`\`\` math 
a = 1
\`\`\``,
        "<p>{Tex content: a = 1}</p>",
      ],
    ];

    fenceCases.forEach(([input, expected]) => {
      it(`should render math fence: ${input.replace(/\n/g, "\\n")}`, () => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });
  });

  describe("fence fallback behavior", () => {
    const fallbackCases: [string, RegExp][] = [
      [
        `\`\`\`js
const a = 1;
\`\`\``,
        /<pre><code class="language-js">const a = 1;\n<\/code><\/pre>\n/,
      ],
      [
        `\`\`\`javascript
const a = 1;
console.log(a);
\`\`\``,
        /language-javascript/,
      ],
      [
        `\`\`\`
plain code
\`\`\``,
        /<pre><code>plain code\n<\/code><\/pre>\n/,
      ],
    ];

    fallbackCases.forEach(([input, expectedPattern]) => {
      it(`should fallback for non-math fence: ${input.split("\n")[0]}`, () => {
        expect(defaultMarkdownIt.render(input)).toMatch(expectedPattern);
      });
    });

    it("should fallback when mathFence is disabled", () => {
      const input = `\`\`\`math
a = 1
\`\`\``;

      expect(noMathFenceMarkdownIt.render(input)).toMatch(/language-math/);
    });

    it("should handle special characters in inline rendering", () => {
      expect(defaultMarkdownIt.render("$a=1$\t")).toEqual(
        "<p>{Tex content: a=1}</p>\n",
      );
    });

    it("should handle math fence with spaces in info", () => {
      expect(
        defaultMarkdownIt.render(`\`\`\`  math  
a = 1
\`\`\``),
      ).toEqual("<p>{Tex content: a = 1}</p>");
    });
  });
});

it("silent mode", () => {
  const testCases = [
    [`[link $incomplete](url`, "<p>[link $incomplete](url</p>\n"],
    [
      `[link text $ invalid](url)`,
      '<p><a href="url">link text $ invalid</a></p>\n',
    ],
  ];

  testCases.forEach(([input, expected]) => {
    expect(defaultMarkdownIt.render(input)).toEqual(expected);
  });
});
