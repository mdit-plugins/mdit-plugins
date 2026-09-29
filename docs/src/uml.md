---
title: "@mdit/plugin-uml"
shortTitle: "plugin-uml"
icon: scissors
---

Plugin to support splitting contents from context.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { uml } from "@mdit/plugin-uml";

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

## Options

::: fields
@`name` type=string required

UML name.

@`open` type=string required

Opening marker.

@`close` type=string required

Closing marker.

@`renderer` type=RendererRule required

<!-- @include: ./render-rule.snippet.md -->

Render function.

:::
