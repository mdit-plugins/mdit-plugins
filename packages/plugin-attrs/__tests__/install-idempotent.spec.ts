import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../src/index.js";

const content = `\
# heading {#hero .title}

![image](/logo.svg){.center}
`;

const countCoreRule = (md: MarkdownItType, name: string): number =>
  md.core.ruler.__rules__.filter((rule) => rule.name === name).length;

describe(attrs, () => {
  it("should not register the rule twice when installed twice", () => {
    const single = new MarkdownIt().use(attrs);
    const double = new MarkdownIt().use(attrs).use(attrs);

    expect(countCoreRule(double, "attrs")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });

  it("should keep the first installation's parse options", () => {
    const markdownIt = new MarkdownIt().use(attrs, { rule: false }).use(attrs);
    const first = new MarkdownIt().use(attrs, { rule: false });

    expect(markdownIt.render(content)).toBe(first.render(content));
    expect(markdownIt.render(content)).not.toContain('class="title"');
  });
});
