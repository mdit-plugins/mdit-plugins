import type { Env } from "markdown-it";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItFrontmatterOptions } from "../src/index.js";
import { frontmatter } from "../src/index.js";

// The cases below are kept from @mdit-vue/plugin-frontmatter and only adapt the option names.
const upstreamCases: {
  source: string;
  options: MarkdownItFrontmatterOptions;
  env: Env;
  content: Env["content"];
  frontmatter: Env["frontmatter"];
  excerpt: Env["excerpt"];
}[] = [
  {
    source: `\
---
str: string
num: 123
date: 2022-07-06
---
`,
    options: {},
    env: {},
    content: "",
    frontmatter: {
      str: "string",
      num: 123,
      date: "2022-07-06",
    },
    excerpt: "",
  },
  {
    source: `\
---
foo: foo
bar: bar
---
`,
    options: {},
    env: {
      frontmatter: {
        foo: "default-foo",
        baz: "default-baz",
      },
    },
    content: "",
    frontmatter: {
      foo: "foo",
      bar: "bar",
      baz: "default-baz",
    },
    excerpt: "",
  },
  {
    source: `\
# Hello, world
---
`,
    options: {},
    env: {},
    content: `\
# Hello, world
---
`,
    frontmatter: {},
    excerpt: "",
  },
  {
    source: `\
---
foo: foo
bar: bar
---
# Hello, world
---
`,
    options: {
      excerpt: true,
    },
    env: {},
    content: `\
# Hello, world
---
`,
    frontmatter: {
      foo: "foo",
      bar: "bar",
    },
    excerpt: "<h1>Hello, world</h1>\n",
  },
  {
    source: `\
---
foo: foo
bar: bar
---
# Hello, world
<!-- more -->
`,
    options: {
      excerpt: true,
      excerptSeparator: "<!-- more -->",
    },
    env: {},
    content: `\
# Hello, world
<!-- more -->
`,
    frontmatter: {
      foo: "foo",
      bar: "bar",
    },
    excerpt: "<h1>Hello, world</h1>\n",
  },
  {
    source: `\
---
foo: foo
bar: bar
---
# Hello, world
<!-- more -->
`,
    options: {
      excerpt: true,
      excerptSeparator: "<!-- more -->",
      renderExcerpt: false,
    },
    env: {},
    content: `\
# Hello, world
<!-- more -->
`,
    frontmatter: {
      foo: "foo",
      bar: "bar",
    },
    excerpt: "# Hello, world\n",
  },
];

