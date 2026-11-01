import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { demo } from "../src/index.js";

const content = `\
::: demo Title
content
:::
`;

const countBlockRule = (md: MarkdownItType, name: string): number =>
  md.block.ruler.__rules__.filter((rule) => rule.name === name).length;

describe(demo, () => {
  it("should not register the rule twice when installed twice", () => {
    const single = new MarkdownIt().use(demo);
    const double = new MarkdownIt().use(demo).use(demo);

    expect(countBlockRule(double, "demo")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });

  it("should keep the first installation's parse options", () => {
    const markdownIt = new MarkdownIt().use(demo, { name: "aaa" }).use(demo, { name: "bbb" });
    const first = new MarkdownIt().use(demo, { name: "aaa" });
    const firstContent = "::: aaa\ncontent\n:::";
    const secondContent = "::: bbb\ncontent\n:::";

    expect(markdownIt.render(firstContent)).toBe(first.render(firstContent));
    expect(markdownIt.render(secondContent)).toBe(first.render(secondContent));
  });
});
