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

const inlineSource = `\
@flexs gap-4
@flex flex-1
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

  it("should keep the first installation's inlineStyles option", () => {
    const single = new MarkdownIt().use(layout, { inlineStyles: true });
    const double = new MarkdownIt()
      .use(layout, { inlineStyles: true })
      .use(layout, { inlineStyles: false });
    const result = double.render(inlineSource);

    expect(result).toBe(single.render(inlineSource));
    expect(result).toContain('<div style="display:flex;gap:1rem">');
    expect(result).toContain('<div style="flex:1 1 0%">');
    expect(result).not.toContain('class="gap-4"');
    expect(result).not.toContain('class="flex-1"');
  });
});
