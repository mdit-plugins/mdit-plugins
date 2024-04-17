---
title: "@mdit/plugin-demo"
icon: creative
---

Display snippet render result and code at the same time.

<!-- more -->

## Usage

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { demo } from "@mdit/plugin-demo";

const mdIt = MarkdownIt().use(demo, {
  // your options
});

mdIt.render(`
::: demo

# Heading 1

Text

:::
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { demo } = require("@mdit/plugin-demo");

const mdIt = MarkdownIt().use(demo, {
  // your options
});

mdIt.render(`
::: demo

# Heading 1

Text

:::
`);
```

::::

## Syntax

With this plugin, you can quickly display a Markdown snippet and its corresponding source code. You can customize the rendering output, by default it will render a `<details>` block

The syntax is the same as [container](./container.md), except that the corresponding `name` is `demo`.

## 选项

```ts
interface MarkdownItDemoOptions {
  /**
   * Container name
   *
   * @default "demo"
   */
  name?: string;

  /**
   * Whether code is displayed before result
   *
   * @default true
   */
  beforeContent?: boolean;

  /**
   * Opening tag render function
   */
  openRender?: RenderRule;

  /**
   * Closing tag render function
   */
  closeRender?: RenderRule;

  /**
   * Code render function
   */
  codeRender?: RenderRule;
}
```

## Demo

::: md-demo

## Heading 1

Text

:::

```md
::: md-demo

## Heading 1

Text

:::
```
