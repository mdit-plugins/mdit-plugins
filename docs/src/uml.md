---
title: "@mdit/plugin-uml"
icon: file-lines
---

Plugin to support splitting contents from context.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { uml } from "@mdit/plugin-uml";

const mdIt = MarkdownIt().use(uml, {
  name: 'demo',
  open: 'demostart',
  close: 'demoend',
  render: (tokens, index) => {
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

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { uml } = require("@mdit/plugin-uml");

const mdIt = MarkdownIt().use(uml, {
  name: 'demo',
  open: 'demostart',
  close: 'demoend',
  render: (tokens, index) => {
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

:::

This plugin will extract content between `@openmarker` and `@closemarker` into a single token, then render it with `render` function.

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

```ts
interface MarkdownItUMLOptions {
  /**
   * UML name
   */
  name: string;

  /**
   * Opening marker
   */
  open: string;

  /**
   *  Closing marker
   */
  close: string;

  /**
   * Render function
   */
  render: RenderRule;
}
```
