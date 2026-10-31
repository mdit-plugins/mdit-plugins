import Markdownit from "markdown-it";
import { describe, it, expect } from "vitest";

import { bareEmoji } from "../src/index.js";

const definitions = {
  one: "!!!one!!!",
  fifty: "!!50!!",
};

describe("markdown-it-emoji empty shortcuts", () => {
  describe("single string form", () => {
    const md = new Markdownit().use(bareEmoji, {
      definitions,
      shortcuts: {
        one: "",
        fifty: ":50",
      },
    });

    it("keeps plain text unchanged", () => {
      expect(md.render("Hello world")).toBe("<p>Hello world</p>\n");
      expect(md.render("Hello, world")).toBe("<p>Hello, world</p>\n");
      expect(md.render("Hello world!")).toBe("<p>Hello world!</p>\n");
    });

    it("does not replace the empty string", () => {
      const children = md.parseInline("Hello, world", {})[0].children!;

      expect(children.filter(({ type }) => type === "emoji")).toHaveLength(0);
    });

    it("still resolves valid shortcuts", () => {
      expect(md.render("Hello :50 world")).toBe("<p>Hello !!50!! world</p>\n");
      expect(md.render(":50")).toBe("<p>!!50!!</p>\n");
    });
  });

  describe("array form", () => {
    const md = new Markdownit().use(bareEmoji, {
      definitions,
      shortcuts: {
        one: ["", ":uno"],
        fifty: ["", ":50"],
      },
    });

    it("keeps plain text unchanged", () => {
      expect(md.render("Hello world")).toBe("<p>Hello world</p>\n");
      expect(md.render("Hello, world")).toBe("<p>Hello, world</p>\n");
      expect(md.render("Hello world!")).toBe("<p>Hello world!</p>\n");
    });

    it("does not replace the empty string", () => {
      const children = md.parseInline("Hello, world", {})[0].children!;

      expect(children.filter(({ type }) => type === "emoji")).toHaveLength(0);
    });

    it("still resolves valid shortcuts", () => {
      expect(md.render(":uno :50")).toBe("<p>!!!one!!! !!50!!</p>\n");
    });
  });

  describe("whitespace-only form", () => {
    const md = new Markdownit().use(bareEmoji, {
      definitions,
      shortcuts: {
        one: "  ",
        fifty: [" ", "\t", ":50"],
      },
    });

    it("keeps plain text unchanged", () => {
      expect(md.render("Hello world")).toBe("<p>Hello world</p>\n");
      expect(md.render("Hello, world")).toBe("<p>Hello, world</p>\n");
      expect(md.render("Hello, \tworld")).toBe("<p>Hello, \tworld</p>\n");

      // no emoji token may be produced for the whitespace-only shortcuts
      for (const source of ["Hello world", "Hello, world", "Hello, \tworld"]) {
        const children = md.parseInline(source, {})[0].children!;

        expect(children.filter(({ type }) => type === "emoji")).toHaveLength(0);
      }
    });

    it("still resolves valid shortcuts", () => {
      expect(md.render("Hello :50 world")).toBe("<p>Hello !!50!! world</p>\n");
    });
  });
});
