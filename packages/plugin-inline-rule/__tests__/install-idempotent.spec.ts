import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

const getRuleNames = (ruler: unknown): string[] =>
  (ruler as { __rules__: { name: string }[] }).__rules__.map(({ name }) => name);

const supOptions = { marker: "^", tag: "sup", token: "sup" };
const subOptions = { marker: "~", tag: "sub", token: "sub" };

const source = "x^2^ y~2~";

describe(inlineRule, () => {
  it("should skip a repeated configuration but keep a different one", () => {
    const single = new MarkdownIt().use(inlineRule, supOptions).use(inlineRule, subOptions);
    const double = new MarkdownIt()
      .use(inlineRule, supOptions)
      .use(inlineRule, supOptions)
      .use(inlineRule, subOptions);
    const inlineRules = getRuleNames(double.inline.ruler);
    const result = double.render(source);

    expect(inlineRules.filter((name) => name === "sup_^")).toHaveLength(1);
    expect(inlineRules.filter((name) => name === "sub_~")).toHaveLength(1);
    expect(result).toBe(single.render(source));
    expect(result).toContain("<sup>2</sup>");
    expect(result).toContain("<sub>2</sub>");
  });

  it("should guard nested rules registered on both inline rulers", () => {
    const nestedOptions = { marker: "+", tag: "ins", token: "ins", nested: true } as const;
    const single = new MarkdownIt().use(inlineRule, nestedOptions);
    const double = new MarkdownIt().use(inlineRule, nestedOptions).use(inlineRule, nestedOptions);
    const nestedSource = "++text++";

    expect(getRuleNames(double.inline.ruler).filter((name) => name === "ins_+")).toHaveLength(1);
    expect(
      (double.inline.ruler2.__rules__ as { name: string }[]).filter(({ name }) => name === "ins_+"),
    ).toHaveLength(1);
    expect(double.render(nestedSource)).toBe(single.render(nestedSource));
    expect(double.render(nestedSource)).toContain("<ins>text</ins>");
  });
});
