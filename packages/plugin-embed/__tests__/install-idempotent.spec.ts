import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { embed } from "../src/index.js";

const options = {
  config: [
    { name: "video", setup: (id: string): string => `<video src="${id}"></video>` },
    {
      name: "icon",
      allowInline: true,
      setup: (name: string): string => `<i class="icon-${name}"></i>`,
    },
  ],
};
const content = `\
{% video abc %}

text {% icon star %} more
`;

const countBlockRule = (md: MarkdownItType, name: string): number =>
  md.block.ruler.__rules__.filter((rule) => rule.name === name).length;

const countInlineRule = (md: MarkdownItType, name: string): number =>
  md.inline.ruler.__rules__.filter((rule) => rule.name === name).length;

describe(embed, () => {
  it("should not register the rules twice when installed twice", () => {
    const single = new MarkdownIt().use(embed, options);
    const double = new MarkdownIt().use(embed, options).use(embed, options);

    expect(countBlockRule(double, "embed_block")).toBe(1);
    expect(countInlineRule(double, "embed_inline")).toBe(1);
    expect(double.render(content)).toBe(single.render(content));
  });

  it("should restore removed renderers without registering the rules again", () => {
    const markdownIt = new MarkdownIt().use(embed, options);

    delete markdownIt.renderer.rules.embed_block;
    delete markdownIt.renderer.rules.embed_inline;
    markdownIt.use(embed, options);

    expect(countBlockRule(markdownIt, "embed_block")).toBe(1);
    expect(countInlineRule(markdownIt, "embed_inline")).toBe(1);
    expect(markdownIt.render(content)).toBe(new MarkdownIt().use(embed, options).render(content));
  });
});
