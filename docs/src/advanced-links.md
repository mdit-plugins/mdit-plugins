---
title: "@mdit/plugin-advanced-links"
icon: paperclip
---

Register custom `@[name ...props](link)` syntax with your own renderer.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { advancedLinks } from "@mdit/plugin-advanced-links";

const md = new MarkdownIt()
  .use(advancedLinks, {
    name: "video",
    renderer: (link, props) =>
      `<video src="${link}" controls${props.autoplay ? " autoplay" : ""}></video>`,
  })
  .use(advancedLinks, {
    name: "badge",
    inline: true,
    renderer: (link, props) => `<span class="badge badge-${link}">${props.text || link}</span>`,
  });
```

@tab JS

```js
import MarkdownIt from "markdown-it";
import { advancedLinks } from "@mdit/plugin-advanced-links";

const md = new MarkdownIt()
  .use(advancedLinks, {
    name: "video",
    renderer: (link, props) =>
      `<video src="${link}" controls${props.autoplay ? " autoplay" : ""}></video>`,
  })
  .use(advancedLinks, {
    name: "badge",
    inline: true,
    renderer: (link, props) => `<span class="badge badge-${link}">${props.text || link}</span>`,
  });
```

:::

The plugin can be used as many times as you need, each call registers one `name`.

## Syntax

```markdown
@[name ...props](link)
```

- `name` is the registered identifier, it must be followed by a whitespace or `]`
- `props` are optional, and can be written as `key`, `key=value`, `key="value"` or `key='value'`
- `link` is the link destination

Props are parsed into an object:

- A prop without a value is `true`, e.g. `@[video autoplay](a.mp4)` gives `{ autoplay: true }`
- A prop with a value keeps the value as a string, e.g. `@[video title=Hello](a.mp4)` gives `{ title: "Hello" }`
- A repeated key keeps the last value, e.g. `@[video a=1 a=2](a.mp4)` gives `{ a: "2" }`

### Escaping

Most props are plain values. When a value contains a whitespace, `]` or `=`, wrap it in quotes:

```markdown
@[video title="Hello world" caption="1]2"](a.mp4)
```

A key cannot be quoted, and `]` ends the props, so escape them with `\`:

```markdown
@[video a\ b=1](a.mp4)
```

`\` also escapes `]`, `=` and itself (`\\`), in keys as well as values. The full rules are folded below.

::: details Syntax details

A prop is `key`, `key=value`, `key="value"` or `key='value'`.

Tokenization:

- Whitespaces separate props, and the props end at the `]` that closes the syntax.
- A key ends with the first whitespace or `=`, and it must not be empty, so `@[video =1](a.mp4)` is unmatched.
- After `=`, a `"` or `'` opens a quoted value, which ends with the matching quote only, so it may contain whitespaces, `]` and `=`.
- Otherwise the value is unquoted, and ends with the next whitespace or `]`. It may contain `=`, so `@[video a=b=c](a.mp4)` gives `{ a: "b=c" }`.

Escapes:

- `\` escapes the next character in keys and values, and the escaped character is taken literally.
- A `]` outside a quoted value must be escaped: `@[video title=1\]2](a.mp4)` gives `{ title: "1]2" }`.
- A whitespace and `=` can be part of a key or an unquoted value when escaped: `@[video a\ b=c\ d](a.mp4)` gives `{ "a b": "c d" }`, and `@[video a\=b](a.mp4)` gives `{ "a=b": true }`.
- `\` itself is written as `\\`, and a `\` at the end of the props or right before a line break is malformed.

Quotes:

- A quote opens a quoted value right after `=` only. Elsewhere it is a plain character, so `@[video a=it's](a.mp4)` gives `{ a: "it's" }`.
- Because of that, `@[video a= 'x'](a.mp4)` gives `{ a: "", "'x'": true }`.
- The same escapes apply inside a quoted value, so `@[video a="x\"y"](a.mp4)` gives `{ a: 'x"y' }`.

Prop names:

- Names are kept as-is apart from `\` escapes: they are not lowercased, quote-stripped or entity-decoded, so `@[video 'a' b](x)` gives `{ "'a'": true, b: true }`.
- `__proto__` is ignored, since assigning it does not create an own property.

Link:

- The link is not normalized nor validated, unlike a normal Markdown link: MarkdownIt resolves its backslash escapes and HTML entities, but the result is neither percent-encoded nor checked.

Limits:

- Props cannot span lines.
- Props are not entity-decoded, so `@[video a=&amp;](a.mp4)` gives `{ a: "&amp;" }`.
- Malformed props, such as an empty key, a dangling `\` or an unterminated quoted value, make the whole syntax unmatched, then the text is handled by other rules, e.g. `@[test a=1 = b=2](x)` is rendered as a normal link.

:::

The name must not be empty or contain whitespace, `[`, `]`, `(`, `)`, `"` or `'`, otherwise the plugin throws an error. Names are matched exactly, and an unregistered name is left to other rules, so `@[unknown](x)` is rendered as a normal link.

The link is passed to the renderer without normalization or validation, so escape and validate it yourself when generating HTML. A title in the destination (`@[video](a.mp4 "title")`) is not supported, use a prop instead.

::: tip Syntax as plain text

To keep the syntax as plain text, escape each part of it, or use a code span:

```markdown
\@\[video\](a.mp4)
```

:::

### Block and inline

By default the syntax is only valid as a block, and it must occupy the whole line.

Set `inline: true` to also allow it in a paragraph. When such syntax occupies the whole line, it is still rendered as a block, so no `<p>` is generated.

A block syntax cannot interrupt a setext heading underline, so a line starting with `===` or `---` turns the previous block into a heading instead.

## Options

### name

- Type: `string`
- Required: Yes
- Details: Name used by the syntax. It must not be empty or contain whitespace, `[`, `]`, `(`, `)`, `"` or `'`. Registering the same name again replaces the previous config.

### inline

- Type: `boolean`
- Details: Whether the syntax is also available inline.

### renderer

- Type: `(link: string, props: AdvancedLinkProps, env: unknown) => string`

```ts
type AdvancedLinkProps = Record<string, string | true>;

type AdvancedLinkRenderer = (link: string, props: AdvancedLinkProps, env: unknown) => string;
```

- Required: Yes
- Details: Renderer to generate HTML. `env` is the MarkdownIt environment. The link is passed without normalization or validation.

## Examples

With the usage example above:

**Input:**

```markdown
@[video](a.mp4)
```

**Output:**

```html
<video src="a.mp4" controls></video>
```

**Input:**

```markdown
@[video autoplay](a.mp4)
```

**Output:**

```html
<video src="a.mp4" controls autoplay></video>
```

**Input:**

```markdown
Go to @[badge primary text="home page"](home) now.
```

**Output:**

```html
<p>Go to <span class="badge badge-home">home page</span> now.</p>
```
