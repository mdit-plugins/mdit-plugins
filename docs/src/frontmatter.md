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

`yaml` and `yml` use `js-yaml` with `CORE_SCHEMA` (YAML 1.2 core), `json` uses `JSON.parse`, and the `parsers` option adds custom languages. By default, timestamps and `yes`/`no` are strings and `1e3` is a number. Enabling `parseTimestamps` changes only timestamp scalars.

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

### Timestamps

By default YAML timestamps stay strings. Set `parseTimestamps: true` to parse unquoted timestamps as `Date` objects. Date-only values are anchored at 00:00:00 in `timezone`; if that local time is skipped by a daylight-saving transition, the first valid whole minute on that date is used.

```md
---
date: 2022-07-06
created: 2022-07-06 00:30:00
---
```

With `{ parseTimestamps: true, timezone: "Asia/Shanghai" }`, `date` becomes `2022-07-05T16:00:00.000Z` and `created` becomes `2022-07-05T16:30:00.000Z`. Explicit offsets such as `Z` and `+08:00` always take precedence.

An ambiguous repeated local time resolves to the earlier occurrence. Datetime values whose local time is skipped remain strings; a date skipped entirely also remains a string. An invalid IANA timezone throws a `TypeError`.

A `Date` represents an instant, not a calendar date. Format date-only values with the same timezone; calling `toISOString()` can show a different date.

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

@`parseTimestamps` type=boolean default=`false`

Whether to parse unquoted YAML timestamps as `Date` objects. Date-only values are anchored at 00:00:00 in `timezone`; if midnight is skipped, the first valid whole minute on that date is used. Quoted timestamps remain strings. When `yamlOptions.schema` is set, that schema takes precedence.

@`timezone` type=string default=`"UTC"`

IANA timezone used for timestamps without an explicit offset, including date-only values. `Z` and `+08:00` always take precedence. Empty values fall back to `UTC`; invalid names throw a `TypeError`. Only used when `parseTimestamps` is enabled and `yamlOptions.schema` is not set.

@`yamlOptions` type=LoadOptions

Options passed to `js-yaml`'s `load` function. `schema` defaults to `CORE_SCHEMA` (YAML 1.2 core). When `parseTimestamps` is enabled, it defaults to `CORE_SCHEMA` plus an implicit timestamp tag. Pass `YAML11_SCHEMA` or another schema to change how YAML is parsed.

@`parsers` type=`Record<string, FrontmatterParser>`

Custom parsers keyed by lowercased language, for example `toml` rather than `TOML`. A custom parser overrides the built-in `yaml`, `yml` and `json` parsers.

```ts
type FrontmatterParser = (source: string) => unknown;
```

A parser must return a plain object mapping. Returning `null` or `undefined` is treated as empty data, and other values throw an error.

@`renderExcerpt` type=boolean default=`true`

Whether to render the extracted excerpt to HTML. When `false`, the raw Markdown is stored in `env.excerpt`.
:::
