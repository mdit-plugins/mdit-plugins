// oxlint-disable vitest/no-conditional-in-test
import { readFileSync } from "node:fs";

import { describe, it, expect } from "vitest";

import { PINNED_ALIASES, resolveAliases } from "../scripts/emojiAliases.js";
import { emojiData } from "../src/data/full.js";
// data for integrity check testing
import { emojiLightData } from "../src/data/light.js";
import { emojiShortCuts } from "../src/data/shortcuts.js";

describe("integrity", () => {
  it("all shortcuts should exist", () => {
    Object.keys(emojiShortCuts).forEach((name) => {
      expect(emojiData[name], `shortcut doesn't exist: ${name}`).toBeTruthy();
    });
  });

  it('no chars with "uXXXX" names allowed', () => {
    expect(() =>
      Object.keys(emojiData).forEach((name) => {
        if (/^u[0-9a-f]{4,}$/i.test(name)) throw new Error(`Name ${name} not allowed`);
      }),
    ).not.toThrow();
  });

  it("should name code-point-only emoji with their pinned names", () => {
    // Upstream gemoji only exposes code point aliases such as `u6e80` for some
    // CJK symbol emoji. The generator maps those to pinned names, so the emoji
    // stay reachable without depending on CLDR wording.
    Object.entries(PINNED_ALIASES).forEach(([emoji, name]) => {
      expect(emojiData[name], `missing pinned alias ${name}`).toBe(emoji);
    });

    expect(emojiData).not.toHaveProperty("u6e80");
  });

  it("resolveAliases should keep named aliases and drop placeholders", () => {
    expect(resolveAliases(["u6e80", "smile"], "😄")).toStrictEqual(["smile"]);
  });

  it("resolveAliases should use pinned names", () => {
    expect(resolveAliases(["u6e80"], "🈵")).toStrictEqual(["japanese_no_vacancy_button"]);
  });

  it("resolveAliases should fall back to the description", () => {
    expect(resolveAliases(["u1234"], "🆕", "Japanese “new” button")).toStrictEqual([
      "japanese_new_button",
    ]);
  });

  it("resolveAliases should leave unnamed emoji unnamed", () => {
    expect(resolveAliases([], "🆕", "Japanese “new” button")).toStrictEqual([]);
  });

  it("resolveAliases should never return an empty alias", () => {
    expect(resolveAliases(["u1234"], "🆕", "“”")).toStrictEqual([]);
  });

  it("all light chars should exist", () => {
    const visible = readFileSync(new URL("../visible.txt", import.meta.url), "utf-8");

    const available = new Set(
      Object.keys(emojiLightData).map((k) => emojiLightData[k].replaceAll("\uFE0F", "")),
    );

    let missed = "";

    // oxlint-disable-next-line typescript/no-misused-spread
    [...visible].forEach((char) => {
      // oxlint-disable-next-line vitest/no-conditional-in-test
      if (!available.has(char)) missed += char;
    });

    expect(missed).toBe("");
  });
});
