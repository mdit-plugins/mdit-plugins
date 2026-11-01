import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { icon } from "../src/index.js";

const getRuleNames = (ruler: unknown): string[] =>
  (ruler as { __rules__: { name: string }[] }).__rules__.map(({ name }) => name);

const source = "::icon-name::";

describe(icon, () => {
  it("should not register the inline rule twice", () => {
    const single = new MarkdownIt().use(icon);
    const double = new MarkdownIt().use(icon).use(icon);
    const result = double.render(source);

    expect(getRuleNames(double.inline.ruler).filter((name) => name === "icon")).toHaveLength(1);
    expect(result).toBe(single.render(source));
    expect(result).toContain('<i class="icon-name"></i>');
  });
});
