import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode
    ? `\
<p>{Tex content: ${content.trim()}}</p>
`
    : `{Tex content: ${content.trim()}}`;

// Test configurations
const defaultMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  mathFence: true,
  render,
});

// Dollar mode configurations
const dollarModeMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  delimiters: "dollars",
  mathFence: true,
  render,
});

// Bracket mode configurations
const bracketModeMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  delimiters: "brackets",
  mathFence: true,
  render,
});

// Both mode configurations
const bothModeMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  delimiters: "all",
  mathFence: true,
  render,
});

// AllowSpace mode configurations
const allowSpaceDollarMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  allowInlineWithSpace: true,
  delimiters: "dollars",
  mathFence: true,
  render,
});

const allowSpaceBracketMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  allowInlineWithSpace: true,
  delimiters: "brackets",
  mathFence: true,
  render,
});

const allowSpaceBothMarkdownIt = MarkdownIt({ linkify: true }).use(tex, {
  allowInlineWithSpace: true,
  delimiters: "all",
  mathFence: true,
  render,
});

const noMathFenceMarkdownIt = MarkdownIt().use(tex, { render });

describe(tex, () => {
  describe("config", () => {
    it("should require render option", () => {
      expect(() => MarkdownIt({ linkify: true }).use(tex)).toThrowError(
        '[@mdit/plugin-tex]: "render" option should be a function',
      );
    });
  });

  describe("inline tex rendering", () => {
    describe("dollar mode", () => {
      describe("basic rendering", () => {
        const testCases: [string, string][] = [
          ["$a=1$", "<p>{Tex content: a=1}</p>\n"],
          ["A tex equation $a=1$ inline.", "<p>A tex equation {Tex content: a=1} inline.</p>\n"],
          [
            "$a=1$ $b=2$ and $c=3$",
            "<p>{Tex content: a=1} {Tex content: b=2} and {Tex content: c=3}</p>\n",
          ],
        ];

        testCases.forEach(([input, expected]) => {
          it(`should render: ${input}`, () => {
            expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
          });
        });

        const multilineTestCases: [string, string][] = [
          [
            `A tex equation
$a=1$
inline.`,
            `\
<p>A tex equation
{Tex content: a=1}
inline.</p>
`,
          ],
          [
            `A tex equation $a=1$ $b=2$ inline with $1 hot dogs and $c=3$.`,
            "<p>A tex equation {Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
          ],
        ];

        multilineTestCases.forEach(([input, expected]) => {
          it(`should render multiline: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      describe("rejection cases", () => {
        const rejectionCases: [string, string, string][] = [
          ["unclosed marker", "$a = 1", "<p>$a = 1</p>\n"],
          ["escaped opening", String.raw`\$a = 1$`, "<p>$a = 1$</p>\n"],
          ["escaped closing", String.raw`$a = 1\$`, "<p>$a = 1$</p>\n"],
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
            expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
          });
        });

        it("should handle complex escape sequences", () => {
          expect(dollarModeMarkdownIt.render(String.raw`$test\\$`)).toEqual(
            "<p>{Tex content: test\\\\}</p>\n",
          );
          expect(dollarModeMarkdownIt.render(String.raw`$test\\\$`)).toEqual("<p>$test\\$</p>\n");
          expect(dollarModeMarkdownIt.render(String.raw`$test\\\\$`)).toEqual(
            "<p>{Tex content: test\\\\\\\\}</p>\n",
          );
        });

        it("should handle lone dollar sign", () => {
          expect(dollarModeMarkdownIt.render("$")).toEqual("<p>$</p>\n");
        });
      });

      it("should ignore bracket syntax", () => {
        expect(dollarModeMarkdownIt.render(String.raw`\(a=1\)`)).toEqual("<p>(a=1)</p>\n");
        expect(dollarModeMarkdownIt.render(String.raw`\[a=1\]`)).toEqual("<p>[a=1]</p>\n");
      });
    });

    describe("bracket mode", () => {
      describe("basic rendering", () => {
        const bracketInlineCases: [string, string][] = [
          [String.raw`\(a=1\)`, "<p>{Tex content: a=1}</p>\n"],
          [
            String.raw`An equation \(E=mc^2\) inline.`,
            "<p>An equation {Tex content: E=mc^2} inline.</p>\n",
          ],
          [
            String.raw`\(x=1\) \(y=2\) and \(z=3\)`,
            "<p>{Tex content: x=1} {Tex content: y=2} and {Tex content: z=3}</p>\n",
          ],
        ];

        bracketInlineCases.forEach(([input, expected]) => {
          it(`should render bracket inline: ${input}`, () => {
            expect(bracketModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      describe("rejection cases", () => {
        const bracketRejectionCases: [string, string, string][] = [
          ["unclosed bracket inline", String.raw`\(a = 1`, "<p>(a = 1</p>\n"],
          ["escaped opening inline", String.raw`\\(a = 1\)`, "<p>\\(a = 1)</p>\n"],
          [
            "multiple escaped opening inline",
            String.raw`\\\(a = 1\)`,
            "<p>\\{Tex content: a = 1}</p>\n",
          ],
          [
            "multiple escaped closing inline",
            String.raw`\(a = 1\\\)`,
            "<p>{Tex content: a = 1\\\\}</p>\n",
          ],
          ["quadruple escaped opening inline", String.raw`\\\\(a = 1\)`, "<p>\\\\(a = 1)</p>\n"],
          [
            "escaped closing with multiple backslashes",
            String.raw`\(a = 1\\\\\)`,
            "<p>{Tex content: a = 1\\\\\\\\}</p>\n",
          ],
        ];

        bracketRejectionCases.forEach(([description, input, expected]) => {
          it(`should not render when ${description}: ${input}`, () => {
            expect(bracketModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      it("should ignore dollar syntax", () => {
        expect(bracketModeMarkdownIt.render("$a = 1$")).toEqual("<p>$a = 1$</p>\n");
        expect(bracketModeMarkdownIt.render("$$a = 1$$")).toEqual("<p>$$a = 1$$</p>\n");
      });
    });

    describe("both mode", () => {
      describe("basic rendering", () => {
        const bothSyntaxCases: [string, string][] = [
          ["$a=1$", "<p>{Tex content: a=1}</p>\n"],
          [String.raw`\(a=1\)`, "<p>{Tex content: a=1}</p>\n"],
          [
            String.raw`Both $x=1$ and \(y=2\) work.`,
            "<p>Both {Tex content: x=1} and {Tex content: y=2} work.</p>\n",
          ],
        ];

        bothSyntaxCases.forEach(([input, expected]) => {
          it(`should render both syntaxes: ${input}`, () => {
            expect(bothModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });
    });
  });

  describe("block tex rendering", () => {
    describe("dollar mode", () => {
      describe("basic rendering", () => {
        const blockCases: [string, string][] = [
          ["$$a=1$$", "<p>{Tex content: a=1}</p>\n"],
          [
            `$$
a = 1 \\\\
b = 2
$$`,
            "<p>{Tex content: a = 1 \\\\\nb = 2}</p>\n",
          ],
          [
            `$$a = 1 \\\\
b = 2
$$`,
            "<p>{Tex content: a = 1 \\\\\nb = 2}</p>\n",
          ],
        ];

        blockCases.forEach(([input, expected]) => {
          it(`should render block: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      describe("positioning and context", () => {
        const contextCases: [string, string][] = [
          [
            `test.
$$a = 1$$`,
            `<p>test.</p>\n<p>{Tex content: a = 1}</p>\n`,
          ],
          [
            `test.
$$
a = 1
$$`,
            `<p>test.</p>\n<p>{Tex content: a = 1}</p>\n`,
          ],
          [
            `- test

  $$a = 1

test.`,
            `<ul>\n<li>\n<p>test</p>\n<p>{Tex content: a = 1}</p>\n</li>\n</ul>\n<p>test.</p>\n`,
          ],
        ];

        contextCases.forEach(([input, expected]) => {
          it(`should handle context: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      describe("rejection cases", () => {
        const blockRejectionCases: [string, string, string][] = [
          ["inline with spaces", "All $$ a = 1 $$ is true.", "<p>All $$ a = 1 $$ is true.</p>\n"],
          ["escaped block", String.raw`\$\$a = 1$$`, "<p>$$a = 1$$</p>\n"],
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
            expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
          });
        });

        it("should handle empty block content", () => {
          expect(dollarModeMarkdownIt.render("$$")).toEqual("<p>{Tex content: }</p>\n");
          expect(dollarModeMarkdownIt.render("A $$ B")).toEqual("<p>A $$ B</p>\n");
        });

        it("should handle complex block scenarios", () => {
          expect(
            dollarModeMarkdownIt.render(`$$
a = 1
b = 2`),
          ).toMatch(/{Tex content:/);

          expect(
            dollarModeMarkdownIt.render(`  $$
    a = 1
  b = 2
$$`),
          ).toMatch(/{Tex content:/);

          expect(
            dollarModeMarkdownIt.render(`- list item
  $$
  a = 1
    b = 2
  $$`),
          ).toMatch(/{Tex content:/);
        });
      });

      it("should ignore bracket syntax", () => {
        expect(dollarModeMarkdownIt.render(String.raw`\[a=1\]`)).toEqual("<p>[a=1]</p>\n");
      });
    });

    describe("bracket mode", () => {
      describe("basic rendering", () => {
        const bracketBlockCases: [string, string][] = [
          [String.raw`\[a=1\]`, "<p>{Tex content: a=1}</p>\n"],
          [
            `\\[
x = \\frac{1}{2}
\\]`,
            "<p>{Tex content: x = \\frac{1}{2}}</p>\n",
          ],
          [
            `\\[x = 1 \\\\
y = 2
\\]`,
            "<p>{Tex content: x = 1 \\\\\ny = 2}</p>\n",
          ],
        ];

        bracketBlockCases.forEach(([input, expected]) => {
          it(`should render bracket block: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(bracketModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      describe("rejection cases", () => {
        const bracketRejectionCases: [string, string, string][] = [
          ["unclosed bracket block", String.raw`\[a = 1`, "<p>[a = 1</p>\n"],
          ["escaped opening block", String.raw`\\[a = 1\]`, "<p>\\[a = 1]</p>\n"],
        ];

        bracketRejectionCases.forEach(([description, input, expected]) => {
          it(`should not render when ${description}: ${input}`, () => {
            expect(bracketModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      it("should ignore dollar syntax", () => {
        expect(bracketModeMarkdownIt.render("$$a = 1$$")).toEqual("<p>$$a = 1$$</p>\n");
      });
    });

    describe("both mode", () => {
      describe("basic rendering", () => {
        const bothBlockCases: [string, string][] = [
          ["$$a=1$$", "<p>{Tex content: a=1}</p>\n"],
          [String.raw`\[a=1\]`, "<p>{Tex content: a=1}</p>\n"],
        ];

        bothBlockCases.forEach(([input, expected]) => {
          it(`should render both block syntaxes: ${input}`, () => {
            expect(bothModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });

      describe("mixed syntax in blocks", () => {
        const mixedBlockCases: [string, string][] = [
          [
            `$$
a = 1
$$

\\[
b = 2
\\]`,
            "<p>{Tex content: a = 1}</p>\n<p>{Tex content: b = 2}</p>\n",
          ],
        ];

        mixedBlockCases.forEach(([input, expected]) => {
          it(`should handle mixed block syntax: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(bothModeMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });
    });
  });

  describe("math fence rendering", () => {
    describe("dollar mode", () => {
      const fenceCases: [string, string][] = [
        [
          `\`\`\`math
a=1
\`\`\``,
          "<p>{Tex content: a=1}</p>\n",
        ],
        [
          `\`\`\`math
a = 1 \\\\
b = 2
\`\`\``,
          "<p>{Tex content: a = 1 \\\\\nb = 2}</p>\n",
        ],
        [
          `\`\`\` math 
a = 1
\`\`\``,
          "<p>{Tex content: a = 1}</p>\n",
        ],
      ];

      fenceCases.forEach(([input, expected]) => {
        it(`should render math fence: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
          expect(dollarModeMarkdownIt.render(input)).toEqual(expected);
        });
      });
    });

    describe("bracket mode", () => {
      const fenceCases: [string, string][] = [
        [
          `\`\`\`math
a=1
\`\`\``,
          "<p>{Tex content: a=1}</p>\n",
        ],
      ];

      fenceCases.forEach(([input, expected]) => {
        it(`should render math fence: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
          expect(bracketModeMarkdownIt.render(input)).toEqual(expected);
        });
      });
    });

    describe("both mode", () => {
      const fenceCases: [string, string][] = [
        [
          `\`\`\`math
a=1
\`\`\``,
          "<p>{Tex content: a=1}</p>\n",
        ],
      ];

      fenceCases.forEach(([input, expected]) => {
        it(`should render math fence: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
          expect(bothModeMarkdownIt.render(input)).toEqual(expected);
        });
      });
    });

    describe("fallback behavior", () => {
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
          expect(dollarModeMarkdownIt.render(input)).toMatch(expectedPattern);
        });
      });

      it("should fallback when mathFence is disabled", () => {
        const input = "```  math\na = 1\n```";

        expect(noMathFenceMarkdownIt.render(input)).toMatch(/language-math/);
      });

      it("should handle special characters in inline rendering", () => {
        expect(dollarModeMarkdownIt.render("$a=1$\t")).toEqual("<p>{Tex content: a=1}</p>\n");
      });

      it("should handle math fence with spaces in info", () => {
        expect(dollarModeMarkdownIt.render("```  math  \na = 1\n```")).toEqual(
          "<p>{Tex content: a = 1}</p>\n",
        );
      });
    });
  });

  describe("allowSpace mode", () => {
    describe("inline rendering", () => {
      describe("dollar mode", () => {
        const spaceAllowedCases: [string, string][] = [
          ["$a=1$", "<p>{Tex content: a=1}</p>\n"],
          ["$ a = 1 $", "<p>{Tex content: a = 1}</p>\n"],
          ["$a = 1 $", "<p>{Tex content: a = 1}</p>\n"],
          ["$ a = 1$", "<p>{Tex content: a = 1}</p>\n"],
          ["A tex equation $ a=1 $ inline.", "<p>A tex equation {Tex content: a=1} inline.</p>\n"],
        ];

        spaceAllowedCases.forEach(([input, expected]) => {
          it(`should render with spaces: ${input}`, () => {
            expect(allowSpaceDollarMarkdownIt.render(input)).toEqual(expected);
          });
        });

        it("should handle escaped currency", () => {
          expect(
            allowSpaceDollarMarkdownIt.render(`$a=1$ $b=2$ inline with \\$1 hot dogs and $c=3$.`),
          ).toEqual(
            "<p>{Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
          );
        });

        it("should ignore bracket syntax", () => {
          expect(allowSpaceDollarMarkdownIt.render(String.raw`\(a=1\)`)).toEqual("<p>(a=1)</p>\n");
          expect(allowSpaceDollarMarkdownIt.render(String.raw`\[a=1\]`)).toEqual("<p>[a=1]</p>\n");
        });
      });

      describe("bracket mode", () => {
        const bracketSpaceCases: [string, string][] = [
          [String.raw`\(a=1\)`, "<p>{Tex content: a=1}</p>\n"],
          [String.raw`\( a = 1 \)`, "<p>{Tex content: a = 1}</p>\n"],
          [
            String.raw`An equation \( E=mc^2 \) inline.`,
            "<p>An equation {Tex content: E=mc^2} inline.</p>\n",
          ],
        ];

        bracketSpaceCases.forEach(([input, expected]) => {
          it(`should render bracket with spaces: ${input}`, () => {
            expect(allowSpaceBracketMarkdownIt.render(input)).toEqual(expected);
          });
        });

        it("should ignore dollar syntax", () => {
          expect(allowSpaceBracketMarkdownIt.render("$a = 1$")).toEqual("<p>$a = 1$</p>\n");
          expect(allowSpaceBracketMarkdownIt.render("$$a = 1$$")).toEqual("<p>$$a = 1$$</p>\n");
        });
      });

      describe("both mode", () => {
        const bothSpaceCases: [string, string][] = [
          ["$a=1$", "<p>{Tex content: a=1}</p>\n"],
          [String.raw`\(a=1\)`, "<p>{Tex content: a=1}</p>\n"],
          ["$ a = 1 $", "<p>{Tex content: a = 1}</p>\n"],
          [String.raw`\( a = 1 \)`, "<p>{Tex content: a = 1}</p>\n"],
          [
            String.raw`Both $ x=1 $ and \( y=2 \) work.`,
            "<p>Both {Tex content: x=1} and {Tex content: y=2} work.</p>\n",
          ],
        ];

        bothSpaceCases.forEach(([input, expected]) => {
          it(`should render both syntaxes with spaces: ${input}`, () => {
            expect(allowSpaceBothMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });
    });

    describe("block rendering", () => {
      describe("dollar mode", () => {
        const blockSpaceCases: [string, string][] = [
          ["$$ a = 1 $$", "<p>{Tex content: a = 1}</p>\n"],
          [
            `$$
 a = 1 
$$`,
            "<p>{Tex content: a = 1}</p>\n",
          ],
        ];

        blockSpaceCases.forEach(([input, expected]) => {
          it(`should render block with spaces: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(allowSpaceDollarMarkdownIt.render(input)).toEqual(expected);
          });
        });

        it("should ignore bracket syntax", () => {
          expect(allowSpaceDollarMarkdownIt.render(String.raw`\[ a = 1 \]`)).toEqual(
            "<p>[ a = 1 ]</p>\n",
          );
        });
      });

      describe("bracket mode", () => {
        const bracketBlockSpaceCases: [string, string][] = [
          [String.raw`\[ a = 1 \]`, "<p>{Tex content: a = 1}</p>\n"],
          [
            `\\[
 x = \\frac{1}{2} 
\\]`,
            "<p>{Tex content: x = \\frac{1}{2}}</p>\n",
          ],
        ];

        bracketBlockSpaceCases.forEach(([input, expected]) => {
          it(`should render bracket block with spaces: ${input.replaceAll("\n", String.raw`\n`)}`, () => {
            expect(allowSpaceBracketMarkdownIt.render(input)).toEqual(expected);
          });
        });

        it("should ignore dollar syntax", () => {
          expect(allowSpaceBracketMarkdownIt.render("$$ a = 1 $$")).toEqual("<p>$$ a = 1 $$</p>\n");
        });
      });

      describe("both mode", () => {
        const bothBlockSpaceCases: [string, string][] = [
          ["$$ a = 1 $$", "<p>{Tex content: a = 1}</p>\n"],
          [String.raw`\[ a = 1 \]`, "<p>{Tex content: a = 1}</p>\n"],
        ];

        bothBlockSpaceCases.forEach(([input, expected]) => {
          it(`should render both block syntaxes with spaces: ${input}`, () => {
            expect(allowSpaceBothMarkdownIt.render(input)).toEqual(expected);
          });
        });
      });
    });
  });

  describe("default configuration", () => {
    it("should default to dollars when delimiters is not specified", () => {
      const defaultMd = MarkdownIt().use(tex, { render });

      expect(defaultMd.render("$a=1$")).toEqual("<p>{Tex content: a=1}</p>\n");
      expect(defaultMd.render(String.raw`\(a=1\)`)).toEqual("<p>(a=1)</p>\n");
    });
  });

  describe("silent mode and edge cases", () => {
    it("should handle silent mode", () => {
      const testCases = [
        [`[link $incomplete](url`, "<p>[link $incomplete](url</p>\n"],
        [`[link text $ invalid](url)`, '<p><a href="url">link text $ invalid</a></p>\n'],
      ];

      testCases.forEach(([input, expected]) => {
        expect(defaultMarkdownIt.render(input)).toEqual(expected);
      });
    });

    it("should handle text with math in link context", () => {
      expect(defaultMarkdownIt.render("[text with $math$](url)")).toEqual(
        '<p><a href="url">text with {Tex content: math}</a></p>\n',
      );
    });

    it("should handle incomplete markdown structures", () => {
      expect(defaultMarkdownIt.render("![alt $incomplete")).toEqual("<p>![alt $incomplete</p>\n");
    });
  });
});
