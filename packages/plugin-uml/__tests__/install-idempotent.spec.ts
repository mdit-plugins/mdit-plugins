import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { uml } from "../src/index.js";

const blockRuleNames = (md: MarkdownItType): string[] => {
  const rules = (md.block.ruler as unknown as { __rules__: { name: string }[] }).__rules__;

  return rules.map(({ name }) => name);
};

const markdown = `\
@start
a -> b
@end
`;

describe(uml, () => {
  it("should not register the block rule twice", () => {
    const single = new MarkdownIt().use(uml);
    const double = new MarkdownIt().use(uml).use(uml);

    expect(blockRuleNames(single).filter((name) => name === "uml")).toHaveLength(1);
    expect(blockRuleNames(double).filter((name) => name === "uml")).toHaveLength(1);
  });

  it("should use the configured rule name", () => {
    const options = {
      name: "sequence",
      open: "start",
      close: "end",
      renderer: (tokens: Token[], index: number): string => tokens[index].content,
    };
    const single = new MarkdownIt().use(uml, options);
    const double = new MarkdownIt().use(uml, options).use(uml, options);

    expect(blockRuleNames(single).filter((name) => name === "sequence")).toHaveLength(1);
    expect(blockRuleNames(double).filter((name) => name === "sequence")).toHaveLength(1);
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt().use(uml);
    const double = new MarkdownIt().use(uml).use(uml);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('<div class="uml" title="">a -&gt; b');
  });
});
