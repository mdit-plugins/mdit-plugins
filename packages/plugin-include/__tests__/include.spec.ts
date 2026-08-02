import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import { container } from "@mdit/plugin-container";
import MarkdownIt from "markdown-it";
import { resolve, join } from "upath";
import { describe, expect, it, vi } from "vitest";

import type { IncludeEnv } from "../src/index.js";
import { include, resolveInclude } from "../src/index.js";
import type { MarkdownItIncludeOptions } from "../src/options.js";

// Simulate an unreadable file (EACCES) for a specific marker path, delegating
// all other fs calls to the real implementation so existing tests are unaffected.
// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("node:fs", async (importOriginal) => {
  // oxlint-disable-next-line typescript/consistent-type-imports
  const actual = await importOriginal<typeof import("node:fs")>();
  const blockedPath = "/__eacces__/blocked.md";

  return {
    ...actual,
    // oxlint-disable-next-line typescript/explicit-function-return-type
    existsSync: (...args: Parameters<typeof actual.existsSync>) => {
      // oxlint-disable-next-line eslint/prefer-destructuring
      const path = args[0];

      return String(path) === blockedPath ? true : actual.existsSync(...args);
    },
    // oxlint-disable-next-line typescript/explicit-function-return-type
    statSync: (...args: Parameters<typeof actual.statSync>) => {
      // oxlint-disable-next-line eslint/prefer-destructuring
      const path = args[0];

      if (String(path) === blockedPath)
        return { isFile: (): boolean => true } as ReturnType<typeof actual.statSync>;

      return actual.statSync(...args);
    },
    // oxlint-disable-next-line typescript/explicit-function-return-type
    readFileSync: (...args: Parameters<typeof actual.readFileSync>) => {
      // oxlint-disable-next-line eslint/prefer-destructuring
      const path = args[0];

      if (String(path) === blockedPath) {
        const error = new Error(
          `EACCES: permission denied, open '${String(path)}'`,
        ) as NodeJS.ErrnoException;

        error.code = "EACCES";
        throw error;
      }

      return actual.readFileSync(...args);
    },
  };
});

