// oxlint-disable typescript/no-deprecated

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgSize, legacyImgSize, obsidianImgSize } from "../src/index.js";

const inlineRuleNames = (md: MarkdownItType): string[] => {
  const rules = (md.inline.ruler as unknown as { __rules__: { name: string }[] }).__rules__;

  return rules.map(({ name }) => name);
};

describe(imgSize, () => {
  const markdown = "![image =100x200](/logo.svg)\n";

  it("should not register the inline rule twice", () => {
    const single = new MarkdownIt().use(imgSize);
    const double = new MarkdownIt().use(imgSize).use(imgSize);

    expect(inlineRuleNames(single).filter((name) => name === "img-size")).toHaveLength(1);
    expect(inlineRuleNames(double).filter((name) => name === "img-size")).toHaveLength(1);
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt().use(imgSize);
    const double = new MarkdownIt().use(imgSize).use(imgSize);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('width="100" height="200"');
  });
});

describe(obsidianImgSize, () => {
  const markdown = "![image|100x200](/logo.svg)\n";

  it("should not register the inline rule twice", () => {
    const single = new MarkdownIt().use(obsidianImgSize);
    const double = new MarkdownIt().use(obsidianImgSize).use(obsidianImgSize);

    expect(inlineRuleNames(single).filter((name) => name === "obsidian-img-size")).toHaveLength(1);
    expect(inlineRuleNames(double).filter((name) => name === "obsidian-img-size")).toHaveLength(1);
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt().use(obsidianImgSize);
    const double = new MarkdownIt().use(obsidianImgSize).use(obsidianImgSize);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('width="100" height="200"');
  });
});

describe(legacyImgSize, () => {
  const markdown = "![image](/logo.svg =100x200)\n";

  it("should not add another image rule", () => {
    const single = new MarkdownIt().use(legacyImgSize);
    const double = new MarkdownIt().use(legacyImgSize).use(legacyImgSize);

    // markdown-it ships an `image` rule already, so a single installation owns two
    // entries with that name; a repeated installation must not add a third one.
    expect(inlineRuleNames(single).filter((name) => name === "image")).toHaveLength(2);
    expect(inlineRuleNames(double)).toStrictEqual(inlineRuleNames(single));
  });

  it("should stay idempotent when combined with the other img-size variants", () => {
    for (const plugin of [imgSize, obsidianImgSize]) {
      const single = new MarkdownIt().use(plugin).use(legacyImgSize);
      const double = new MarkdownIt().use(plugin).use(legacyImgSize).use(legacyImgSize);

      expect(inlineRuleNames(single).filter((name) => name === "image")).toHaveLength(2);
      expect(single.render(markdown)).toContain('width="100" height="200"');
      expect(inlineRuleNames(double)).toStrictEqual(inlineRuleNames(single));
      expect(double.render(markdown)).toBe(single.render(markdown));
    }
  });

  it("should render the same output when used twice", () => {
    const single = new MarkdownIt().use(legacyImgSize);
    const double = new MarkdownIt().use(legacyImgSize).use(legacyImgSize);

    expect(double.render(markdown)).toBe(single.render(markdown));
    expect(double.render(markdown)).toContain('width="100" height="200"');
  });
});
