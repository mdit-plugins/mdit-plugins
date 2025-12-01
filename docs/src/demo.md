---
title: "@mdit/plugin-demo"
icon: lightbulb
---

Display snippet render result and code at the same time.

<!-- more -->

## Usage

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

## Syntax

With this plugin, you can quickly display a Markdown snippet and its corresponding source code. You can customize the rendering output, by default it will render a `<details>` block

The syntax is the same as [container](./container.md), except that the corresponding `name` is `demo`.

## Options

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
   * @default false
   */
  showCodeFirst?: boolean;

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

  /**
   * Content open tag render function
   */
  contentOpenRender?: RenderRule;

  /**
   * Content close tag render function
   */
  contentCloseRender?: RenderRule;
}
```

## Demo

::: preview

## Heading 1

Text

:::

```md
::: preview

## Heading 1

Text

:::
```
