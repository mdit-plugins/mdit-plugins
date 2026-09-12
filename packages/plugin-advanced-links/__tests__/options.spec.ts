import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { advancedLinks } from "../src/index.js";

describe("options", () => {
  describe("validation", () => {
    it("should throw when options is not an object", () => {
      const md = new MarkdownIt();

      // `options` is optional in types, but required at runtime
      expect(() => md.use(advancedLinks)).toThrow(
        '[@mdit/plugin-advanced-links]: "options" is required.',
      );
      // @ts-expect-error - testing invalid options
      expect(() => md.use(advancedLinks, null)).toThrow(
        '[@mdit/plugin-advanced-links]: "options" is required.',
      );
    });

    it("should throw when name is invalid", () => {
      const md = new MarkdownIt();
      const invalidNames: unknown[] = [
        undefined,
        "",
        1,
        "a b",
        "a\tb",
        "a\nb",
        "a[b",
        "a]b",
        "a(b",
        "a)b",
        'a"b',
        "a'b",
      ];

      invalidNames.forEach((name) => {
        expect(() =>
          // @ts-expect-error - testing invalid options
          md.use(advancedLinks, { name, renderer: (): string => "" }),
        ).toThrow('[@mdit/plugin-advanced-links]: "name" must be a non-empty string');
      });
    });

    it("should throw when renderer is invalid", () => {
      const md = new MarkdownIt();

      expect(() =>
        // @ts-expect-error - testing invalid options
        md.use(advancedLinks, { name: "test", renderer: "renderer" }),
      ).toThrow('[@mdit/plugin-advanced-links]: "renderer" must be a function.');
    });
  });

  describe("names", () => {
    it("should match the name exactly", () => {
      const md = new MarkdownIt()
        .use(advancedLinks, { name: "a-b", renderer: (): string => "DASH" })
        .use(advancedLinks, { name: "a.b", renderer: (): string => "DOT" })
        .use(advancedLinks, { name: "a@b", renderer: (): string => "AT" });

      expect(md.render("@[a-b](x)")).toBe("DASH");
      expect(md.render("@[a.b](x)")).toBe("DOT");
      expect(md.render("@[a@b](x)")).toBe("AT");
      // a prefix of a registered name is not registered
      expect(md.render("@[a-longer](x)")).toBe('<p>@<a href="x">a-longer</a></p>\n');
      expect(md.render("@[a](x)")).toBe('<p>@<a href="x">a</a></p>\n');
    });
  });

  describe("env", () => {
    it("should pass env to the renderer", () => {
      const renderer = vi.fn<() => string>((): string => "x");
      const md = new MarkdownIt().use(advancedLinks, { name: "test", renderer });
      const env = { filePath: "a.md" };

      md.render("@[test](link)", env);

      expect(renderer).toHaveBeenCalledWith("link", {}, env);
    });

    it("should pass the token props to the renderer", () => {
      const renderer = vi.fn<() => string>((): string => "x");
      const md = new MarkdownIt().use(advancedLinks, { name: "test", renderer });

      md.render("@[test a=1 autoplay](link)", {});

      expect(renderer).toHaveBeenCalledWith("link", { a: "1", autoplay: true }, {});
    });
  });
});
