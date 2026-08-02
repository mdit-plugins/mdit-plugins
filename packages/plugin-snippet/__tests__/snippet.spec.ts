import MarkdownIt from "markdown-it";
import { join, resolve } from "upath";
import { describe, expect, it, vi } from "vitest";

import type { SnippetEnv } from "../src/index.js";
import { snippet } from "../src/index.js";

// Simulate an unreadable file (EACCES) for a specific marker path, delegating
// all other fs calls to the real implementation so existing tests are unaffected.
// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("node:fs", async (importOriginal) => {
  // oxlint-disable-next-line typescript/consistent-type-imports
  const actual = await importOriginal<typeof import("node:fs")>();
  const blockedPath = "/__eacces__/blocked.md";
  const blockedDirPath = "/__eacces__/blocked-dir";

  return {
    ...actual,
    // oxlint-disable-next-line typescript/explicit-function-return-type
    lstatSync: (...args: Parameters<typeof actual.lstatSync>) => {
      // oxlint-disable-next-line eslint/prefer-destructuring
      const path = args[0];

      if (String(path) === blockedDirPath) {
        const error = new Error(
          `EACCES: permission denied, scandir '${String(path)}'`,
        ) as NodeJS.ErrnoException;

        error.code = "EACCES";
        throw error;
      }

      // oxlint-disable-next-line eslint/curly
      if (String(path) === blockedPath) {
        return { isFile: (): boolean => true } as ReturnType<typeof actual.lstatSync>;
      }

      return actual.lstatSync(...args);
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

describe(snippet, () => {
  const md = MarkdownIt({ html: true }).use(snippet, {
    currentPath: (env: SnippetEnv) => env.filePath as string,
  });

  const fixturesRelative = "./__fixtures__/";
  const fixturesPath = resolve(__dirname, fixturesRelative);

  it("should not be parsed as snippet markdown syntax", () => {
    const source = [">>>", "><> test", "<>< test", "<< test"];

    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toMatchSnapshot();
    expect(rendered).not.toContain("pre");
    expect(env.snippetFiles).toBeUndefined();
  });

  it("should not parse code block", () => {
    const source = [
      "    <<< not-exisit.md#snippet{1-3}",
      "    <<< not-exisit.md",
      "    <<< not-exisit.md#snippet",
      "    <<< not-exisit.md{1-3}",
      "```\n<<< not-exisit.md#snippet{1-3}\n```",
      "```\n<<< not-exisit.md\n```",
      "```\n<<< not-exisit.md#snippet\n```",
      "```\n<<< not-exisit.md{1-3}\n```",
    ];

    source.forEach((item) => {
      const env: SnippetEnv = {
        filePath: __filename,
      };
      const rendered = md.render(item, env);

      expect(rendered).toContain("not-exisit.md");
      expect(rendered).toMatchSnapshot();
      expect(env.snippetFiles?.length).toBeUndefined();
    });
  });

  it("should import all lines", () => {
    const source = [
      "<<< ./__fixtures__/example",
      "<<< ./__fixtures__/example.html",
      "<<< ./__fixtures__/example.md",
      "<<< ./__fixtures__/example.js",
      "<<< ./__fixtures__/example.ts",
      "<<< ./__fixtures__/example.d.ts",
      "<<< ./__fixtures__/example.css",
      "<<< ./__fixtures__/example.scss",
      "<<< ./__fixtures__/example.less",
      "<<< ./__fixtures__/example.cs",
      "<<< ./__fixtures__/example.java",
      "<<< ./__fixtures__/example.py",
      "<<< ./__fixtures__/example.vb",
    ];

    source.forEach((item) => {
      const env: SnippetEnv = {
        filePath: __filename,
      };
      const rendered = md.render(item, env);

      expect(rendered).toMatchSnapshot();
      expect(env.snippetFiles?.length).toBe(1);
      expect(env.snippetFiles?.[0]).toContain(join(fixturesPath, "example"));
    });
  });

  it("should support region", () => {
    const source = [
      "<<< ./__fixtures__/example#snippet",
      "<<< ./__fixtures__/example.html#snippet",
      "<<< ./__fixtures__/example.md#snippet",
      "<<< ./__fixtures__/example.js#snippet",
      "<<< ./__fixtures__/example.ts#snippet",
      "<<< ./__fixtures__/example.d.ts#snippet",
      "<<< ./__fixtures__/example.css#snippet",
      "<<< ./__fixtures__/example.scss#snippet",
      "<<< ./__fixtures__/example.less#snippet",
      "<<< ./__fixtures__/example.cs#snippet",
      "<<< ./__fixtures__/example.java#snippet",
      "<<< ./__fixtures__/example.py#snippet",
      "<<< ./__fixtures__/example.vb#snippet",
    ];

    source.forEach((item) => {
      const env: SnippetEnv = {
        filePath: __filename,
      };
      const rendered = md.render(item, env);

      expect(rendered).toMatchSnapshot();
      expect(env.snippetFiles?.length).toBe(1);
      expect(env.snippetFiles?.[0]).toContain(join(fixturesPath, "example"));
    });
  });

  it("should give warnings with not exist path", () => {
    const mdError = MarkdownIt({ html: true }).use(snippet, {
      currentPath: () => "/fake/md",
    });
    const source = [
      "<<< not-exisit.md#snippet{1-3}",
      "<<< not-exisit.md",
      "<<< not-exisit.md#snippet",
      "<<< not-exisit.md{1-3}",
    ];

    source.forEach((item) => {
      const rendered = mdError.render(item);

      expect(rendered).toContain("Unable to find snippet");
      expect(rendered).toMatchSnapshot();
    });
  });

  it("should not throw when the snippet file is not readable", () => {
    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render("<<< /__eacces__/blocked.md", env);

    expect(rendered).toContain("Unable to find snippet");
    expect(env.snippetFiles).toBeUndefined();
  });

  it("should not throw when the snippet directory is not accessible", () => {
    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render("<<< /__eacces__/blocked-dir", env);

    expect(rendered).toContain("Unable to find snippet");
    expect(env.snippetFiles).toBeUndefined();
  });

  it("should throw if currentPath is not a function", () => {
    expect(() => {
      MarkdownIt({ html: true }).use(snippet, {
        currentPath: "not a function",
      });
    }).toThrow('[@mdit/plugin-snippet]: "currentPath" is required');

    expect(() => {
      MarkdownIt({ html: true }).use(snippet);
    }).toThrow('[@mdit/plugin-snippet]: "currentPath" is required');
  });

  it("should support region and lines", () => {
    const source = [
      "<<< ./__fixtures__/example.js#snippet{1-2}",
      "<<< ./__fixtures__/example.js#snippet{1-2 js}",
      "<<< ./__fixtures__/example.js#snippet{js}",
    ];

    source.forEach((item) => {
      const env: SnippetEnv = {
        filePath: __filename,
      };
      const rendered = md.render(item, env);

      expect(rendered).toMatchSnapshot();
      expect(env.snippetFiles?.[0]).toContain(join(fixturesPath, "example.js"));
    });
  });

  it("should work with non-existent region", () => {
    const source = "<<< ./__fixtures__/example.js#non-existent";
    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source, env);

    expect(rendered).toMatchSnapshot();
  });

  it("should work with unclosed region", () => {
    const source = "<<< ./__fixtures__/unclosed.js#unclosed";
    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source, env);

    expect(rendered).toMatchSnapshot();
  });

  it("should work with invalid meta", () => {
    const source = "<<< ./__fixtures__/example.js#snippet junk {!!}";
    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source, env);

    expect(rendered).toMatchSnapshot();
  });

  it("should work without env.filePath", () => {
    const mdNoEnv = MarkdownIt({ html: true }).use(snippet, {
      currentPath: () => __filename,
    });
    const source = "<<< ./__fixtures__/example.js";
    const env: SnippetEnv = {};
    const rendered = mdNoEnv.render(source, env);

    expect(rendered).toContain('<pre><code class="language-js">');
    expect(rendered).toContain('require("@mdit/plugin-snippet")'.replaceAll('"', "&quot;"));
    expect(rendered).toMatchSnapshot();
  });

  it("should work with empty currentPath", () => {
    const mdNoPath = MarkdownIt({ html: true }).use(snippet, {
      currentPath: () => "",
    });
    const absolutePath = resolve(__dirname, "./__fixtures__/example.js");
    const source = `<<< ${absolutePath}`;
    const env: SnippetEnv = {};
    const rendered = mdNoPath.render(source, env);

    expect(rendered).toContain('<pre><code class="language-js">');
    expect(rendered).toContain('require("@mdit/plugin-snippet")'.replaceAll('"', "&quot;"));
    expect(env.snippetFiles?.length).toBe(1);
    expect(rendered).toMatchSnapshot();
  });

  it("should handle invalid meta", () => {
    const source = "<<< ./__fixtures__/example.js#snippet{1-2} extra";
    const env: SnippetEnv = { filePath: __filename };
    const rendered = md.render(source, env);

    expect(rendered).toContain('<pre><code class="language-js">');
    expect(rendered).toContain('require("@mdit/plugin-snippet")'.replaceAll('"', "&quot;"));
    expect(rendered).toContain("// #region snippet");
    expect(rendered).toMatchSnapshot();
  });
});
