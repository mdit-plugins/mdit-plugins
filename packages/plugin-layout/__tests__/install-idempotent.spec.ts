import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const getRuleNames = (ruler: unknown): string[] =>
  (ruler as { __rules__: { name: string }[] }).__rules__.map(({ name }) => name);

const source = `\
@flexs
@flex
Content
@end
`;

describe(layout, () => {
  it("should not register the block rules twice", () => {
    const single = new MarkdownIt().use(layout);
    const double = new MarkdownIt().use(layout).use(layout);
    const blockRules = getRuleNames(double.block.ruler);
    const result = double.render(source);

    expect(blockRules.filter((name) => name === "layout_container")).toHaveLength(1);
    expect(blockRules.filter((name) => name === "layout_item")).toHaveLength(1);
    expect(result).toBe(single.render(source));
    expect(result).toContain('<div style="display:flex">');
  });
});
