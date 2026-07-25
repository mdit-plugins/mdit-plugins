// oxlint-disable vitest/no-conditional-in-test
import { readFileSync } from "node:fs";

import { describe, it, expect } from "vitest";

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
        if (/^u[0-9a-b]{4,}$/i.test(name)) throw new Error(`Name ${name} not allowed`);
      }),
    ).not.toThrow();
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
