import { container } from "@mdit/plugin-container";
import MarkdownIt from "markdown-it";
import path from "upath";
import { describe, expect, it } from "vitest";

import type { IncludeEnv } from "../src/index.js";
import { include } from "../src/index.js";

const mdFixturePathRelative = "./__fixtures__/include.md";
const mdFixturePath = path.resolve(__dirname, mdFixturePathRelative);
const mdFixtureDeepIncludeRelative = "./__fixtures__/deepInclude.md";
const mdFixtureDeepIncludePath = path.resolve(__dirname, mdFixtureDeepIncludeRelative);
const mdFixtureSimpleIncludePathRelative = "./__fixtures__/simpleInclude.md";
const mdFixtureSimpleIncludePath = path.resolve(__dirname, mdFixtureSimpleIncludePathRelative);
const mdFixtureFrontmatterPathRelative = "./__fixtures__/frontmatter.md";
const mdFixtureFrontmatterPath = path.resolve(__dirname, mdFixtureFrontmatterPathRelative);

describe("directive", () => {
  const md = MarkdownIt({ html: true })
    .use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
      useComment: false,
    })
    .use(container, { name: "tip" });

  it("should be parsed as import markdown syntax", () => {
    const source = [
      "@include: /path/to/foo.js",
      " @include:/path/to/foo.js ",
      "@include:/path/to/foo.js ",
      " @include:/path/to/foo.js",
      "@include: /path/to/foo.js#region",
      "@include: /path/to/foo.js#region-2",
      "@include: /path/to/foo.js{9-}",
      "@include: /path/to/foo.js{-10}",
      "@include: /path/to/foo.js{1-10}",
    ];

    const env: IncludeEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toEqual(`${source.map(() => "<p>File not found</p>").join("\n")}\n`);
    expect(env.includedFiles).toEqual([
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
    ]);
  });

  it("should not be parsed as import markdown syntax", () => {
    const source = [
      "@inc ",
      "@include a.js ",
      "@include : /path/to/foo.js ",
      "@inlude:/path/to/foo.js ",
      "@include/path/to/foo.js",
    ];

    const env: IncludeEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toEqual(`${source.map((item) => `<p>${item.trim()}</p>`).join("\n")}\n`);
    expect(env.includedFiles).toEqual([]);
  });

  it("should be preserved", () => {
    const source = [
      "Word @include: /path/to/foo.js",
      "@include: /path/to/foo.js word",
      "In text @include: /path/to/foo.js in text",
      "`@include: /path/to/foo.js`",
    ];

    const env: IncludeEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toMatch(/@include: .*/);
    expect(env.includedFiles).toEqual([]);
  });
});

