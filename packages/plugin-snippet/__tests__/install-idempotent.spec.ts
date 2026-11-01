import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { resolve } from "upath";
import { describe, expect, it } from "vitest";

import type { SnippetEnv } from "../src/index.js";
import { snippet } from "../src/index.js";

const blockRuleNames = (md: MarkdownItType): string[] => {
  const rules = (md.block.ruler as unknown as { __rules__: { name: string }[] }).__rules__;

  return rules.map(({ name }) => name);
};

const options = {
  currentPath: (env: SnippetEnv): string => env.filePath as string,
  projectRoot: resolve(__dirname, ".."),
};

const markdown = "<<< ./__fixtures__/example.ts\n";

const render = (md: MarkdownItType): string => md.render(markdown, { filePath: __filename });

describe(snippet, () => {
  it("should not register the block rule twice", () => {
    const single = new MarkdownIt({ html: true }).use(snippet, options);
    const double = new MarkdownIt({ html: true }).use(snippet, options).use(snippet, options);

    expect(blockRuleNames(single).filter((name) => name === "snippet")).toHaveLength(1);
    expect(blockRuleNames(double).filter((name) => name === "snippet")).toHaveLength(1);
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt({ html: true }).use(snippet, options);
    const double = new MarkdownIt({ html: true }).use(snippet, options).use(snippet, options);

    expect(render(double)).toBe(render(single));
    expect(render(double)).toContain("MarkdownIt");
  });

  it("should not wrap the fence renderer twice", () => {
    const double = new MarkdownIt({ html: true }).use(snippet, options).use(snippet, options);
    const env: SnippetEnv = { filePath: __filename };

    double.render(markdown, env);

    expect(env.snippetFiles).toHaveLength(1);
  });
});
