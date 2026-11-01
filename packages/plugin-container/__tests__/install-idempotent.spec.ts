import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { container } from "../src/index.js";

const options = { name: "test" };
const content = `\
::: test
content
:::
`;

const countBlockRule = (md: MarkdownItType, name: string): number =>
  md.block.ruler.__rules__.filter((rule) => rule.name === name).length;

describe(container, () => {
  it("should not register the rule twice when installed twice", () => {
    const single = new MarkdownIt().use(container, options);
    const double = new MarkdownIt().use(container, options).use(container, options);

    expect(countBlockRule(double, "container_test")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });

  it("should keep the first installation's parse options", () => {
    const markdownIt = new MarkdownIt()
      .use(container, { name: "test", marker: "!" })
      .use(container, { name: "test", marker: ":" });
    const first = new MarkdownIt().use(container, { name: "test", marker: "!" });

    expect(markdownIt.render(content)).toBe(first.render(content));
    expect(markdownIt.render(content)).not.toContain('<div class="test">');
  });
});