describe("comment", () => {
  const md = MarkdownIt({ html: true })
    .use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    })
    .use(container, { name: "tip" });

  it("should be parsed as import markdown syntax", () => {
    const source = [
      "<!-- @include: /path/to/foo.js -->",
      "<!-- @include:/path/to/foo.js -->",
      "<!--@include:/path/to/foo.js-->",
      "<!-- @include: /path/to/foo.js#region -->",
      "<!-- @include: /path/to/foo.js#region-2 -->",
      "<!-- @include: /path/to/foo.js{9-} -->",
      "<!-- @include: /path/to/foo.js{-10} -->",
      "<!-- @include: /path/to/foo.js{1-10} -->",
      `\
<!--
  @include:/path/to/foo.js
-->
`,
    ];

    const env: IncludeEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toEqual(`${source.map(() => "<p>File not found</p>").join("\n")}\n`);
    expect(env.includedFiles).toEqual([
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
      "/path/to/foo.js",
    ]);
  });

  it("should not be parsed as import markdown syntax", () => {
    const source = [
      "<!-- @inc -->",
      "<!-- @include: -->",
      "<!-- @include a.js -->",
      "<!-- @include : /path/to/foo.js -->",
      "<!-- @inlude:/path/to/foo.js -->",
      "<!-- @include: /path/to/foo.js ->",
    ];

    const env: IncludeEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toEqual(source.map((item) => item).join("\n"));
    expect(env.includedFiles).toEqual([]);
  });

  it("should be preserved", () => {
    const source = [
      "Word <!-- @include: /path/to/foo.js -->",
      "<!-- @include: /path/to/foo.js --> word",
      "In text <!-- @include: /path/to/foo.js --> in text",
      "`<!-- @include: /path/to/foo.js -->`",
    ];

    const env: IncludeEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toMatch(/<!-- @include: .* -->/);
    expect(env.includedFiles).toEqual([]);
  });

  describe("should include file content correctly", () => {
    it("should import all lines", () => {
      const source = `\
<!-- @include: ${mdFixturePathRelative} -->
`;

      const expected = `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`;

      const simpleSource = `\
<!-- @include: ${mdFixtureSimpleIncludePathRelative} -->
`;

      const simpleExpected = `\
<h1>ABC</h1>
<p>DEF</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual([mdFixturePath]);

      const env2: IncludeEnv = {
        filePath: __filename,
      };
      const simpleRendered = md.render(simpleSource, env2);

      expect(simpleRendered).toEqual(simpleExpected);
      expect(env2.includedFiles).toEqual([mdFixtureSimpleIncludePath]);
    });

    it("should import partial lines", () => {
      const source = [
        `<!-- @include: ${mdFixturePathRelative}{1-13} -->`,
        `<!-- @include: ${mdFixturePathRelative}{1-8} -->`,
        `<!-- @include: ${mdFixturePathRelative}{9-13} -->`,
        `<!-- @include: ${mdFixturePathRelative}{9-} -->`,
        `<!-- @include: ${mdFixturePathRelative}{-8} -->`,
        `<!-- @include: ${mdFixturePathRelative}{1-} -->`,
        `<!-- @include: ${mdFixturePathRelative}{-13} -->`,
      ];

      const expected = [
        `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`,
        `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
`,
        `\
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`,
        `\
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`,
        `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
`,
        `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`,
        `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`,
      ];

      source.forEach((item, index) => {
        const env: IncludeEnv = {
          filePath: __filename,
        };
        const rendered = md.render(item, env);

        expect(rendered).toEqual(expected[index]);
        expect(env.includedFiles).toEqual([mdFixturePath]);
      });
    });

    it("should import snippet", () => {
      const source = `<!-- @include: ${mdFixturePathRelative}#snippet -->`;

      const expected = `\
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual([mdFixturePath]);
    });

    it("should support not existed snippet", () => {
      const source = `<!-- @include: ${mdFixturePathRelative}#not-exist -->`;

      const expected = `\
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual([mdFixturePath]);
    });
  });

  describe("path resolving", () => {
    it("should resolve relative path according to filePath", () => {
      const source = `\
<!-- @include: /foo.md -->
<!-- @include: ./bar.md -->
`;
      const expected = `\
<p>File not found</p>
<p>File not found</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual(["/foo.md", path.resolve(__dirname, "./bar.md")]);
    });

    it("should resolve absolute path", () => {
      const source = `\
<!-- @include: /foo.md -->
<!-- @include: ${mdFixturePath} -->
`;
      const expected = `\
<p>File not found</p>
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`;

      const env: IncludeEnv = {
        filePath: null,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual(["/foo.md", mdFixturePath]);
    });

    it("should not resolve relative path if filePath is not provided", () => {
      const source = `\
<!-- @include: ./bar.md -->
`;
      const expected = `\
<p>Error when resolving path</p>
`;

      const env: IncludeEnv = {
        filePath: null,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual([]);
    });
  });

  it("should handle import path correctly", () => {
    const source = `\
<!-- @include: @fixtures/include.md -->
`;
    const expected = `\
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`;

    const mdWithOptions = MarkdownIt({ html: true })
      .use(include, {
        currentPath: (env: IncludeEnv) => env.filePath as string,
        resolvePath: (str: string): string =>
          str.replace(/^@fixtures/, path.resolve(__dirname, "./__fixtures__")),
      })
      .use(container, { name: "tip" });
    const env: IncludeEnv = {
      filePath: null,
    };
    const rendered = mdWithOptions.render(source, env);

    expect(rendered).toEqual(expected);
    expect(env.includedFiles).toEqual([mdFixturePath]);
  });

  describe("compatibility with other markdown syntax", () => {
    it("should terminate paragraph", () => {
      const source = `\
foo
<!-- @include: /path/to/foo.md -->
`;
      const expected = `\
<p>foo</p>
<p>File not found</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual(["/path/to/foo.md"]);
    });

    it("should terminate blockquote", () => {
      const source = `\
> foo
<!-- @include: /path/to/foo.md -->
`;
      const expected = `\
<blockquote>
<p>foo</p>
</blockquote>
<p>File not found</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual(["/path/to/foo.md"]);
    });

    it("should terminate comment", () => {
      const source = `\
<!-- comment -->
<!-- @include: /path/to/foo.md -->
`;
      const expected = `\
<!-- comment -->
<p>File not found</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toEqual(expected);
      expect(env.includedFiles).toEqual(["/path/to/foo.md"]);
    });

    it("should support deep import", () => {
      const source1 = `\
<!-- @include: ${mdFixtureDeepIncludeRelative} -->
`;
      const expected1 = `\
<h3>Heading 3</h3>
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`;

      const source2 = `\
<!-- @include: ${mdFixtureDeepIncludePath} -->
`;
      const expected2 = `\
<h3>Heading 3</h3>
<h2>Heading 2</h2>
<!-- #region snippet -->
<p>Contents containing <strong>bolded text</strong> and some markdown enhance features:</p>
<!-- #endregion snippet -->
<div class="tip">
<p>Hey how are <strong>you</strong>? :smile:</p>
</div>
`;

      const mdWithOptions = MarkdownIt({ html: true })
        .use(include, {
          currentPath: (env: IncludeEnv) => env.filePath as string,
          deep: true,
        })
        .use(container, { name: "tip" });
      const env1: IncludeEnv = {
        filePath: __filename,
      };
      const env2: IncludeEnv = {
        filePath: __filename,
      };

      expect(mdWithOptions.render(source1, env1)).toEqual(expected1);
      expect(env1.includedFiles).toEqual([mdFixtureDeepIncludePath, mdFixturePath]);
      expect(mdWithOptions.render(source2, env2)).toEqual(expected2);
      expect(env2.includedFiles).toEqual([mdFixtureDeepIncludePath, mdFixturePath]);
    });

    describe("the relative path of link/image", () => {
      const mdFixturePathRelative = "./__fixtures__/relative/includeLink.md";
      const mdFixturePath = path.resolve(__dirname, mdFixturePathRelative);
      const mdFixtureDeepIncludeRelative = "./__fixtures__/deepIncludeLink.md";
      const mdFixtureDeepIncludePath = path.resolve(__dirname, mdFixtureDeepIncludeRelative);

      it("should resolve the relative path of link/image in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathRelative} -->
`;

        const expected = `\
<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const rendered = md.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixturePath]);
      });

      it("should turn off resolve the relative path of link in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathRelative} -->
  `;

        const expected = `<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (env: IncludeEnv) => env.filePath as string,
          resolveLinkPath: false,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixturePath]);
      });

      it("should turn off resolve the relative path of image in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathRelative} -->
  `;

        const expected = `<p><img src="./a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (env: IncludeEnv) => env.filePath as string,
          resolveImagePath: false,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixturePath]);
      });

      it("should turn off resolve the relative path of image/link in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathRelative} -->
  `;

        const expected = `<p><img src="./a.jpg" alt="Image1">
<a href="./a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (env: IncludeEnv) => env.filePath as string,
          resolveImagePath: false,
          resolveLinkPath: false,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixturePath]);
      });

      it("should deeply resolve the relative path of link/image in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixtureDeepIncludeRelative} -->
`;

        const expected = `\
<h3>Heading 3</h3>
<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (env: IncludeEnv) => env.filePath as string,
          deep: true,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixtureDeepIncludePath, mdFixturePath]);
      });

      it("should resolve the correct relative path of link/image after the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathRelative} -->
[B](./b.md)
`;

        const expected = `\
<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
<p><a href="./b.md">B</a></p>
`;

        const env: IncludeEnv = {
          filePath: `${__filename}1`,
        };
        const rendered = md.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixturePath]);
      });
    });

    it("should ignore frontmatter", () => {
      const cases = [
        [
          `\
<!-- @include: ${mdFixtureFrontmatterPathRelative} -->
[B](./b.md)
`,
          `\
<p>Content 1</p>
<p>Content 2</p>
<p><a href="./b.md">B</a></p>
`,
        ],
        [
          `\
<!-- @include: ${mdFixtureFrontmatterPathRelative}{-5} -->
[B](./b.md)
`,
          `\
<p>Content 1</p>
<p><a href="./b.md">B</a></p>
`,
        ],
      ];

      cases.forEach(([source, expected]) => {
        const env: IncludeEnv = {
          filePath: `${__filename}1`,
        };

        const rendered = md.render(source, env);

        expect(rendered).toEqual(expected);
        expect(env.includedFiles).toEqual([mdFixtureFrontmatterPath]);
      });
    });
  });
});

