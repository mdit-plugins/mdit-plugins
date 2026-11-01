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

  it("should not merge the rule sets of different delimiter options", () => {
    const single = new MarkdownIt().use(tex, { delimiters: "dollars", render });
    const double = new MarkdownIt()
      .use(tex, { delimiters: "dollars", render })
      .use(tex, { delimiters: "brackets", render });
    const bracketMarkdown = String.raw`Inline \(b=2\).

\[
d=4
\]
`;

    expect(ruleNames(double, "inline")).toStrictEqual(ruleNames(single, "inline"));
    expect(ruleNames(double, "block")).toStrictEqual(ruleNames(single, "block"));
    expect(ruleNames(double, "inline")).not.toContain("math_inline_bracket");
    expect(ruleNames(double, "block")).not.toContain("math_block_bracket");
    expect(double.render(bracketMarkdown)).toBe(single.render(bracketMarkdown));
    expect(double.render(bracketMarkdown)).not.toContain('class="math"');
  });

  it("should render the same output when used twice", () => {
    const options = { delimiters: "all" as const, render };
    const single = new MarkdownIt().use(tex, options);
    const double = new MarkdownIt().use(tex, options).use(tex, options);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('<span class="math">a=1</span>');
    expect(double.render(markdown)).toContain('<div class="math">c=3</div>');
  });

  it("should keep the first installation's renderers", () => {
    const options = { mathFence: true, render };
    const markdownIt = new MarkdownIt().use(tex, options);
    const fenceRenderer = markdownIt.renderer.rules.fence;
    const inlineRenderer = markdownIt.renderer.rules.math_inline;
    const blockRenderer = markdownIt.renderer.rules.math_block;

    markdownIt.use(tex, options);

    expect(markdownIt.renderer.rules.fence).toBe(fenceRenderer);
    expect(markdownIt.renderer.rules.math_inline).toBe(inlineRenderer);
    expect(markdownIt.renderer.rules.math_block).toBe(blockRenderer);
  });

  it("should wrap the fence renderer only once with mathFence", () => {
    const options = { mathFence: true, render };
    const markdownIt = new MarkdownIt().use(tex, options);
    const fenceRenderer = markdownIt.renderer.rules.fence;
    const mathFence = "```math\na=1\n```";
    const codeFence = "```js\nconst a = 1;\n```";

    markdownIt.use(tex, options);

    // The renderer identity is what proves the wrapper was applied once; stacked identical
    // wrappers would still produce the same output.
    expect(markdownIt.renderer.rules.fence).toBe(fenceRenderer);

    expect(markdownIt.render(mathFence)).toBe('<div class="math">a=1</div>');
    expect(markdownIt.render(codeFence)).toBe(new MarkdownIt().render(codeFence));
    expect(markdownIt.render(codeFence)).toContain('<pre><code class="language-js">');
  });

  it("should keep the first installation's render function", () => {
    const firstRender = (content: string): string => `first:${content}`;
    const secondRender = (content: string): string => `second:${content}`;
    const single = new MarkdownIt().use(tex, { render: firstRender });
    const double = new MarkdownIt()
      .use(tex, { render: firstRender })
      .use(tex, { render: secondRender });
    const result = double.render("$a=1$");

    expect(result).toBe(single.render("$a=1$"));
    expect(result).toContain("first:a=1");
    expect(result).not.toContain("second:");
  });

  it("should validate the render option before the no-op check", () => {
    const markdownIt = new MarkdownIt().use(tex, { render });

    expect(() => markdownIt.use(tex)).toThrow(
      '[@mdit/plugin-tex]: "render" option should be a function',
    );
  });
});
