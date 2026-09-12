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
- Prop names are kept as-is, and quotes only apply to values, so `@[video 'a' b](x)` gives `{ "'a'": true, b: true }`
- `__proto__` is ignored, since assigning it does not create an own property
- `\` escapes the next character inside a quoted value

Malformed props make the whole syntax unmatched, then the text is handled by other rules, e.g. `@[test a=1 = b=2](x)` is rendered as a normal link.

The name must not be empty or contain whitespace, `[`, `]`, `(`, `)`, `"` or `'`, otherwise the plugin throws an error. Names are matched exactly, and an unregistered name is left to other rules, so `@[unknown](x)` is rendered as a normal link.

The link is passed to the renderer as-is: it is neither normalized nor validated, unlike a normal Markdown link. Escape and validate it yourself when generating HTML.

A title in the destination (`@[video](a.mp4 "title")`) is not supported, use a prop instead.

::: tip Escaping

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
- Details: Renderer to generate HTML. `env` is the MarkdownIt environment. The link is passed as-is, without normalization or validation.

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