describe(frontmatter, () => {
  describe("upstream cases", () => {
    it.each(upstreamCases)(
      "case %#",
      ({ source, options, env: rawEnv, content, frontmatter: data, excerpt }) => {
        const md = new MarkdownIt().use(frontmatter, options);
        const env: Env = { ...rawEnv };

        md.render(source, env);

        expect(env.content).toBe(content);
        expect(env.frontmatter).toStrictEqual(data);
        expect(env.excerpt).toBe(excerpt);
      },
    );
  });

  it("removes frontmatter from the rendered output", () => {
    const md = new MarkdownIt().use(frontmatter);

    expect(md.render("---\ntitle: Hello\n---\n# Hello")).toBe("<h1>Hello</h1>\n");
  });

  it("renders CRLF frontmatter", () => {
    const md = new MarkdownIt().use(frontmatter);
    const env: Env = {};

    expect(md.render("---\r\ntitle: Hello\r\n---\r\n# Hello", env)).toBe("<h1>Hello</h1>\n");
    expect(env.frontmatter).toStrictEqual({ title: "Hello" });
    expect(env.content).toBe("# Hello");
  });

  it("keeps the opening delimiter of a horizontal rule", () => {
    const md = new MarkdownIt().use(frontmatter);
    const env: Env = {};

    md.render("----\ntitle: Hello\n----", env);

    expect(env.content).toBe("----\ntitle: Hello\n----");
    expect(env.frontmatter).toStrictEqual({});
  });

  it("supports custom delimiters", () => {
    const md = new MarkdownIt().use(frontmatter, {
      delimiters: ["<!--", "-->"],
    });
    const env: Env = {};

    expect(md.render("<!--\ntitle: Hello\n-->\n# Hello", env)).toBe("<h1>Hello</h1>\n");
    expect(env.frontmatter).toStrictEqual({ title: "Hello" });
    expect(env.content).toBe("# Hello");
  });

  it("supports a language marker", () => {
    const md = new MarkdownIt().use(frontmatter);
    const env: Env = {};

    expect(md.render('---json\n{"title":"Hello"}\n---\n# Hello', env)).toBe("<h1>Hello</h1>\n");
    expect(env.frontmatter).toStrictEqual({ title: "Hello" });
  });

  it("supports a custom parser", () => {
    const md = new MarkdownIt().use(frontmatter, {
      parsers: {
        toml: (source) => ({ title: source.slice(source.indexOf("=") + 1).trim() }),
      },
    });
    const env: Env = {};

    md.render("---toml\ntitle = Hello\n---", env);

    expect(env.frontmatter).toStrictEqual({ title: "Hello" });
  });

  it("uses the data excerpt separator", () => {
    const md = new MarkdownIt().use(frontmatter, { excerpt: true });
    const env: Env = {};

    md.render("---\nexcerpt_separator: <!-- more -->\n---\n# Hello\n<!-- more -->\nBody", env);

    expect(env.excerpt).toBe("<h1>Hello</h1>\n");
  });

  it("supports a custom excerpt resolver", () => {
    const md = new MarkdownIt().use(frontmatter, {
      excerpt: (file) => {
        file.excerpt = file.content.toUpperCase();
      },
      renderExcerpt: false,
    });
    const env: Env = {};

    md.render("---\ntitle: Hello\n---\n# Hello", env);

    expect(env.excerpt).toBe("# HELLO");
  });

  it("does not extract an excerpt by default", () => {
    const md = new MarkdownIt().use(frontmatter);
    const env: Env = {};

    md.render("---\ntitle: Hello\n---\n# Hello\n---\nBody", env);

    expect(env.excerpt).toBe("");
  });

  it("does not parse frontmatter inside a rendered excerpt", () => {
    const md = new MarkdownIt().use(frontmatter, { excerpt: "<!-- more -->" });
    const env: Env = {};

    md.render("---\ntitle: Hello\n---\n---\nBody\n<!-- more -->", env);

    expect(env.excerpt).toBe("<hr>\n<p>Body</p>\n");
  });

  it("merges frontmatter into an existing env across renders", () => {
    const md = new MarkdownIt().use(frontmatter);
    const env: Env = { frontmatter: { default: true } };

    md.render("---\nfirst: 1\n---", env);
    md.render("---\nsecond: 2\n---", env);

    expect(env.frontmatter).toStrictEqual({ default: true, first: 1, second: 2 });
  });

  it("does not process frontmatter when rendering inline", () => {
    const md = new MarkdownIt().use(frontmatter, {
      excerpt: true,
      excerptSeparator: "<!-- more -->",
    });
    const env: Env = {};

    md.render("---\ntitle: Page\n---\n# Page\n<!-- more -->\nBody", env);
    const pageEnv = { ...env };

    expect(md.renderInline("---\ntitle: Inline\n---\n**Bold**", env)).toContain("title: Inline");
    expect(env).toStrictEqual(pageEnv);
  });

  it("parses without an env object", () => {
    const md = new MarkdownIt().use(frontmatter);

    expect(() =>
      md.parse("---\ntitle: Hello\n---\n# Hello", undefined as unknown as Env),
    ).not.toThrow();
  });

  it("is idempotent when installed twice", () => {
    const md = new MarkdownIt().use(frontmatter).use(frontmatter);
    const env: Env = {};

    expect(md.render("---\ntitle: Hello\n---\n# Hello", env)).toBe("<h1>Hello</h1>\n");
    expect(env.frontmatter).toStrictEqual({ title: "Hello" });
    expect(md.core.ruler.__rules__.filter(({ name }) => name === "md_frontmatter")).toHaveLength(1);
  });
});
