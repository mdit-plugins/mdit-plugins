import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { uml } from "../src/index.js";

const blockRuleNames = (md: MarkdownItType): string[] => {
  const rules = (md.block.ruler as unknown as { __rules__: { name: string }[] }).__rules__;

  return rules.map(({ name }) => name);
};

const countBlockRule = (md: MarkdownItType, name: string): number =>
  blockRuleNames(md).filter((ruleName) => ruleName === name).length;

const markdown = `\
@start
a -> b
@end
`;

describe(uml, () => {
  it("should register the block rule under a namespaced name", () => {
    const markdownIt = new MarkdownIt().use(uml);

    expect(countBlockRule(markdownIt, "uml_uml")).toBe(1);
    expect(blockRuleNames(markdownIt)).not.toContain("uml");
  });

  it("should not register the block rule twice", () => {
    const single = new MarkdownIt().use(uml);
    const double = new MarkdownIt().use(uml).use(uml);

    expect(countBlockRule(single, "uml_uml")).toBe(1);
    expect(countBlockRule(double, "uml_uml")).toBe(1);
    expect(blockRuleNames(double)).not.toContain("uml");
  });

  it("should use the configured rule name", () => {
    const options = {
      name: "sequence",
      open: "start",
      close: "end",
      renderer: (tokens: Token[], index: number): string => tokens[index].content,
    };
    const single = new MarkdownIt().use(uml, options);
    const double = new MarkdownIt().use(uml, options).use(uml, options);

    expect(countBlockRule(single, "uml_sequence")).toBe(1);
    expect(countBlockRule(double, "uml_sequence")).toBe(1);
    expect(blockRuleNames(double)).not.toContain("sequence");
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt().use(uml);
    const double = new MarkdownIt().use(uml).use(uml);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('<div class="uml" title="">a -&gt; b');
  });

  it("should completely ignore a second installation with the same name", () => {
    const firstRenderer = (tokens: Token[], index: number): string =>
      `first:${tokens[index].content}`;
    const secondRenderer = (): string => "second";

    const single = new MarkdownIt().use(uml, {
      name: "uml",
      open: "start",
      close: "end",
      renderer: firstRenderer,
    });
    const double = new MarkdownIt()
      .use(uml, { name: "uml", open: "start", close: "end", renderer: firstRenderer })
      // A reinstall with different options must not replace the rule or the renderer.
      .use(uml, { name: "uml", open: "otherstart", close: "otherend", renderer: secondRenderer });

    expect(countBlockRule(double, "uml_uml")).toBe(1);
    expect(double.renderer.rules.uml).toBe(firstRenderer);
    expect(double.render(markdown)).toBe(single.render(markdown));
    // The second installation's markers were not installed either.
    expect(double.render("@otherstart\nc -> d\n@otherend\n")).toContain("<p>@otherstart");
  });

  it.each(["paragraph", "table", "fence"])(
    "should still parse uml fences when the name collides with built-in rule %s",
    (name) => {
      const markdownIt = new MarkdownIt().use(uml, {
        name,
        open: "start",
        close: "end",
        renderer: (tokens: Token[], index: number): string => tokens[index].content,
      });
      const ruleNames = blockRuleNames(markdownIt);
      const rule = (
        markdownIt.block.ruler as unknown as {
          __rules__: { name: string; alt: string[] }[];
        }
      ).__rules__.find(({ name: ruleName }) => ruleName === `uml_${name}`);

      expect(countBlockRule(markdownIt, `uml_${name}`)).toBe(1);
      // The namespaced rule is inserted right before the built-in `fence` rule.
      expect(ruleNames.indexOf(`uml_${name}`) + 1).toBe(ruleNames.indexOf("fence"));
      expect(rule?.alt).toStrictEqual(["paragraph", "reference", "blockquote", "list"]);
      expect(markdownIt.parse(markdown, {}).map(({ type }) => type)).toStrictEqual([name]);
      expect(markdownIt.render(markdown)).toBe("a -> b");
    },
  );

  it.each(["paragraph", "table"])(
    "should keep normal documents working beside a uml block when the name is %s",
    (name) => {
      const markdownIt = new MarkdownIt().use(uml, {
        name,
        open: "start",
        close: "end",
        renderer: (tokens: Token[], index: number): string => tokens[index].content,
      });
      const result = markdownIt.render(`# Title\n\n${markdown}\n| a | b |\n| - | - |\n| c | d |\n`);

      expect(result).toContain("<h1>Title</h1>");
      expect(result).toContain("<table>");
      expect(result).toContain("a -> b");
    },
  );

  it("should register independent rules and renderers for different names", () => {
    const umlRenderer = (tokens: Token[], index: number): string => `uml:${tokens[index].content}`;
    const sequenceRenderer = (tokens: Token[], index: number): string =>
      `sequence:${tokens[index].content}`;

    const markdownIt = new MarkdownIt()
      .use(uml, { name: "uml", open: "start", close: "end", renderer: umlRenderer })
      .use(uml, {
        name: "sequence",
        open: "sequencestart",
        close: "sequenceend",
        renderer: sequenceRenderer,
      });

    expect(countBlockRule(markdownIt, "uml_uml")).toBe(1);
    expect(countBlockRule(markdownIt, "uml_sequence")).toBe(1);
    expect(markdownIt.renderer.rules.uml).toBe(umlRenderer);
    expect(markdownIt.renderer.rules.sequence).toBe(sequenceRenderer);

    expect(
      markdownIt
        .parse("@start\na -> b\n@end\n@sequencestart\nc -> d\n@sequenceend\n", {})
        .map(({ type }) => type),
    ).toStrictEqual(["uml", "sequence"]);
    expect(markdownIt.render("@start\na -> b\n@end\n")).toContain("uml:a -> b");
    expect(markdownIt.render("@sequencestart\nc -> d\n@sequenceend\n")).toContain(
      "sequence:c -> d",
    );
  });
});