const mdFixturePathRelative = "./__fixtures__/include.md";
const mdFixturePath = resolve(__dirname, mdFixturePathRelative);
const mdFixtureDeepRelative = "./__fixtures__/deepInclude.md";
const mdFixtureDeepPath = resolve(__dirname, mdFixtureDeepRelative);
const mdFixtureSimplePathRelative = "./__fixtures__/simpleInclude.md";
const mdFixtureSimplePath = resolve(__dirname, mdFixtureSimplePathRelative);
const mdFixtureFrontmatterPathRelative = "./__fixtures__/frontmatter.md";
const mdFixtureFrontmatterPath = resolve(__dirname, mdFixtureFrontmatterPathRelative);

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

    expect(rendered).toBe(`${source.map(() => "<p>File not found</p>").join("\n")}\n`);
    expect(env.includedFiles).toStrictEqual([
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

    expect(rendered).toBe(`${source.map((item) => `<p>${item.trim()}</p>`).join("\n")}\n`);
    expect(env.includedFiles).toStrictEqual([]);
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
    expect(env.includedFiles).toStrictEqual([]);
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

    expect(rendered).toBe(`${source.map(() => "<p>File not found</p>").join("\n")}\n`);
    expect(env.includedFiles).toStrictEqual([
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

    expect(rendered).toStrictEqual(source.map((item) => item).join("\n"));
    expect(env.includedFiles).toStrictEqual([]);
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
    expect(env.includedFiles).toStrictEqual([]);
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
<!-- @include: ${mdFixtureSimplePathRelative} -->
`;

      const simpleExpected = `\
<h1>ABC</h1>
<p>DEF</p>
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual([mdFixturePath]);

      const env2: IncludeEnv = {
        filePath: __filename,
      };
      const simpleRendered = md.render(simpleSource, env2);

      expect(simpleRendered).toStrictEqual(simpleExpected);
      expect(env2.includedFiles).toStrictEqual([mdFixtureSimplePath]);
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

        expect(rendered).toStrictEqual(expected[index]);
        expect(env.includedFiles).toStrictEqual([mdFixturePath]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual([mdFixturePath]);
    });

    it("should support not existed snippet", () => {
      const source = `<!-- @include: ${mdFixturePathRelative}#not-exist -->`;

      const expected = `\
`;

      const env: IncludeEnv = {
        filePath: __filename,
      };
      const rendered = md.render(source, env);

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual([mdFixturePath]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual(["/foo.md", resolve(__dirname, "./bar.md")]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual(["/foo.md", mdFixturePath]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual([]);
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
          str.replace(/^@fixtures/, resolve(__dirname, "./__fixtures__")),
      })
      .use(container, { name: "tip" });
    const env: IncludeEnv = {
      filePath: null,
    };
    const rendered = mdWithOptions.render(source, env);

    expect(rendered).toStrictEqual(expected);
    expect(env.includedFiles).toStrictEqual([mdFixturePath]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual(["/path/to/foo.md"]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual(["/path/to/foo.md"]);
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

      expect(rendered).toStrictEqual(expected);
      expect(env.includedFiles).toStrictEqual(["/path/to/foo.md"]);
    });

    it("should support deep import", () => {
      const source1 = `\
<!-- @include: ${mdFixtureDeepRelative} -->
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
<!-- @include: ${mdFixtureDeepPath} -->
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

      expect(mdWithOptions.render(source1, env1)).toStrictEqual(expected1);
      expect(env1.includedFiles).toStrictEqual([mdFixtureDeepPath, mdFixturePath]);
      expect(mdWithOptions.render(source2, env2)).toStrictEqual(expected2);
      expect(env2.includedFiles).toStrictEqual([mdFixtureDeepPath, mdFixturePath]);
    });

    it("should not throw on circular deep include", () => {
      const dir = mkdtempSync(join(tmpdir(), "include-cycle-"));
      writeFileSync(join(dir, "a.md"), "a content\n<!-- @include: b.md -->");
      writeFileSync(join(dir, "b.md"), "b content\n<!-- @include: a.md -->");

      try {
        const mdWithOptions = MarkdownIt({ html: true })
          .use(include, {
            currentPath: (env: IncludeEnv) => env.filePath as string,
            deep: true,
          })
          .use(container, { name: "tip" });
        const env: IncludeEnv = {
          filePath: join(dir, "index.md"),
        };

        const rendered = mdWithOptions.render("<!-- @include: a.md -->", env);

        expect(rendered).toContain("a content");
        expect(rendered).toContain("b content");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should not throw when including a directory", () => {
      const dir = mkdtempSync(join(tmpdir(), "include-dir-"));
      const dirPath = join(dir, "dir.md");

      mkdirSync(dirPath);

      try {
        const mdWithOptions = MarkdownIt({ html: true })
          .use(include, {
            currentPath: (env: IncludeEnv) => env.filePath as string,
          })
          .use(container, { name: "tip" });
        const env: IncludeEnv = {
          filePath: join(dir, "index.md"),
        };

        const rendered = mdWithOptions.render("<!-- @include: dir.md -->", env);

        expect(rendered).toContain("File not found");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("should not throw when the included file is not readable", () => {
      const dir = mkdtempSync(join(tmpdir(), "include-eacces-"));

      try {
        const mdWithOptions = MarkdownIt({ html: true })
          .use(include, {
            currentPath: (env: IncludeEnv) => env.filePath as string,
          })
          .use(container, { name: "tip" });
        const env: IncludeEnv = {
          filePath: join(dir, "index.md"),
        };

        const rendered = mdWithOptions.render("<!-- @include: /__eacces__/blocked.md -->", env);

        expect(rendered).toContain("Failed to read file");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    describe("the relative path of link/image", () => {
      const mdFixturePathLinkRelative = "./__fixtures__/relative/includeLink.md";
      const mdFixtureLinkPath = resolve(__dirname, mdFixturePathLinkRelative);
      const mdFixtureDeepLinkRelative = "./__fixtures__/deepIncludeLink.md";
      const mdFixtureDeepLinkPath = resolve(__dirname, mdFixtureDeepLinkRelative);

      it("should resolve the relative path of link/image in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathLinkRelative} -->
`;

        const expected = `\
<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const rendered = md.render(source, env);

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureLinkPath]);
      });

      it("should turn off resolve the relative path of link in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathLinkRelative} -->
  `;

        const expected = `<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (includeEnv: IncludeEnv) => includeEnv.filePath as string,
          resolveLinkPath: false,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureLinkPath]);
      });

      it("should turn off resolve the relative path of image in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathLinkRelative} -->
  `;

        const expected = `<p><img src="./a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (includeEnv: IncludeEnv) => includeEnv.filePath as string,
          resolveImagePath: false,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureLinkPath]);
      });

      it("should turn off resolve the relative path of image/link in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathLinkRelative} -->
  `;

        const expected = `<p><img src="./a.jpg" alt="Image1">
<a href="./a.md">Markdown</a></p>
`;

        const env: IncludeEnv = {
          filePath: __filename,
        };
        const mdWithOptions = MarkdownIt().use(include, {
          currentPath: (includeEnv: IncludeEnv) => includeEnv.filePath as string,
          resolveImagePath: false,
          resolveLinkPath: false,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureLinkPath]);
      });

      it("should deeply resolve the relative path of link/image in the include md file", () => {
        const source = `\
<!-- @include: ${mdFixtureDeepLinkRelative} -->
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
          currentPath: (includeEnv: IncludeEnv) => includeEnv.filePath as string,
          deep: true,
        });
        const rendered = mdWithOptions.render(source, env);

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureDeepLinkPath, mdFixtureLinkPath]);
      });

      it("should resolve the correct relative path of link/image after the include md file", () => {
        const source = `\
<!-- @include: ${mdFixturePathLinkRelative} -->
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

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureLinkPath]);
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

        expect(rendered).toStrictEqual(expected);
        expect(env.includedFiles).toStrictEqual([mdFixtureFrontmatterPath]);
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
    }).toThrow('[@mdit/plugin-include]: "currentPath" is required');

    expect(() => {
      MarkdownIt({ html: true }).use(include);
    }).toThrow('[@mdit/plugin-include]: "currentPath" is required');
  });

  it("should work with absolute path if currentPath is not return", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: () => null,
    });

    const source = `\
<!-- @include: ${mdFixtureSimplePath} -->
`;

    const expected = `\
<h1>ABC</h1>
<p>DEF</p>
`;

    const env: IncludeEnv = {};
    const rendered = md.render(source, env);

    expect(rendered).toStrictEqual(expected);
    expect(env.includedFiles).toStrictEqual([mdFixtureSimplePath]);
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

    expect(rendered).toStrictEqual(expected);
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should handle include-env-start edge cases", () => {
    const md = MarkdownIt().use(include, {
      currentPath: () => "/path/to/current.md",
    });

    // this matches startsWith but not the regex
    expect(md.render("<!-- #include-env-start: foo")).toBe(
      "<p>&lt;!-- #include-env-start: foo</p>\n",
    );
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

  it("should deep include with relative path and no cwd", () => {
    const md = MarkdownIt().use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
      deep: true,
    });
    const env: IncludeEnv = { filePath: null };
    const source = "<!-- @include: ./non-existent.md -->";
    const rendered = md.render(source, env);

    expect(rendered).toContain("Error when resolving path");
  });

  it("should support includePushRule in silent mode", () => {
    const md = MarkdownIt().use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const state = new md.block.State("<!-- #include-env-start: /foo -->", md, {}, []);
    const result = md.block.ruler.getRules("")[0](state, 0, 1, true);

    expect(result).toBe(true);
  });

  it("should resolveRelatedLink correctly with different paths", () => {
    const md = MarkdownIt().use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const env: IncludeEnv = {
      filePath: "/a/main.md",
      includedPaths: ["/a/subdir"],
    };

    const rendered = md.render("![img2](./img2.png)", env);

    expect(rendered).toContain('src="./subdir/img2.png"');

    const env2: IncludeEnv = {
      filePath: "/a/b/main.md",
      includedPaths: ["/a"],
    };
    const rendered2 = md.render("![img](./img.png)", env2);

    expect(rendered2).toContain('src="../img.png"');
  });

  it("should handle include_end failed", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const md = MarkdownIt().use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const state = new md.core.State("", md, {});
    const token = new state.Token("include_end", "", 0);
    const tokens = [token];

    md.renderer.render(tokens, md.options, {});

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("include_end failed"));
    consoleSpy.mockRestore();
  });

  it("should handle falsy path in renderer", () => {
    const md = MarkdownIt().use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const env: IncludeEnv = {
      filePath: null,
      includedPaths: ["/foo/bar.md"],
    };

    const rendered = md.render("![img](./img.png) [link](./link.md)", env);

    expect(rendered).toContain('src="./img.png"');
    expect(rendered).toContain('href="./link.md"');
  });
});

