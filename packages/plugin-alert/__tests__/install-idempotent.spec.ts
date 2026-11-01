import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../src/index.js";

const options = { alertNames: ["tip"] };
const content = `\
> [!tip]
> content
`;

const countBlockRule = (md: MarkdownItType, name: string): number =>
  md.block.ruler.__rules__.filter((rule) => rule.name === name).length;

describe(alert, () => {
  it("should not register the rule twice when installed twice", () => {
    const single = new MarkdownIt().use(alert, options);
    const double = new MarkdownIt().use(alert, options).use(alert, options);

    expect(countBlockRule(double, "alert")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });

  it("should keep the first installation's parse options", () => {
    const markdownIt = new MarkdownIt()
      .use(alert, { alertNames: ["tip"] })
      .use(alert, { alertNames: ["note"] });
    const first = new MarkdownIt().use(alert, { alertNames: ["tip"] });
    const noteContent = "> [!note]\n> content\n";

    expect(markdownIt.render(noteContent)).toBe(first.render(noteContent));
    expect(markdownIt.render(noteContent)).not.toContain("markdown-alert");
  });
});
