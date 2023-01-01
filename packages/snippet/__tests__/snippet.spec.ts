import { describe, it, expect } from "vitest";
import path from "upath";
import MarkdownIt from "markdown-it";
import { snippet } from "../src/index.js";
import type { SnippetEnv } from "../src/index.js";

const md = MarkdownIt({ html: true }).use(snippet, {
  currentPath: (env: SnippetEnv) => env["filePath"] as string,
});

const fixturesRelative = "./__fixtures__/";
const fixturesPath = path.resolve(__dirname, fixturesRelative);

describe("snippet", () => {
  it("should not be parsed as snippet markdown syntax", () => {
    const source = [">>>", "><> test", "<>< test", "<< test"];

    const env: SnippetEnv = {
      filePath: __filename,
    };
    const rendered = md.render(source.join("\n\n"), env);

    expect(rendered).toMatchSnapshot();
    expect(rendered).not.toContain("pre");
    expect(env.snippetFiles).toEqual(undefined);
  });

  it("should import all lines", () => {
    const source = [
      "<<< ./__fixtures__/example.html",
      "<<< ./__fixtures__/example.md",
      "<<< ./__fixtures__/example.js",
      "<<< ./__fixtures__/example.ts",
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
      expect(env.snippetFiles?.[0]).toContain(
        path.join(fixturesPath, "example.")
      );
    });
  });

  it("should support region", () => {
    const source = [
      "<<< ./__fixtures__/example.html#snippet",
      "<<< ./__fixtures__/example.md#snippet",
      "<<< ./__fixtures__/example.js#snippet",
      "<<< ./__fixtures__/example.ts#snippet",
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
      expect(env.snippetFiles?.[0]).toContain(
        path.join(fixturesPath, "example.")
      );
    });
  });
});