describe("currentPath", () => {
  it("should throw if currentPath is not a function", () => {
    expect(() => {
      MarkdownIt({ html: true }).use(include, {
        currentPath: "not a function",
      });
    }).toThrowError('[@mdit/plugin-include]: "currentPath" is required');

    expect(() => {
      MarkdownIt({ html: true }).use(include);
    }).toThrowError('[@mdit/plugin-include]: "currentPath" is required');
  });

  it("should work with absolute path if currentPath is not return", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: () => null,
    });

    const source = `\
<!-- @include: ${mdFixtureSimpleIncludePath} -->
`;

    const expected = `\
<h1>ABC</h1>
<p>DEF</p>
`;

    const env: IncludeEnv = {};
    const rendered = md.render(source, env);

    expect(rendered).toEqual(expected);
    expect(env.includedFiles).toEqual([mdFixtureSimpleIncludePath]);
  });

  it("should fail with relative path if currentPath is not return", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: () => null,
    });

    const source = `\
<!-- @include: ./relative/path.md -->
`;

    const expected = `\
<p>Error when resolving path</p>
`;

    const env: IncludeEnv = {};
    const rendered = md.render(source, env);

    expect(rendered).toEqual(expected);
    expect(env.includedFiles).toEqual([]);
  });

  it("should handle include-env-start edge cases", () => {
    const md = MarkdownIt().use(include, {
      currentPath: () => "/path/to/current.md",
    });

    // this matches startsWith but not the regex
    md.render("<!-- #include-env-start: foo");
  });

  it("should ignore external links when resolving related links", () => {
    const md = MarkdownIt().use(include, {
      currentPath: () => "/path/to/current.md",
    });

    const rendered = md.render(
      `<!-- #include-env-start: /path/to/included.md -->\n![](https://example.com/img.png)\n<!-- #include-env-end -->`,
    );

    expect(rendered).toContain('src="https://example.com/img.png"');
  });
});
