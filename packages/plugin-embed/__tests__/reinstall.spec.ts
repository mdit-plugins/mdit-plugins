import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { embed } from "../src/index.js";

describe("embed reinstallation", () => {
  it("should drop inline behavior when reinstalled without allowInline", () => {
    const md = new MarkdownIt().use(embed, {
      config: [{ name: "icon", allowInline: true, setup: (): string => "inline" }],
    });

    expect(md.render("text {% icon %} more")).toBe("<p>text inline more</p>\n");

    md.use(embed, {
      config: [{ name: "icon", setup: (): string => "block" }],
    });

    // The stale inline entry must be gone, so the embed stays literal text
    expect(md.render("text {% icon %} more")).toBe("<p>text {% icon %} more</p>\n");
    expect(md.renderInline("text {% icon %} more")).toBe("text {% icon %} more");

    // ...while the block embed uses the new setup
    expect(md.render("{% icon %}")).toBe("block");

    // Re-enabling inline support in a later installation should work again
    md.use(embed, {
      config: [{ name: "icon", allowInline: true, setup: (): string => "inline-again" }],
    });

    expect(md.render("text {% icon %} more")).toBe("<p>text inline-again more</p>\n");
  });

  it("should use the new setup when reinstalled with allowInline", () => {
    const md = new MarkdownIt().use(embed, {
      config: [{ name: "badge", allowInline: true, setup: (): string => "first" }],
    });

    expect(md.render("text {% badge %} more")).toBe("<p>text first more</p>\n");
    expect(md.render("{% badge %}")).toBe("<p>first</p>\n");

    md.use(embed, {
      config: [{ name: "badge", allowInline: true, setup: (): string => "second" }],
    });

    expect(md.render("text {% badge %} more")).toBe("<p>text second more</p>\n");
    expect(md.render("{% badge %}")).toBe("<p>second</p>\n");
  });

  it("should let the last duplicate config entry win for block and inline", () => {
    const md = new MarkdownIt().use(embed, {
      config: [
        { name: "item", allowInline: true, setup: (): string => "first" },
        { name: "item", setup: (): string => "second" },
      ],
    });

    expect(md.render("text {% item %} more")).toBe("<p>text {% item %} more</p>\n");
    expect(md.render("{% item %}")).toBe("second");
  });

  it("should render tokens parsed before inline support was dropped as literal text", () => {
    const md = new MarkdownIt().use(embed, {
      config: [{ name: "icon", allowInline: true, setup: (): string => "<b>inline</b>" }],
    });

    // markdown-it allows parsing and rendering to be separated: tokens may
    // outlive the installation that produced them.
    const tokens = md.parse("text {% icon %} more", {});
    const tokensWithParams = md.parse("text {% icon size=2 %} more", {});

    md.use(embed, {
      config: [{ name: "icon", setup: (): string => "block" }],
    });

    expect(md.renderer.render(tokens, md.options, {})).toBe("<p>text {% icon %} more</p>\n");
    expect(md.renderer.render(tokensWithParams, md.options, {})).toBe(
      "<p>text {% icon size=2 %} more</p>\n",
    );
  });
});
