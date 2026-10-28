import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { hasRule } from "../src/rules.js";

describe("hasRule helper", () => {
  it("should detect built-in rules in every ruler", () => {
    const md = new MarkdownIt();

    expect(hasRule(md, "inline")).toBe(true);
    expect(hasRule(md, "fence")).toBe(true);
    expect(hasRule(md, "text")).toBe(true);
  });

  it("should detect custom rules", () => {
    const md = new MarkdownIt();

    md.core.ruler.push("custom_core", () => {});
    md.block.ruler.before("paragraph", "custom_block", () => false);
    md.inline.ruler.push("custom_inline", () => false);

    expect(hasRule(md, "custom_core")).toBe(true);
    expect(hasRule(md, "custom_block")).toBe(true);
    expect(hasRule(md, "custom_inline")).toBe(true);
  });

  it("should return false for unknown rules", () => {
    expect(hasRule(new MarkdownIt(), "missing_rule")).toBe(false);
  });

  it("should restrict detection to the given ruler scope", () => {
    const md = new MarkdownIt();

    // markdown-it keeps separate rulers and does not enforce unique names across them.
    md.core.ruler.push("shared_rule_name", () => {});
    md.block.ruler.before("paragraph", "block_only", () => false);

    expect(hasRule(md, "shared_rule_name", "core")).toBe(true);
    expect(hasRule(md, "shared_rule_name", "block")).toBe(false);
    expect(hasRule(md, "shared_rule_name", "inline")).toBe(false);
    expect(hasRule(md, "block_only", "block")).toBe(true);
    expect(hasRule(md, "block_only", "core")).toBe(false);
  });

  it("should detect disabled rules", () => {
    const md = new MarkdownIt();

    md.block.ruler.disable("fence");

    expect(hasRule(md, "fence")).toBe(true);
  });
});
