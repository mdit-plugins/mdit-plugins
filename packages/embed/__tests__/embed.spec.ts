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
        setup: (url: string): string =>
          `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`,
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
    it("should render YouTube embed", () => {
      const result = md.render("{% youtube dQw4w9WgXcQ %}");

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
    });

    it("should render Twitter embed", () => {
      const result = md.render(
        "{% twitter https://twitter.com/user/status/12345 %}",
      );

      expect(result).toMatchSnapshot();
      expect(result).toContain('href="https://twitter.com/user/status/12345"');
    });

    it("should render GitHub embed", () => {
      const result = md.render("{% github octocat/Hello-World %}");

      expect(result).toMatchSnapshot();
      expect(result).toContain("github.com/octocat/Hello-World");
    });

    it("should handle unknown embed type", () => {
      const result = md.render("{% unknown some-param %}");

      expect(result).toMatchSnapshot();
      expect(result).toContain("{% unknown some-param %}");
    });

    it("should not parse invalid syntax", () => {
      const result = md.render("{ youtube dQw4w9WgXcQ }");

      expect(result).not.toContain("iframe");
      expect(result).toContain("{ youtube dQw4w9WgXcQ }");
    });

    it("should handle multiline content", () => {
      const content = `# Title

{% youtube dQw4w9WgXcQ %}

Some text

{% twitter https://twitter.com/user/status/12345 %}`;

      const result = md.render(content);

      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain('href="https://twitter.com/user/status/12345"');
    });
  });

  describe("inline embeds", () => {
    it("should render inline icon embed", () => {
      const result = md.render("Click the {% icon home %} button to go home.");

      expect(result).toMatchSnapshot();
      expect(result).toContain('<i class="icon icon-home"></i>');
      expect(result).toContain("<p>Click the");
      expect(result).toContain("button to go home.</p>");
    });

    it("should render inline badge embed", () => {
      const result = md.render("Status: {% badge active %}");

      expect(result).toMatchSnapshot();
      expect(result).toContain('<span class="badge">active</span>');
    });

    it("should render multiple inline embeds", () => {
      const result = md.render(
        "{% icon star %} Rating: {% badge 5 stars %} {% icon thumbs-up %}",
      );

      expect(result).toMatchSnapshot();
      expect(result).toContain('<i class="icon icon-star"></i>');
      expect(result).toContain('<span class="badge">5 stars</span>');
      expect(result).toContain('<i class="icon icon-thumbs-up"></i>');
    });

    it("should not render block embeds inline", () => {
      const result = md.render("Check out {% youtube dQw4w9WgXcQ %} video.");

      expect(result).not.toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain("{% youtube dQw4w9WgXcQ %}");
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

    it("should handle unknown inline embed type", () => {
      const result = md.render("Use {% unknown-inline param %} here.");

      expect(result).toContain("{% unknown-inline param %}");
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
  });

  describe("edge cases", () => {
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

    it("should handle multiple embeds on same line", () => {
      const result = md.render(
        "Start {% icon star %} middle {% badge new %} end",
      );

      expect(result).toContain('<i class="icon icon-star"></i>');
      expect(result).toContain('<span class="badge">new</span>');
      expect(result).toContain("<p>Start");
      expect(result).toContain("middle");
      expect(result).toContain("end</p>");
    });

    it("should NOT handle embeds with no spaces around content", () => {
      const result = md.render("Text{%icon home%}more text");

      expect(result).not.toContain('<i class="icon icon-home"></i>');
      expect(result).toContain("Text{%icon home%}more text");
    });

    it("should handle embeds with proper word boundaries", () => {
      const result = md.render("Text {% icon home %} more text");

      expect(result).toContain('<i class="icon icon-home"></i>');
      expect(result).toContain("Text");
      expect(result).toContain("more text");
    });

    it("should handle embeds at line boundaries", () => {
      const content = `{% icon start %}
Middle content
{% badge end %}`;

      const result = md.render(content);

      expect(result).toContain('<i class="icon icon-start"></i>');
      expect(result).toContain('<span class="badge">end</span>');
    });

    it("should handle embeds at start of line", () => {
      const result = md.render("{% icon start %} text after");

      expect(result).toContain('<i class="icon icon-start"></i>');
      expect(result).toContain("text after");
    });

    it("should handle embeds at end of line", () => {
      const result = md.render("text before {% badge end %}");

      expect(result).toContain('<span class="badge">end</span>');
      expect(result).toContain("text before");
    });

    it("should handle embeds as entire line", () => {
      const result = md.render("{% icon alone %}");

      expect(result).toContain('<i class="icon icon-alone"></i>');
    });

    it("should require word boundaries for inline embeds", () => {
      // These should NOT be parsed as embeds
      const tests = [
        "word{%icon test%}word",
        "word{%icon test%} text",
        "text {%icon test%}word",
        "prefix{%badge test%}suffix",
      ];

      tests.forEach((test) => {
        const result = md.render(test);

        expect(result).not.toContain('<i class="icon');
        expect(result).not.toContain('<span class="badge');
        expect(result).toContain(test);
      });
    });

    it("should parse embeds with proper word boundaries", () => {
      // These should be parsed as embeds
      const tests = [
        "word {% icon test %} word",
        "{% icon start %} text",
        "text {% badge end %}",
        "punctuation, {% icon comma %} test",
        "parenthesis ({% badge paren %}) test",
      ];

      tests.forEach((test) => {
        const result = md.render(test);

        expect(result).toMatch(/<i class="icon|<span class="badge/);
      });
    });
  });

  describe("escape sequences", () => {
    it("should handle escaped embeds", () => {
      const mdEscape = MarkdownIt().use(embed, {
        config: [
          {
            name: "test",
            setup: (params: string): string => `<span>${params}</span>`,
          },
        ],
      });

      const result = mdEscape.render("\\{% test param %}");

      expect(result).not.toContain("<span>param</span>");
      expect(result).toContain("{% test param %}");
    });

    it("should handle backslash before non-embed syntax", () => {
      const result = md.render("\\{not an embed}");

      expect(result).toContain("\\{not an embed}");
    });

    it("should handle multiple escape sequences", () => {
      const result = md.render("\\{% test1 %} normal text \\{% test2 %}");

      expect(result).toContain("{% test1 %}");
      expect(result).toContain("{% test2 %}");
      expect(result).toContain("normal text");
    });
  });

  describe("multiple consecutive embeds", () => {
    it("should handle multiple block embeds", () => {
      const content = `{% youtube video1 %}
{% github repo1 %}
{% twitter tweet1 %}`;

      const result = md.render(content);

      expect(result).toContain('src="https://www.youtube.com/embed/video1"');
      expect(result).toContain("github.com/repo1");
      expect(result).toContain("twitter.com/user/status/tweet1");
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

    it("should NOT handle consecutive embeds without spaces", () => {
      const result = md.render(
        "{% icon a %}{% badge b %}{% icon c %}{% badge d %}{% icon e %}",
      );

      // Should not parse any embeds because they lack word boundaries
      expect(result).not.toContain('<i class="icon icon-a"></i>');
      expect(result).not.toContain('<span class="badge">b</span>');
      expect(result).not.toContain('<i class="icon icon-c"></i>');
      expect(result).not.toContain('<span class="badge">d</span>');
      expect(result).not.toContain('<i class="icon icon-e"></i>');
      expect(result).toContain(
        "{% icon a %}{% badge b %}{% icon c %}{% badge d %}{% icon e %}",
      );
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
    it("should handle extra whitespace in embed syntax", () => {
      const result = md.render("{%   icon    star   %}");

      expect(result).toContain('<i class="icon icon-star"></i>');
    });

    it("should handle embeds with trailing spaces", () => {
      const result = md.render("{% icon star %} ");

      expect(result).toContain('<i class="icon icon-star"></i>');
    });

    it("should handle embeds with leading spaces", () => {
      const result = md.render(" {% icon star %}");

      expect(result).toContain('<i class="icon icon-star"></i>');
    });

    it("should handle embeds in indented content", () => {
      const content = `    {% icon indented %}
        {% badge nested %}`;

      const result = md.render(content);

      expect(result).toContain('<i class="icon icon-indented"></i>');
      expect(result).toContain('<span class="badge">nested</span>');
    });
  });

  describe("multiple plugin instances", () => {
    it("should work when embed plugin is used multiple times", () => {
      // First instance with some configs
      let mdMultiple = MarkdownIt().use(embed, {
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
      });

      // Second instance with additional configs
      mdMultiple = mdMultiple.use(embed, {
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
