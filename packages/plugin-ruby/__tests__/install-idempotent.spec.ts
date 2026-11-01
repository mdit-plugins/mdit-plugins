import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { ruby } from "../src/index.js";

const inlineRuleNames = (md: MarkdownItType): string[] => {
  const rules = (md.inline.ruler as unknown as { __rules__: { name: string }[] }).__rules__;

  return rules.map(({ name }) => name);
};

const markdown = "Ruby {base:ruby text} inline.\n";

describe(ruby, () => {
  it("should not register the inline rule twice", () => {
    const single = new MarkdownIt().use(ruby);
    const double = new MarkdownIt().use(ruby).use(ruby);

    expect(inlineRuleNames(single).filter((name) => name === "ruby")).toHaveLength(1);
    expect(inlineRuleNames(double).filter((name) => name === "ruby")).toHaveLength(1);
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt().use(ruby);
    const double = new MarkdownIt().use(ruby).use(ruby);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain("<ruby>base<rt>ruby text</rt></ruby>");
  });
});
