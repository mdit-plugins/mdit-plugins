import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance } from "markdown-it";
import { describe, expect, it } from "vitest";

import { definePlugin } from "../src/plugin.js";

describe("definePlugin helper", () => {
  it("should return a simple plugin unchanged", () => {
    const plugin = (md: MarkdownItInstance): void => {
      md.set({ breaks: true });
    };
    const defined = definePlugin(plugin);

    expect(defined).toBe(plugin);
    expect(new MarkdownIt().use(defined).options.breaks).toBe(true);
  });

  it("should return a plugin with options unchanged", () => {
    let received: { breaks?: boolean } | undefined;
    const plugin = (md: MarkdownItInstance, options?: { breaks?: boolean }): void => {
      received = options;
      md.set({ breaks: true });
    };
    const defined = definePlugin<{ breaks?: boolean }>(plugin);

    expect(defined).toBe(plugin);
    expect(new MarkdownIt().use(defined, { breaks: true }).options.breaks).toBe(true);
    expect(received).toStrictEqual({ breaks: true });
  });

  it("should assign the given name to the plugin", () => {
    const plugin = (md: MarkdownItInstance): void => {
      md.set({ breaks: true });
    };
    const defined = definePlugin("named", plugin);

    expect(defined).toBe(plugin);
    expect(defined.name).toBe("named");
    expect(new MarkdownIt().use(defined).options.breaks).toBe(true);
  });

  it("should reject a missing plugin", () => {
    const unsafeDefinePlugin = definePlugin as unknown as (name: string) => void;

    expect(() => unsafeDefinePlugin("missing")).toThrow(
      "@mdit/helper: definePlugin expects a plugin function.",
    );
  });
});
