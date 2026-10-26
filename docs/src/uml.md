---
title: "@mdit/plugin-uml"
shortTitle: "plugin-uml"
icon: scissors
---

Plugin to support splitting contents from context.

<!-- more -->

## Usage

```ts
import { uml } from "@mdit/plugin-uml";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(uml, {
  name: "demo",
  open: "demostart",
  close: "demoend",
  renderer: (tokens, index) => {
    // render content here
  },
});

mdIt.render(`\
@demostart
Content
Another content
@demoend
`);
```

This plugin will extract content between `@openmarker` and `@closemarker` into a single token, then render it with `renderer` function.

::: tip

The plugin is different from container plugin as contents inside container will be parsed as markdown, but contents inside uml will be parsed as plain text and transform in to a single token.

:::

::: tip Escaping

- You can use `\` to escape `@`, so the following won't be parsed:

  ```md
  \@demostart

  \@demoend
  ```

:::

::: warning Security

The `title` attribute is always escaped. Following markdown-it's `html` option semantics, the default renderer only escapes the extracted content when `html: false` (the default), so author-provided HTML inside a UML block is rendered as plain text. With `html: true`, the content is kept as raw HTML: author HTML is trusted in that mode, so sanitize the rendered output before displaying it (markdown-it does not sanitize it for you). Pass your own `renderer` if you need full control.

:::

## Options

All four options are required by the TypeScript types.

::: fields
@`name` type=string required

UML name. Defaults to `"uml"` at runtime.

@`open` type=string required

Opening marker. Defaults to `"start"` at runtime.

@`close` type=string required

Closing marker. Defaults to `"end"` at runtime.

@`renderer` type=RendererRule required

<!-- @include: ./render-rule.snippet.md -->

Render function. Defaults to the built-in renderer at runtime, which wraps the content in a `<div>` whose class is the UML name and whose `title` is the escaped info string.

:::
