import { CORE_SCHEMA } from "js-yaml";
import { describe, expect, it } from "vitest";

import { parseFrontmatter } from "../src/parse.js";

describe(parseFrontmatter, () => {
  describe("delimiters", () => {
    it("parses the default delimiters", () => {
      expect(parseFrontmatter("---\ntitle: Hello\ncount: 2\n---\n# Hello")).toStrictEqual({
        data: { title: "Hello", count: 2 },
        content: "# Hello",
        excerpt: "",
        matter: "\ntitle: Hello\ncount: 2",
        language: "",
        isEmpty: false,
      });
    });

    it("keeps the first closing delimiter", () => {
      expect(parseFrontmatter("---\na: 1\n---\nbody\n---\nmore")).toStrictEqual({
        data: { a: 1 },
        content: "body\n---\nmore",
        excerpt: "",
        matter: "\na: 1",
        language: "",
        isEmpty: false,
      });
    });

    it("supports a custom delimiter", () => {
      expect(parseFrontmatter("~~~\ntitle: Hello\n~~~\nBody", { delimiters: "~~~" })).toStrictEqual(
        {
          data: { title: "Hello" },
          content: "Body",
          excerpt: "",
          matter: "\ntitle: Hello",
          language: "",
          isEmpty: false,
        },
      );
    });

    it("supports asymmetric delimiters", () => {
      expect(
        parseFrontmatter("<!--\ntitle: Hello\n-->\nBody", {
          delimiters: ["<!--", "-->"],
        }),
      ).toStrictEqual({
        data: { title: "Hello" },
        content: "Body",
        excerpt: "",
        matter: "\ntitle: Hello",
        language: "",
        isEmpty: false,
      });
    });

    it("throws for an empty opening delimiter", () => {
      expect(() => parseFrontmatter("---", { delimiters: "" })).toThrow(
        new TypeError("[@mdit/plugin-frontmatter]: delimiters must not be empty"),
      );
    });

    it("throws for an empty closing delimiter", () => {
      expect(() => parseFrontmatter("---", { delimiters: ["---", ""] })).toThrow(
        new TypeError("[@mdit/plugin-frontmatter]: delimiters must not be empty"),
      );
    });

    it("treats an extended delimiter as a horizontal rule", () => {
      const source = "----\ntitle: Hello\n----";

      expect(parseFrontmatter(source)).toStrictEqual({
        data: {},
        content: source,
        excerpt: "",
        matter: "",
        language: "",
        isEmpty: false,
      });
    });

    it("strips a byte order mark", () => {
      expect(parseFrontmatter("\uFEFF---\ntitle: Hello\n---\nBody").content).toBe("Body");
    });
  });

  describe("language markers", () => {
    it("detects a language marker", () => {
      expect(parseFrontmatter("---yaml\ntitle: Hello\n---")).toMatchObject({
        data: { title: "Hello" },
        language: "yaml",
        matter: "\ntitle: Hello",
      });
    });

    it("supports the yml alias", () => {
      expect(parseFrontmatter("---yml\ntitle: Hello\n---")).toMatchObject({
        data: { title: "Hello" },
        language: "yml",
      });
    });

    it("trims and lowercases a language marker", () => {
      expect(parseFrontmatter('--- JSON \n{"title":"Hello"}\n---')).toMatchObject({
        data: { title: "Hello" },
        language: "json",
      });
    });

    it("handles a marker followed by CRLF", () => {
      expect(parseFrontmatter("---YAML\r\ntitle: Hello\r\n---\r\nBody")).toMatchObject({
        data: { title: "Hello" },
        content: "Body",
        language: "yaml",
      });
    });

    it("handles a marker without a trailing newline", () => {
      expect(parseFrontmatter("---yaml")).toMatchObject({
        data: {},
        content: "",
        language: "yaml",
        isEmpty: true,
      });
    });

    it("handles an empty marker followed by CRLF", () => {
      expect(parseFrontmatter("---\r\ntitle: Hello\r\n---\r\nBody")).toMatchObject({
        data: { title: "Hello" },
        content: "Body",
        language: "",
      });
    });

    it("handles whitespace after the opening delimiter", () => {
      expect(parseFrontmatter("---   ")).toMatchObject({
        data: {},
        content: "",
        language: "",
        isEmpty: true,
      });
    });

    it("uses the configured language", () => {
      expect(parseFrontmatter('---\n{"title":"Hello"}\n---', { language: "JSON" })).toMatchObject({
        data: { title: "Hello" },
        language: "",
      });
    });

    it("falls back to yaml for an empty configured language", () => {
      expect(parseFrontmatter("---\ntitle: Hello\n---", { language: "" })).toMatchObject({
        data: { title: "Hello" },
      });
    });

    it("uses a custom parser for a marked language", () => {
      expect(
        parseFrontmatter("---TOML\ntitle = Hello\n---", {
          parsers: {
            toml: (source) => ({ source }),
          },
        }),
      ).toMatchObject({
        data: { source: "\ntitle = Hello" },
        language: "toml",
      });
    });

    it("throws for an unsupported language", () => {
      expect(() => parseFrontmatter("---toml\ntitle = Hello\n---")).toThrow(
        new Error('[@mdit/plugin-frontmatter]: Unsupported frontmatter language "toml"'),
      );
    });

    it("prefers a custom parser over the built-in one", () => {
      expect(
        parseFrontmatter('---json\n{"title":"Hello"}\n---', {
          parsers: {
            json: () => ({ custom: true }),
          },
        }).data,
      ).toStrictEqual({ custom: true });
    });
  });

  describe("data parsing", () => {
    it("parses YAML 1.1 scalar forms", () => {
      expect(
        parseFrontmatter("---\ndate: 2022-07-06\nflag: yes\nnegative: no\nhex: 0x10\nexp: 1e3\n---")
          .data,
      ).toStrictEqual({
        date: new Date("2022-07-06T00:00:00Z"),
        flag: true,
        negative: false,
        hex: 16,
        exp: "1e3",
      });
    });

    it("supports YAML 1.1 tags", () => {
      expect(
        parseFrontmatter(`---
base: &base
  a: 1
merged:
  <<: *base
  b: 2
binary: !!binary aGVsbG8=
set: !!set
  ? a
  ? b
omap: !!omap
  - a: 1
pairs: !!pairs
  - a: 1
---`).data,
      ).toStrictEqual({
        base: { a: 1 },
        merged: { a: 1, b: 2 },
        binary: new Uint8Array([104, 101, 108, 108, 111]),
        set: new Set(["a", "b"]),
        omap: [{ a: 1 }],
        pairs: [["a", 1]],
      });
    });

    it("parses YAML 1.1 integer forms", () => {
      expect(
        parseFrontmatter(
          "---\noctal: 010\nbinary: 0b101\nunderscored: 1_000\nsexagesimal: 12:34\nnotOctal: 0o17\n---",
        ).data,
      ).toStrictEqual({
        octal: 8,
        binary: 5,
        underscored: 1000,
        sexagesimal: 754,
        notOctal: "0o17",
      });
    });

    it("allows overriding the YAML schema", () => {
      expect(
        parseFrontmatter("---\ndate: 2022-07-06\nflag: yes\n---", {
          yamlOptions: { schema: CORE_SCHEMA },
        }).data,
      ).toStrictEqual({ date: "2022-07-06", flag: "yes" });
    });

    it("parses JSON", () => {
      expect(
        parseFrontmatter('---json\n{"title":"Hello","nested":{"count":2}}\n---').data,
      ).toStrictEqual({
        title: "Hello",
        nested: { count: 2 },
      });
    });

    it("treats null data as empty", () => {
      expect(parseFrontmatter("---\nnull\n---").data).toStrictEqual({});
      expect(parseFrontmatter("---json\nnull\n---").data).toStrictEqual({});
    });

    it("keeps an empty mapping", () => {
      expect(parseFrontmatter("---\n{}\n---")).toMatchObject({
        data: {},
        isEmpty: false,
      });
    });

    it("throws for invalid YAML", () => {
      expect(() => parseFrontmatter("---\ntitle: [\n---")).toThrow(
        "unexpected end of the stream within a flow collection",
      );
    });

    it("throws for invalid JSON", () => {
      expect(() => parseFrontmatter("---json\n{invalid}\n---")).toThrow(SyntaxError);
    });

    it("throws for a non-mapping YAML root", () => {
      expect(() => parseFrontmatter("---\n- one\n- two\n---")).toThrow(
        new TypeError(
          '[@mdit/plugin-frontmatter]: Frontmatter language "yaml" must parse to a plain object mapping',
        ),
      );
    });

    it("throws for a scalar YAML root", () => {
      expect(() => parseFrontmatter("---\nhello\n---")).toThrow(TypeError);
    });

    it("throws for a timestamp YAML root", () => {
      expect(() => parseFrontmatter("---\n2022-07-06\n---")).toThrow(
        new TypeError(
          '[@mdit/plugin-frontmatter]: Frontmatter language "yaml" must parse to a plain object mapping',
        ),
      );
    });

    it("throws for a JSON array root", () => {
      expect(() => parseFrontmatter('---json\n["one"]\n---')).toThrow(
        new TypeError(
          '[@mdit/plugin-frontmatter]: Frontmatter language "json" must parse to a plain object mapping',
        ),
      );
    });

    it("throws for a JSON scalar root", () => {
      expect(() => parseFrontmatter('---json\n"hello"\n---')).toThrow(TypeError);
    });

    it("treats null from a custom parser as empty", () => {
      expect(
        parseFrontmatter("---toml\nvalue\n---", {
          parsers: { toml: () => null },
        }).data,
      ).toStrictEqual({});
    });

    it("accepts a null-prototype mapping from a custom parser", () => {
      const data = Object.create(null) as Record<string, unknown>;

      data.title = "Hello";

      expect(
        parseFrontmatter("---toml\ntitle\n---", {
          parsers: { toml: () => data },
        }).data,
      ).toBe(data);
    });

    it("throws for a function returned by a custom parser", () => {
      expect(() =>
        parseFrontmatter("---toml\nvalue\n---", {
          parsers: { toml: (): (() => null) => () => null },
        }),
      ).toThrow(TypeError);
    });
  });

  describe("empty blocks", () => {
    it("parses an empty frontmatter block", () => {
      expect(parseFrontmatter("---\n---\nBody")).toStrictEqual({
        data: {},
        content: "Body",
        excerpt: "",
        matter: "",
        language: "",
        isEmpty: true,
      });
    });

    it("parses a comment-only block", () => {
      expect(parseFrontmatter("---\n# comment\n#\n---\nBody")).toMatchObject({
        data: {},
        content: "Body",
        isEmpty: true,
      });
    });

    it("parses comments followed by data", () => {
      expect(parseFrontmatter("---\n# comment\ntitle: Hello\n---")).toMatchObject({
        data: { title: "Hello" },
        isEmpty: false,
      });
    });

    it("parses an unclosed block", () => {
      expect(parseFrontmatter("---\ntitle: Hello")).toMatchObject({
        data: { title: "Hello" },
        content: "",
        matter: "\ntitle: Hello",
        isEmpty: false,
      });
    });

    it("parses an unclosed empty block", () => {
      expect(parseFrontmatter("---")).toMatchObject({
        data: {},
        content: "",
        isEmpty: true,
      });
    });

    it("parses an unclosed comment block", () => {
      expect(parseFrontmatter("---\n# comment")).toMatchObject({
        data: {},
        content: "",
        isEmpty: true,
      });
    });
  });

  describe("content", () => {
    it.each([
      ["\r\n# Hello", "# Hello"],
      ["\n# Hello", "# Hello"],
      ["\rBody", "Body"],
      ["Body", "Body"],
    ])("strips the separator after the closing delimiter: %j", (separator, expected) => {
      expect(parseFrontmatter(`---\ntitle: Hello\n---${separator}`).content).toBe(expected);
    });

    it("keeps the content unchanged when the delimiter does not start the source", () => {
      expect(parseFrontmatter("# Hello\n---\nBody")).toMatchObject({
        content: "# Hello\n---\nBody",
        matter: "",
      });
    });
  });

  describe("excerpt", () => {
    it("does not extract an excerpt by default", () => {
      expect(parseFrontmatter("---\ntitle: Hello\n---\n# Hello\n---\nBody").excerpt).toBe("");
    });

    it("extracts an excerpt before the opening delimiter", () => {
      expect(
        parseFrontmatter("---\ntitle: Hello\n---\n# Hello\n---\nBody", { excerpt: true }),
      ).toMatchObject({
        content: "# Hello\n---\nBody",
        excerpt: "# Hello\n",
      });
    });

    it("extracts an excerpt with a configured separator", () => {
      expect(
        parseFrontmatter("---\ntitle: Hello\n---\n# Hello\n<!-- more -->\nBody", {
          excerpt: true,
          excerptSeparator: "<!-- more -->",
        }),
      ).toMatchObject({
        content: "# Hello\n<!-- more -->\nBody",
        excerpt: "# Hello\n",
      });
    });

    it("uses a string excerpt as the delimiter", () => {
      expect(
        parseFrontmatter("---\ntitle: Hello\n---\n# Hello\n<!-- more -->\nBody", {
          excerpt: "<!-- more -->",
        }).excerpt,
      ).toBe("# Hello\n");
    });

    it("extracts an excerpt when only the separator is configured", () => {
      expect(
        parseFrontmatter("---\ntitle: Hello\n---\n# Hello\n<!-- more -->\nBody", {
          excerpt: false,
          excerptSeparator: "<!-- more -->",
        }).excerpt,
      ).toBe("# Hello\n");
    });

    it("prefers the separator from the data", () => {
      expect(
        parseFrontmatter(
          "---\nexcerpt_separator: <!-- data -->\n---\n# Hello\n<!-- data -->\nBody",
          { excerpt: true, excerptSeparator: "<!-- option -->" },
        ).excerpt,
      ).toBe("# Hello\n");
    });

    it("falls back when the data separator is not a string", () => {
      expect(
        parseFrontmatter("---\nexcerpt_separator: 123\n---\n# Hello\n<!-- more -->\nBody", {
          excerpt: true,
          excerptSeparator: "<!-- more -->",
        }).excerpt,
      ).toBe("# Hello\n");
    });

    it("falls back to the opening delimiter for an empty data separator", () => {
      expect(
        parseFrontmatter('---\nexcerpt_separator: ""\n---\n# Hello\n---\nBody', {
          excerpt: true,
        }).excerpt,
      ).toBe("# Hello\n");
    });

    it("falls back to the opening delimiter for an empty option separator", () => {
      for (const excerpt of [true, false]) {
        expect(
          parseFrontmatter("---\ntitle: Hello\n---\n# Hello\n---\nBody", {
            excerpt,
            excerptSeparator: "",
          }).excerpt,
        ).toBe("# Hello\n");
      }
    });

    it("does not extract an excerpt when the delimiter is missing", () => {
      expect(parseFrontmatter("---\ntitle: Hello\n---\n# Hello", { excerpt: true }).excerpt).toBe(
        "",
      );
    });

    it("uses an empty string delimiter", () => {
      expect(parseFrontmatter("---\ntitle: Hello\n---\n# Hello", { excerpt: "" }).excerpt).toBe("");
    });

    it("supports a custom excerpt resolver", () => {
      const file = parseFrontmatter("---\ntitle: Hello\n---\n# Hello", {
        excerpt: (parsed) => {
          parsed.excerpt = `${String(parsed.data.title)}: ${parsed.content}`;
        },
      });

      expect(file.excerpt).toBe("Hello: # Hello");
    });

    it("extracts an excerpt from content without frontmatter", () => {
      expect(
        parseFrontmatter("# Hello\n<!-- more -->\nBody", {
          excerpt: "<!-- more -->",
        }),
      ).toMatchObject({
        content: "# Hello\n<!-- more -->\nBody",
        excerpt: "# Hello\n",
      });
    });
  });
});
