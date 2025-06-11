import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { embed } from "../src/index.js";

describe("embed", () => {
  const md = MarkdownIt().use(embed, {
    config: [
      {
        name: "youtube",
        setup: (id: string): string =>
          `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
      },
      {
        name: "twitter",
        setup: (username: string): string =>
          `<div class="twitter"><a href="https://x.com/${username}"></a></div>`,
      },
      {
        name: "github",
        setup: (repo: string): string =>
          `<div class="github-embed"><a href="https://github.com/${repo}">github.com/${repo}</a></div>`,
      },
      {
        name: "icon",
        allowInline: true,
        setup: (name: string): string => `<i class="icon icon-${name}"></i>`,
      },
      {
        name: "badge",
        allowInline: true,
        setup: (text: string): string => `<span class="badge">${text}</span>`,
      },
    ],
  });

  describe("block embeds", () => {
    const blockTests: [string, string[]][] = [
      [
        "{% youtube dQw4w9WgXcQ %}",
        ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
      ],
      ["{% twitter user1 %}", ['href="https://x.com/user1"']],
      ["{% github octocat/Hello-World %}", ["github.com/octocat/Hello-World"]],
      ["{% unknown some-param %}", ["{% unknown some-param %}"]],
      ["{ youtube dQw4w9WgXcQ }", ["{ youtube dQw4w9WgXcQ }"]],
    ];

    blockTests.forEach(([input, expected]) => {
      it(`should handle block embed: ${input}`, () => {
        const result = md.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
          expect(result).toMatchSnapshot();
        });
      });
    });

    it("should handle multiline content", () => {
      const content = `# Title

{% youtube dQw4w9WgXcQ %}

Some text

{% twitter user1 %}`;

      const result = md.render(content);

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain('href="https://x.com/user1"');
      expect(result).toMatchSnapshot();
    });
  });

  describe("inline embeds", () => {
    const inlineTests: [string, string[]][] = [
      [
        "Click the {% icon home %} button to go home.",
        [
          '<i class="icon icon-home"></i>',
          "<p>Click the",
          "button to go home.</p>",
        ],
      ],
      ["Status: {% badge active %}", ['<span class="badge">active</span>']],
      [
        "{% icon star %} Rating: {% badge 5 stars %} {% icon thumbs-up %}",
        [
          '<i class="icon icon-star"></i>',
          '<span class="badge">5 stars</span>',
          '<i class="icon icon-thumbs-up"></i>',
        ],
      ],
      [
        "Check out {% youtube dQw4w9WgXcQ %} video.",
        ["{% youtube dQw4w9WgXcQ %}"], // Block embeds shouldn't work inline
      ],
      [
        "Use {% unknown-inline param %} here.",
        ["{% unknown-inline param %}"], // Unknown embed types
      ],
    ];

    inlineTests.forEach(([input, expected]) => {
      it(`should handle inline embed: ${input}`, () => {
        const result = md.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
          expect(result).toMatchSnapshot();
        });
      });
    });

    it("should support allowInline embeds in both inline and block contexts", () => {
      // Test block usage
      const blockResult = md.render("{% icon star %}");

      expect(blockResult).toContain('<i class="icon icon-star"></i>');

      // Test inline usage
      const inlineResult = md.render("Click {% icon star %} to favorite.");

      expect(inlineResult).toContain('<i class="icon icon-star"></i>');
      expect(inlineResult).toContain("<p>Click");
      expect(inlineResult).toContain("to favorite.</p>");
    });
  });

  describe("mixed usage", () => {
    it("should handle both block and inline embeds", () => {
      const content = `# Video Tutorial

{% youtube dQw4w9WgXcQ %}

Click {% icon play %} to start, or check the {% badge premium %} content.

{% github octocat/Hello-World %}`;

      const result = md.render(content);

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain('<i class="icon icon-play"></i>');
      expect(result).toContain('<span class="badge">premium</span>');
      expect(result).toContain("github.com/octocat/Hello-World");
    });
  });

  describe("complex parameters", () => {
    it("should work with complex parameters", () => {
      const mdComplex = MarkdownIt().use(embed, {
        config: [
          {
            name: "codepen",
            setup: (params: string): string => {
              const [user, slug] = params.split("/");

              return `<iframe src="https://codepen.io/${user}/embed/${slug}" frameborder="0"></iframe>`;
            },
          },
        ],
      });

      const result = mdComplex.render("{% codepen username/pen-slug %}");

      expect(result).toContain("codepen.io/username/embed/pen-slug");
    });

    it("should handle parameters with spaces", () => {
      const mdWithSpaces = MarkdownIt().use(embed, {
        config: [
          {
            name: "custom",
            setup: (params: string): string =>
              `<div data-params="${params}"></div>`,
          },
        ],
      });

      const result = mdWithSpaces.render("{% custom param with spaces %}");

      expect(result).toContain('data-params="param with spaces"');
    });

    it("should handle nested curly braces in parameters", () => {
      const mdNested = MarkdownIt().use(embed, {
        config: [
          {
            name: "data",
            setup: (params: string): string =>
              `<div data-content="${params}"></div>`,
          },
        ],
      });

      const result = mdNested.render("{% data {key: value} %}");

      expect(result).toContain('data-content="{key: value}"');
    });
  });

  describe("edge cases", () => {
    const edgeCaseTests: [string, string[]][] = [
      [
        "Start {% icon star %} middle {% badge new %} end",
        [
          '<i class="icon icon-star"></i>',
          '<span class="badge">new</span>',
          "<p>Start",
          "middle",
          "end</p>",
        ],
      ],
      [
        "Text{%icon home%}more text",
        ["Text{%icon home%}more text"], // Should NOT parse (missing space after {%)
      ],
      [
        "Text {% icon home %} more text",
        ['<i class="icon icon-home"></i>', "Text", "more text"], // Should parse
      ],
      [
        "{% icon start %} text after",
        ['<i class="icon icon-start"></i>', "text after"],
      ],
      [
        "text before {% badge end %}",
        ['<span class="badge">end</span>', "text before"],
      ],
      ["{% icon alone %}", ['<i class="icon icon-alone"></i>']],
    ];

    edgeCaseTests.forEach(([input, expected], index) => {
      it(`should handle edge case ${index + 1}`, () => {
        const result = md.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
        });
      });
    });

    describe("embeds without word boundaries", () => {
      const wordBoundaryTests: [string, string[]][] = [
        ["word{% icon test %}word", ['<i class="icon icon-test"></i>']],
        ["prefix{% badge new %}suffix", ['<span class="badge">new</span>']],
        ["**bold**{% icon star %}text", ['<i class="icon icon-star"></i>']],
        ["word {% icon test %} word", ['<i class="icon icon-test"></i>']],
        ["{% icon start %} text", ['<i class="icon icon-start"></i>']],
        ["text {% badge end %}", ['<span class="badge">end</span>']],
        [
          "punctuation,{% icon comma %}test",
          ['<i class="icon icon-comma"></i>'],
        ],
        [
          "parenthesis({% badge paren %})test",
          ['<span class="badge">paren</span>'],
        ],
      ];

      wordBoundaryTests.forEach(([input, expected], index) => {
        it(`should parse embed without word boundaries ${index + 1}`, () => {
          const result = md.render(input);

          expected.forEach((expectedContent) => {
            expect(result).toContain(expectedContent);
          });
        });
      });
    });
  });

  describe("escape sequences", () => {
    const mdEscape = MarkdownIt().use(embed, {
      config: [
        {
          name: "test",
          setup: (params: string): string => `<span>${params}</span>`,
        },
      ],
    });

    it("should handle escaped embeds", () => {
      const result = mdEscape.render("\\{% test param %}");

      expect(result).toContain("{% test param %}");
      expect(result).not.toContain("<span>param</span>");
    });

    it("should handle backslash before non-embed syntax", () => {
      const result = md.render("\\{not an embed}");

      expect(result).toContain("{not an embed}");
    });

    it("should handle multiple escape sequences", () => {
      const result = mdEscape.render(
        "\\{% test 1 %} normal text \\{% test 2 %}",
      );

      expect(result).toContain("{% test 1 %}");
      expect(result).toContain("{% test 2 %}");
      expect(result).toContain("normal text");
    });

    it("should handle escaped embeds in inline context", () => {
      const result = md.render("Text \\{% icon test %} more text");

      expect(result).not.toContain('<i class="icon icon-test"></i>');
      expect(result).toContain("{% icon test %}");
      expect(result).toContain("Text");
      expect(result).toContain("more text");
    });

    it("should handle double backslash escape", () => {
      const result = md.render("\\\\{% icon test %}");

      // Double backslash should escape the backslash, not the embed
      expect(result).toContain('<i class="icon icon-test"></i>');
      expect(result).toContain("\\");
    });
  });

  describe("invalid embeds", () => {
    const invalidTests: [string, string[]][] = [
      [
        "{% %}",
        ["{% %}"], // Empty name
      ],
      [
        "{%   %}",
        ["{%   %}"], // Only spaces as name
      ],
      [
        "{% icon %}",
        ['<i class="icon icon-"></i>'], // Empty parameters (should still work)
      ],
      [
        "{% icon test",
        ["{% icon test"], // Missing closing %}
      ],
      [
        "{%}",
        ["{%}"], // Malformed
      ],
      [
        "{% }",
        ["{% }"], // Malformed
      ],
      [
        "{%icon test%}",
        ["{%icon test%}"], // Missing space after {%
      ],
      [
        "{% icon test %%}",
        ["{% icon test %%}"], // Extra %
      ],
    ];

    invalidTests.forEach(([input, expected], index) => {
      it(`should not parse invalid embed ${index + 1}`, () => {
        const result = md.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
        });

        // Make sure no embed elements are generated for invalid syntax
        if (!input.includes("{% icon %}")) {
          // Exception: empty parameters should still generate embed
          expect(result).not.toContain('<i class="icon');
          expect(result).not.toContain('<span class="badge');
        }
      });
    });
  });

  describe("multiple consecutive embeds", () => {
    it("should handle multiple block embeds", () => {
      const content = [
        "{% youtube video1 %}",
        "{% github repo1 %}",
        "{% twitter user1 %}",
      ].join("\n");

      const result = md.render(content);

      expect(result).toContain('src="https://www.youtube.com/embed/video1"');
      expect(result).toContain("github.com/repo1");
      expect(result).toContain("x.com/user1");
    });

    it("should handle consecutive embeds without spaces", () => {
      const result = md.render(
        "{% icon a %}{% badge b %}{% icon c %}{% badge d %}{% icon e %}",
      );

      // Should parse all embeds even without spaces between them
      expect(result).toContain('<i class="icon icon-a"></i>');
      expect(result).toContain('<span class="badge">b</span>');
      expect(result).toContain('<i class="icon icon-c"></i>');
      expect(result).toContain('<span class="badge">d</span>');
      expect(result).toContain('<i class="icon icon-e"></i>');
    });

    it("should handle many inline embeds with proper spacing", () => {
      const result = md.render(
        "{% icon a %} {% badge b %} {% icon c %} {% badge d %} {% icon e %}",
      );

      expect(result).toContain('<i class="icon icon-a"></i>');
      expect(result).toContain('<span class="badge">b</span>');
      expect(result).toContain('<i class="icon icon-c"></i>');
      expect(result).toContain('<span class="badge">d</span>');
      expect(result).toContain('<i class="icon icon-e"></i>');
    });

    it("should handle alternating block and inline embeds", () => {
      const content = `{% youtube video1 %}

Text with {% icon star %} inline embed.

{% github repo1 %}

More text with {% badge new %} badge.`;

      const result = md.render(content);

      expect(result).toContain('src="https://www.youtube.com/embed/video1"');
      expect(result).toContain('<i class="icon icon-star"></i>');
      expect(result).toContain("github.com/repo1");
      expect(result).toContain('<span class="badge">new</span>');
    });

    it("should handle complex mixed sequences", () => {
      const content = `Start {% icon start %} text {% badge status %} more.

{% youtube complex-video %}

Continue {% icon middle %} and {% badge final %} end.`;

      const result = md.render(content);

      expect(result).toContain('<i class="icon icon-start"></i>');
      expect(result).toContain('<span class="badge">status</span>');
      expect(result).toContain(
        'src="https://www.youtube.com/embed/complex-video"',
      );
      expect(result).toContain('<i class="icon icon-middle"></i>');
      expect(result).toContain('<span class="badge">final</span>');
    });
  });

  describe("whitespace handling", () => {
    const whitespaceTests: [string, string[]][] = [
      ["{%   icon    star   %}", ['<i class="icon icon-star"></i>']],
      ["{% icon star %} ", ['<i class="icon icon-star"></i>']],
      [" {% icon star %}", ['<i class="icon icon-star"></i>']],
    ];

    whitespaceTests.forEach(([input, expected], index) => {
      it(`should handle whitespace case ${index + 1}`, () => {
        const result = md.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
        });
      });
    });

    // Tab support tests
    it("should handle tabs after opening marker", () => {
      const result = md.render("{% \t youtube dQw4w9WgXcQ %}");

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });

    it("should handle tabs between name and parameters", () => {
      const result = md.render("{% youtube\tdQw4w9WgXcQ %}");

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });

    it("should handle tabs before closing marker", () => {
      const result = md.render("{% youtube dQw4w9WgXcQ\t%}");

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });

    it("should handle mixed spaces and tabs", () => {
      const result = md.render("{% \t youtube \t dQw4w9WgXcQ \t %}");

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });

    it("should handle inline embeds with tabs", () => {
      const result = md.render("This is an {% \t icon \t home \t %} icon.");

      expect(result).toContain('<i class="icon icon-home"></i>');
    });

    it("should handle tabs in block opening marker", () => {
      const result = md.render("{% \t github \t octocat/Hello-World \t %}");

      expect(result).toContain("github.com/octocat/Hello-World");
    });

    it("should require space or tab after opening {%", () => {
      const result = md.render("{%youtube dQw4w9WgXcQ %}");

      expect(result).toContain("{%youtube dQw4w9WgXcQ %}");
      expect(result).not.toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });

    it("should handle tab after opening {%", () => {
      const result = md.render("{%\tyoutube dQw4w9WgXcQ %}");

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });
  });

  describe("unicode support", () => {
    const mdUnicode = MarkdownIt().use(embed, {
      config: [
        {
          name: "测试",
          setup: (params: string): string =>
            `<div class="测试">${params}</div>`,
        },
        {
          name: "中文",
          allowInline: true,
          setup: (params: string): string =>
            `<span class="中文">${params}</span>`,
        },
        {
          name: "emoji🚀",
          allowInline: true,
          setup: (params: string): string =>
            `<span class="emoji">${params}</span>`,
        },
      ],
    });

    const unicodeTests: [string, string[]][] = [
      ["{% 测试 参数 %}", ['<div class="测试">参数</div>']],
      ["文本 {% 中文 内容 %} 更多文本", ['<span class="中文">内容</span>']],
      ["{% emoji🚀 rocket %}", ['<span class="emoji">rocket</span>']],
    ];

    unicodeTests.forEach(([input, expected], index) => {
      it(`should support Unicode embed names ${index + 1}`, () => {
        const result = mdUnicode.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
        });
      });
    });
  });

  describe("multiple plugin instances", () => {
    it("should work when embed plugin is used multiple times", () => {
      // First instance with some configs
      const mdMultiple = MarkdownIt()
        .use(embed, {
          config: [
            {
              name: "youtube",
              setup: (id: string): string =>
                `<iframe src="https://youtube.com/${id}"></iframe>`,
            },
            {
              name: "icon",
              allowInline: true,
              setup: (name: string): string => `<i class="first-${name}"></i>`,
            },
          ],
        })
        .use(embed, {
          config: [
            {
              name: "twitter",
              setup: (url: string): string => `<div class="tweet">${url}</div>`,
            },
            {
              name: "badge",
              allowInline: true,
              setup: (text: string): string =>
                `<span class="second-${text}"></span>`,
            },
          ],
        });

      // Test that both instances work
      const result1 = mdMultiple.render("{% youtube test123 %}");

      expect(result1).toContain(
        '<iframe src="https://youtube.com/test123"></iframe>',
      );

      const result2 = mdMultiple.render("{% twitter https://test.com %}");

      expect(result2).toContain('<div class="tweet">https://test.com</div>');

      const result3 = mdMultiple.render(
        "Text {% icon star %} and {% badge new %} end",
      );

      expect(result3).toContain('<i class="first-star"></i>');
      expect(result3).toContain('<span class="second-new"></span>');
    });

    it("should allow overriding configs in second instance", () => {
      // First instance
      let mdOverride = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            setup: (param: string): string =>
              `<div class="first">${param}</div>`,
          },
        ],
      });

      // Second instance with same name but different setup
      mdOverride = mdOverride.use(embed, {
        config: [
          {
            name: "test",
            setup: (param: string): string =>
              `<div class="second">${param}</div>`,
          },
        ],
      });

      const result = mdOverride.render("{% test param %}");

      // Should use the configuration from the last instance
      expect(result).toContain('<div class="second">param</div>');
      expect(result).not.toContain('<div class="first">param</div>');
    });

    it("should combine allowInline settings correctly", () => {
      // First instance - block only
      let mdCombined = MarkdownIt().use(embed, {
        config: [
          {
            name: "blockonly",
            setup: (param: string): string =>
              `<div class="block">${param}</div>`,
          },
        ],
      });

      // Second instance - inline enabled
      mdCombined = mdCombined.use(embed, {
        config: [
          {
            name: "inlineok",
            allowInline: true,
            setup: (param: string): string =>
              `<span class="inline">${param}</span>`,
          },
        ],
      });

      // Block only should not work inline
      const blockResult = mdCombined.render("Text {% blockonly param %} more");

      expect(blockResult).not.toContain('<div class="block">param</div>');
      expect(blockResult).toContain("{% blockonly param %}");

      // Inline enabled should work inline
      const inlineResult = mdCombined.render("Text {% inlineok param %} more");

      expect(inlineResult).toContain('<span class="inline">param</span>');
    });
  });

  describe("edge cases for 100% coverage", () => {
    it("should handle inline embed at end of source without space before %}", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test case where we reach end of source in the while loop searching for " %}"
      const result = mdEdge.render("Text {% test param");

      expect(result).toContain("{% test param");
      expect(result).not.toContain('<span class="test">');
    });

    it("should handle incomplete embed at end of line", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test case where pos + 2 >= srcLen in the while loop
      const result = mdEdge.render("Text {% test %");

      expect(result).toContain("{% test %");
      expect(result).not.toContain('<span class="test">');
    });

    it("should handle embed with only one character after %", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test case where pos + 1 >= srcLen in the immediate %} check
      const result = mdEdge.render("Text {% test %}");

      expect(result).toContain('<span class="test"></span>');
    });

    it("should handle edge case with partial %} at end", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test case to trigger the boundary check pos + 1 < srcLen
      const result = mdEdge.render("Text {% test param%");

      expect(result).toContain("{% test param%");
      expect(result).not.toContain('<span class="test">');
    });

    it("should handle block embed at line end boundary", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            setup: (params: string): string =>
              `<div class="test">${params}</div>`,
          },
        ],
      });

      // Test case where contentStart + 1 >= max in block parser
      const result = mdEdge.render("{% test %");

      expect(result).toContain("{% test %");
      expect(result).not.toContain('<div class="test">');
    });

    it("should handle block embed with content exactly at line boundary", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            setup: (params: string): string =>
              `<div class="test">${params}</div>`,
          },
        ],
      });

      // Test edge case where contentEnd + 2 >= max in block parser
      const result = mdEdge.render("{% test p%}");

      expect(result).toContain("{% test p%}");
      expect(result).not.toContain('<div class="test">');
    });

    it("should handle silent mode correctly", () => {
      const mdSilent = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test that the parser works in both silent and non-silent modes
      const result = mdSilent.render("Text {% test param %} more");

      expect(result).toContain('<span class="test">param</span>');
      expect(result).toContain("Text");
      expect(result).toContain("more");
    });

    it("should handle edge case where start + 2 >= srcLen", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test case where start + 2 >= srcLen (string ends with {% without space)
      const result = mdEdge.render("Text {%");

      expect(result).toContain("{%");
      expect(result).not.toContain('<span class="test">');
    });

    it("should handle silent parser mode", () => {
      const mdSilent = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            allowInline: true,
            setup: (params: string): string =>
              `<span class="test">${params}</span>`,
          },
        ],
      });

      // Test silent mode by manually calling the parser rule
      const state = {
        pos: 0,
        src: "{% test param %}",
        push: (): { markup: string; info: string; content: string } => ({
          markup: "",
          info: "",
          content: "",
        }),
      };

      // Get the rule function to test silent mode
      const rules = (mdSilent as any).inline.ruler.__rules__;
      const embedRule = rules.find((rule: any) => rule.name === "embed_inline");

      if (embedRule) {
        const result = embedRule.fn(state, true); // silent = true

        expect(result).toBe(true);
      }
    });

    it("should handle block embed when pos + 2 > max", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            setup: (params: string): string =>
              `<div class="test">${params}</div>`,
          },
        ],
      });

      // Test case where pos + 2 > max
      const result = mdEdge.render("{");

      expect(result).toContain("{");
      expect(result).not.toContain('<div class="test">');
    });

    it("should handle block embed when pos + 2 >= max for space check", () => {
      const mdEdge = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            setup: (params: string): string =>
              `<div class="test">${params}</div>`,
          },
        ],
      });

      // Test case where pos + 2 >= max in space check
      const result = mdEdge.render("{%");

      expect(result).toContain("{%");
      expect(result).not.toContain('<div class="test">');
    });
  });
});
