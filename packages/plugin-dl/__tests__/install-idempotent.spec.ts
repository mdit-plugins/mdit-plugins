import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { dl } from "../src/index.js";

const content = `\
Term

: Definition
`;

const countBlockRule = (md: MarkdownItType, name: string): number =>
  md.block.ruler.__rules__.filter((rule) => rule.name === name).length;

describe(dl, () => {
  it("should not register the rule twice when installed twice", () => {
    const single = new MarkdownIt().use(dl);
    const double = new MarkdownIt().use(dl).use(dl);

    expect(countBlockRule(double, "dl")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });
});
