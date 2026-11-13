---
title: "@mdit/plugin-frontmatter"
shortTitle: "plugin-frontmatter"
icon: file-lines
---

Plugin to extract YAML frontmatter and an optional excerpt.

<!-- more -->

## Usage

```ts
import { frontmatter } from "@mdit/plugin-frontmatter";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(frontmatter);
const env = {};

md.render(
  `---
title: Hello
---
# Hello`,
  env,
);

env.content; // "# Hello"
env.frontmatter; // { title: "Hello" }
env.excerpt; // ""
```

Parsed data is merged into `env.frontmatter`, so the parsed values take precedence over existing ones. The Markdown content without the frontmatter block is stored in `env.content` and passed to the remaining rules.

## Syntax

The first block delimited by `---` is parsed as YAML and removed from the rendered content:

```md
---
title: Hello
tags:
  - frontmatter
---

# Hello
```

A language marker directly after the opening delimiter selects another parser:

```md
---json
{"title":"Hello"}
---
```

`yaml` and `yml` use `js-yaml` with `CORE_SCHEMA` (YAML 1.2 core), `json` uses `JSON.parse`, and the `parsers` option adds custom languages. Timestamps and `yes`/`no` remain strings, while `1e3` is parsed as a number.

A line starting with an extended delimiter such as `----` is a horizontal rule, not frontmatter.

### Excerpt

When `excerpt` is enabled, the content before `excerptSeparator` is extracted. The precedence is: a string `excerpt` option, then a non-empty `excerpt_separator` key in the frontmatter data, then the `excerptSeparator` option, then the opening delimiter. An empty option separator also falls back to the opening delimiter:

```md
---
title: Hello
---

# Hello

<!-- more -->

Body
```

With `{ excerpt: true, excerptSeparator: "<!-- more -->" }`, `env.excerpt` is rendered as `<h1>Hello</h1>\n`. Setting `excerptSeparator` alone also enables extraction, even when `excerpt` is `false`. Set `renderExcerpt: false` to keep the raw Markdown instead.

## Options

::: fields
@`delimiters` type=`string | [start: string, end: string]` default=`"---"`

The opening and closing delimiters. Pass one string to use the same delimiter for both, or a tuple for asymmetric delimiters.

```ts
delimiters: ["<!--", "-->"];
```

@`language` type=string default=`"yaml"`

The parser used when the opening delimiter has no language marker. A marker in the document takes precedence.

@`excerpt` type=`boolean | string | FrontmatterExcerptResolver` default=`false`

Controls excerpt extraction. `true` extracts the content before `excerptSeparator` (falling back to the opening delimiter), a string sets the delimiter directly and takes precedence over `excerpt_separator`, and a function may set `file.excerpt` itself.

```ts
type FrontmatterExcerptResolver = (file: FrontmatterFile) => void;

interface FrontmatterFile {
  data: Record<string, unknown>;
  content: string;
  excerpt: string;
  matter: string;
  language: string;
  isEmpty: boolean;
}
```

@`excerptSeparator` type=string

The excerpt delimiter. Precedence: a string `excerpt` option, then a non-empty string `excerpt_separator` in the frontmatter data, then this option, then the opening delimiter. An empty value falls back to the opening delimiter. Setting this option alone enables extraction, even when `excerpt` is `false`.

@`yamlOptions` type=LoadOptions

Options passed to `js-yaml`'s `load` function. `schema` defaults to `CORE_SCHEMA` (YAML 1.2 core). Pass `YAML11_SCHEMA` or another schema to change how YAML is parsed.

@`parsers` type=`Record<string, FrontmatterParser>`

Custom parsers keyed by lowercased language, for example `toml` rather than `TOML`. A custom parser overrides the built-in `yaml`, `yml` and `json` parsers.

```ts
type FrontmatterParser = (source: string) => unknown;
```

A parser must return a plain object mapping. Returning `null` or `undefined` is treated as empty data, and other values throw an error.

@`renderExcerpt` type=boolean default=`true`

Whether to render the extracted excerpt to HTML. When `false`, the raw Markdown is stored in `env.excerpt`.
:::
