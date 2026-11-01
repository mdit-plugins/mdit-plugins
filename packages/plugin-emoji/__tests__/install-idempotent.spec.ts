import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { bareEmoji, fullEmoji } from "../src/index.js";

const getRuleNames = (ruler: unknown): string[] =>
  (ruler as { __rules__: { name: string }[] }).__rules__.map(({ name }) => name);

const source = ":smile: :joy:";

describe(fullEmoji, () => {
  it("should not register the core rule twice", () => {
    const single = new MarkdownIt().use(fullEmoji);
    const double = new MarkdownIt().use(fullEmoji).use(fullEmoji);
    const result = double.render(source);

    expect(getRuleNames(double.core.ruler).filter((name) => name === "emoji")).toHaveLength(1);
    expect(result).toBe(single.render(source));
    expect(result).toContain("😄");
  });

  it("should keep the first installation's definitions when variants are mixed", () => {
    const markdownIt = new MarkdownIt()
      .use(bareEmoji, { definitions: { custom: "😄" } })
      .use(fullEmoji);

    expect(getRuleNames(markdownIt.core.ruler).filter((name) => name === "emoji")).toHaveLength(1);
    expect(markdownIt.render(":custom:")).toContain("😄");
    expect(markdownIt.render(":smile:")).toBe("<p>:smile:</p>\n");
  });
});
