import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { figure } from "../src/index.js";

const getRuleNames = (ruler: unknown): string[] =>
  (ruler as { __rules__: { name: string }[] }).__rules__.map(({ name }) => name);

const source = '![image](/logo.svg "A image")';

describe(figure, () => {
  it("should not register the core rule twice", () => {
    const single = new MarkdownIt().use(figure);
    const double = new MarkdownIt().use(figure).use(figure);
    const result = double.render(source);

    expect(getRuleNames(double.core.ruler).filter((name) => name === "figure")).toHaveLength(1);
    expect(result).toBe(single.render(source));
    expect(result).toContain("<figure>");
  });
});