describe("should not expand directives inside code blocks", () => {
  it("should preserve directives inside fenced code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "```md\n<!-- @include: /path/to/foo.md -->\n```\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toBe(
      '<pre><code class="language-md">&lt;!-- @include: /path/to/foo.md --&gt;\n</code></pre>\n',
    );
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should preserve directives inside tilde fenced code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "~~~\n<!-- @include: /path/to/foo.md -->\n~~~\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toBe("<pre><code>&lt;!-- @include: /path/to/foo.md --&gt;\n</code></pre>\n");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should preserve directives inside indented code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "    <!-- @include: /path/to/foo.md -->\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toBe("<pre><code>&lt;!-- @include: /path/to/foo.md --&gt;\n</code></pre>\n");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should preserve directives after an unclosed fence", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source =
      "```\n<!-- @include: /path/to/foo.md -->\n\n<!-- @include: /path/to/bar.md -->\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(rendered).toContain("@include: /path/to/bar.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should preserve directives inside fenced code block with useComment false", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
      useComment: false,
    });

    const source = "```md\n@include: /path/to/foo.md\n```\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toBe(
      '<pre><code class="language-md">@include: /path/to/foo.md\n</code></pre>\n',
    );
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should preserve directives inside deeply indented list code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "- item\n\n        <!-- @include: /path/to/foo.md -->\n\n- next\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should preserve directives with blockquote prefix", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "> quote\n>\n>     <!-- @include: /path/to/foo.md -->\n>\n> more\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should not run code detection when no directive exists", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "```md\nsome code\n```\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toBe('<pre><code class="language-md">some code\n</code></pre>\n');
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should not expand directives inside code block of deep included file", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-codeblock-"));
    writeFileSync(join(dir, "a.md"), "```md\n<!-- @include: b.md -->\n```\n");

    try {
      const mdWithOptions = MarkdownIt({ html: true })
        .use(include, {
          currentPath: (env: IncludeEnv) => env.filePath as string,
          deep: true,
        })
        .use(container, { name: "tip" });
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      const rendered = mdWithOptions.render("<!-- @include: a.md -->", env);

      expect(rendered).toContain("@include: b.md");
      expect(env.includedFiles).toStrictEqual([join(dir, "a.md")]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should preserve directives inside a multi-line indented code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "    line one\n    <!-- @include: /path/to/foo.md -->\n    line three\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(rendered).not.toContain("File not found");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should expand directives between two code blocks only", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = [
      "```",
      "<!-- @include: /path/to/a.md -->",
      "```",
      "",
      "<!-- @include: /path/to/b.md -->",
      "",
      "```",
      "<!-- @include: /path/to/c.md -->",
      "```",
    ].join("\n");
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/a.md");
    expect(rendered).toContain("@include: /path/to/c.md");
    expect(rendered).toContain("File not found");
    expect(env.includedFiles).toStrictEqual(["/path/to/b.md"]);
  });

  it("should treat a fence with backtick in info as non-fence", () => {
    // ```a`b 不是合法围栏（语言标识含反引号）→ 指令照常展开
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "```a`b\n<!-- @include: /path/to/foo.md -->\n```\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("File not found");
    expect(env.includedFiles).toStrictEqual(["/path/to/foo.md"]);
  });

  it("should keep looking for a closing fence after an over-indented fence line", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // 4 空格缩进的 ``` 不闭合；随后的 ``` 才是闭合 → 指令保留在围栏内
    const source = "```\n<!-- @include: /path/to/foo.md -->\n    ```\n```\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should keep looking for a longer closing fence", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // 开围栏 4 反引号；3 反引号行不闭合；4 反引号行闭合 → 指令保留
    const source = "````\n<!-- @include: /path/to/foo.md -->\n```\n````\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should keep looking for a closing fence with trailing content", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // "``` extra" 尾随非空白不闭合；随后的 ``` 闭合 → 指令保留
    const source = "```\n<!-- @include: /path/to/foo.md -->\n``` extra\n```\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should end an indented code block at a non-indented line", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // 行 0 缩进代码块（指令保留）；行 1 非缩进结束代码块
    const source = "    <!-- @include: /path/to/foo.md -->\nplain\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should treat an indented line after a blank line as code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // 行 2 前有空行 → 缩进代码块（指令保留）
    const source = "text\n\n    <!-- @include: /path/to/foo.md -->\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should expand a 4-space indented directive following a paragraph line", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // 行 1 紧接段落（无空行）→ 是段落懒续行而非代码块 → 指令展开
    const source = "text\n    <!-- @include: /path/to/foo.md -->\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("File not found");
    expect(env.includedFiles).toStrictEqual(["/path/to/foo.md"]);
  });

  it("should handle trailing empty lines after a code block", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    const source = "```\n<!-- @include: /path/to/foo.md -->\n```\n\n\n";
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("@include: /path/to/foo.md");
    expect(env.includedFiles).toStrictEqual([]);
  });

  it("should keep line numbers accurate after a multi-line directive", () => {
    const md = MarkdownIt({ html: true }).use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });

    // 多行指令（`<!--\n  @include: ... -->`）内部含换行，不应使后续行号欠计数
    const source = [
      "<!--",
      "  @include: /path/to/foo.md",
      "-->",
      "",
      "```",
      "<!-- @include: /path/to/bar.md -->",
      "```",
    ].join("\n");
    const env: IncludeEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain("File not found");
    expect(rendered).toContain("@include: /path/to/bar.md");
    expect(env.includedFiles).toStrictEqual(["/path/to/foo.md"]);
  });

  it("should support calling resolveInclude directly", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-direct-"));
    writeFileSync(join(dir, "a.md"), "# A\n");

    try {
      const md = MarkdownIt({ html: true });
      const options = {
        currentPath: (): string => join(dir, "index.md"),
        resolvePath: (filePath: string): string => filePath,
        deep: true,
        resolveLinkPath: true,
        resolveImagePath: true,
        useComment: true,
      } as Required<MarkdownItIncludeOptions>;
      const includedFiles: string[] = [];
      const result = resolveInclude(
        "<!-- @include: a.md -->",
        options,
        { cwd: dir, includedFiles },
        [],
        md,
      );

      expect(result).toContain("# A");
      expect(includedFiles).toStrictEqual([join(dir, "a.md")]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
