import { describe, it, expect } from "vitest";
import { normalizeOption } from "../src/normalizeOption.js";
import { emojiRule } from "../src/rule.js";
import MarkdownIt from "markdown-it";

describe("coverage", () => {
  it("normalize_opts handles undefined definitions/shortcuts", () => {
    const res = normalizeOption({});
    expect(res.definitions).toEqual({});
    expect(res.shortcuts).toEqual({});
  });

  it("replace rule handles missing children in inline token", () => {
    const md = new MarkdownIt();
    // Start rule with dummy data
    const rule = emojiRule(md, {}, {}, /a/, /a/g);

    const mockState = {
      tokens: [{ type: "inline", children: null }],
      Token: md.core.State.prototype.Token, // Access Token class if possible, or just mock
    };

    // Actually md.core.State is not exposed easily as class usually?
    // md.utils.assign etc are used in rule? No, rule uses md.utils.
    // The returned function uses state.Token in splitTextToken.

    // Let's use a real State instance if possible, or adequate mock.
    // Core Rules receive `state`.

    // @ts-ignore
    rule(mockState);
    // Expect no error
  });
});
