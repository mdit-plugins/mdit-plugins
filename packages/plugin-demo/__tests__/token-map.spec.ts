import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { demo } from "../src/index.js";

const findCodeToken = (md: MarkdownItInstance, source: string): Token | undefined => {
  const tokens = md.parse(source, {});

  return tokens.find((token) => token.type === "fence" && token.info === "md");
};

const testCases = [
  {
    title: "should set the map of a demo starting at the first line",
    source: "::: demo\n# title\ncontent\n:::",
    expected: [1, 3],
  },
  {
    title: "should set the map of a demo starting after other blocks",
    source: "intro\n\n::: demo\n# title\ncontent\n:::",
    expected: [3, 5],
  },
];

describe.each([false, true])("demo code token map (showCodeFirst: %s)", (showCodeFirst) => {
  it.each(testCases)("$title", ({ source, expected }) => {
    const md = new MarkdownIt().use(demo, { showCodeFirst });
    const codeToken = findCodeToken(md, source);

    expect(codeToken).toBeDefined();
    expect(codeToken?.map).toStrictEqual(expected);
  });
});
