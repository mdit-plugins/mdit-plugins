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
    const firstOptions = { alertNames: ["tip"], deep: true };
    const secondOptions = { alertNames: ["note"], deep: false };
    const double = new MarkdownIt().use(alert, firstOptions).use(alert, secondOptions);
    const single = new MarkdownIt().use(alert, firstOptions);
    const nestedContent = `\
- > [!tip]
  > content
`;
    const noteContent = "> [!note]\n> content\n";

    expect(double.render(nestedContent)).toBe(single.render(nestedContent));
    expect(double.render(nestedContent)).toContain("markdown-alert");
    expect(double.render(noteContent)).toBe(single.render(noteContent));
    expect(double.render(noteContent)).not.toContain("markdown-alert");
  });

  it("should keep the first installation's renderers", () => {
    const firstOptions = {
      openRenderer: (): string => '<div class="first-open">\n',
      closeRenderer: (): string => "</div>\n",
      titleRenderer: (): string => '<p class="first-title">title</p>\n',
    };
    const secondOptions = {
      openRenderer: (): string => '<div class="second-open">\n',
      closeRenderer: (): string => '<div class="second-close">\n',
      titleRenderer: (): string => '<p class="second-title">title</p>\n',
    };
    const double = new MarkdownIt().use(alert, firstOptions).use(alert, secondOptions);
    const single = new MarkdownIt().use(alert, firstOptions);
    const result = double.render(content);

    expect(result).toBe(single.render(content));
    expect(result).toContain('<div class="first-open">');
    expect(result).toContain('<p class="first-title">title</p>');
    expect(result).not.toContain("second-");
  });
});
