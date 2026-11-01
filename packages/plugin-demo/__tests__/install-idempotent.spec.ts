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

    expect(countBlockRule(double, "demo_demo")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });

  it("should keep the first installation's parse options for the same name", () => {
    const markdownIt = new MarkdownIt()
      .use(demo, { name: "aaa" })
      .use(demo, { name: "aaa", showCodeFirst: true });
    const first = new MarkdownIt().use(demo, { name: "aaa" });
    const demoContent = "::: aaa\ncontent\n:::";

    expect(countBlockRule(markdownIt, "demo_aaa")).toBe(1);
    expect(markdownIt.render(demoContent)).toBe(first.render(demoContent));
  });

  it("should register a rule for every configured name", () => {
    const markdownIt = new MarkdownIt().use(demo, { name: "aaa" }).use(demo, { name: "bbb" });
    const demoContent = "::: aaa\ncontent\n:::";
    const otherContent = "::: bbb\ncontent\n:::";

    expect(countBlockRule(markdownIt, "demo_aaa")).toBe(1);
    expect(countBlockRule(markdownIt, "demo_bbb")).toBe(1);
    expect(markdownIt.render(demoContent)).toBe(
      new MarkdownIt().use(demo, { name: "aaa" }).render(demoContent),
    );
    expect(markdownIt.render(otherContent)).toBe(
      new MarkdownIt().use(demo, { name: "bbb" }).render(otherContent),
    );
  });

  it("should parse multiple configured names in the same document", () => {
    const markdownIt = new MarkdownIt().use(demo).use(demo, { name: "playground" });

    const result = markdownIt.render(`\
::: demo
demo content
:::

::: playground
playground content
:::

::: demo
second demo
:::
`);

    expect(result.match(/<details>/g)).toHaveLength(3);
    expect(result).toContain("<p>demo content</p>");
    expect(result).toContain("<p>playground content</p>");
    expect(result).toContain("<p>second demo</p>");
  });
});
