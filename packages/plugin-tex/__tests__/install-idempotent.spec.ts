import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode
    ? `<div class="math">${content.trim()}</div>`
    : `<span class="math">${content.trim()}</span>`;

const ruleNames = (md: MarkdownItType, scope: "block" | "inline"): string[] => {
  const rules = (md[scope].ruler as unknown as { __rules__: { name: string }[] }).__rules__;

  return rules.map(({ name }) => name);
};

const markdown = String.raw`Inline $a=1$ and \(b=2\).

$$
c=3
$$

\[
d=4
\]
`;

describe(tex, () => {
  it("should not register the rules twice", () => {
    const options = { delimiters: "all" as const, render };
    const single = new MarkdownIt().use(tex, options);
    const double = new MarkdownIt().use(tex, options).use(tex, options);

    for (const ruleName of ["math_inline_dollar", "math_inline_bracket"]) {
      expect(ruleNames(single, "inline").filter((name) => name === ruleName)).toHaveLength(1);
      expect(ruleNames(double, "inline").filter((name) => name === ruleName)).toHaveLength(1);
    }

    for (const ruleName of ["math_block_dollar", "math_block_bracket"]) {
      expect(ruleNames(single, "block").filter((name) => name === ruleName)).toHaveLength(1);
      expect(ruleNames(double, "block").filter((name) => name === ruleName)).toHaveLength(1);
    }
  });

  it("should not change the registered rules for any delimiter option", () => {
    for (const delimiters of ["dollars", "brackets", "all"] as const) {
      const options = { delimiters, render };
      const single = new MarkdownIt().use(tex, options);
      const double = new MarkdownIt().use(tex, options).use(tex, options);

      expect(ruleNames(double, "inline")).toStrictEqual(ruleNames(single, "inline"));
      expect(ruleNames(double, "block")).toStrictEqual(ruleNames(single, "block"));
    }
  });

  it("should render the same output when used twice", () => {
    const options = { delimiters: "all" as const, render };
    const single = new MarkdownIt().use(tex, options);
    const double = new MarkdownIt().use(tex, options).use(tex, options);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('<span class="math">a=1</span>');
    expect(double.render(markdown)).toContain('<div class="math">c=3</div>');
  });
});
