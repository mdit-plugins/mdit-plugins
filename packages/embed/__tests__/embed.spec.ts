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
    it("should handle block embed", () => {
      const blockTests: [string, string[]][] = [
        [
          "{% youtube dQw4w9WgXcQ %}",
          ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
        ],
        ["{% twitter user1 %}", ['href="https://x.com/user1"']],
        [
          "{% github octocat/Hello-World %}",
          ["github.com/octocat/Hello-World"],
        ],
        [
          "{%youtube dQw4w9WgXcQ%}",
          ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
        ],
        ["{% unknown some-param %}", ["{% unknown some-param %}"]],
        ["{ youtube dQw4w9WgXcQ }", ["{ youtube dQw4w9WgXcQ }"]],
      ];

      blockTests.forEach(([input, expected]) => {
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

    it("should break other block elements", () => {
      const blockTests: [string, string[]][] = [
        // break paragraph
        [
          "abc\n{% youtube dQw4w9WgXcQ %}",
          ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
        ],
        // break lists
        [
          "- abc\n{% youtube dQw4w9WgXcQ %}",
          ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
        ],
        // break blockquotes
        [
          "> abc\n{% youtube dQw4w9WgXcQ %}",
          ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
        ],
      ];

      blockTests.forEach(([input, expected]) => {
        const result = md.render(input);

        expected.forEach((expectedContent) => {
          expect(result).toContain(expectedContent);
          expect(result).toMatchSnapshot();
        });
      });
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
      [
        "Click the {% icon {% icon home %} home %} button to go home.",
        [
          '<i class="icon icon-home"></i>',
          "<p>Click the {% icon",
          "home %} button to go home.</p>",
        ], // find nearest marker
      ],
      [
        "{% icon {% icon home %} home %}",
        ['<i class="icon icon-home"></i>', "<p>{% icon", "home %}</p>"], // find nearest marker
      ],
    ];

    it("should handle inline embed", () => {
      inlineTests.forEach(([input, expected]) => {
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

  describe("escape sequences", () => {
    const mdEscape = MarkdownIt().use(embed, {
      config: [
        {
          name: "test",
          allowInline: true,
          setup: (params: string): string => `<span>${params}</span>`,
        },
      ],
    });

    it("should render valid unescaped embeds", () => {
      const testCases = [
        "\\\\{% test param %}",
        "\\\\{% test param %}",
        "{% test \\{% param %\\} %}",
      ];

      testCases.forEach((testCase) => {
        const result = mdEscape.render(testCase);

        expect(result).toContain("<span>");
        expect(result).toContain("</span>");
        expect(result).toMatchSnapshot();
      });
    });

    it("should not render escaped embeds", () => {
      const testCases = ["\\{% test param %}", "{% test param %\\}"];

      testCases.forEach((testCase) => {
        const result = mdEscape.render(testCase);

        expect(result).not.toContain("<span>");
        expect(result).not.toContain("</span>");
        expect(result).toMatchSnapshot();
      });
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
    ];

    it("should not parse invalid embed", () => {
      invalidTests.forEach(([input, expected]) => {
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

  it("whitespace handling", () => {
    const whitespaceTests: [string, string[]][] = [
      ["{%   icon    star   %}", ['<i class="icon icon-star"></i>']],
      ["{% icon star %} ", ['<i class="icon icon-star"></i>']],
      [" {% icon star %}", ['<i class="icon icon-star"></i>']],
      [
        "{%\tyoutube\tdQw4w9WgXcQ\t%}",
        ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
      ],
      [
        "{% \t youtube \t dQw4w9WgXcQ \t %}",
        ['src="https://www.youtube.com/embed/dQw4w9WgXcQ"'],
      ],
    ];

    whitespaceTests.forEach(([input, expected]) => {
      const result = md.render(input);

      expected.forEach((expectedContent) => {
        expect(result).toContain(expectedContent);
      });
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
});
