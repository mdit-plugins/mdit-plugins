---
title: "@mdit/plugin-demo"
shortTitle: "plugin-demo"
icon: lightbulb
---

Display snippet render result and code at the same time.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { demo } from "@mdit/plugin-demo";

const mdIt = new MarkdownIt().use(demo, {
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

::: fields
@`name` type=string default=`"demo"`

Container name.

@`showCodeFirst` type=boolean default=`false`

Whether code is displayed before result.

@`openRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Opening tag render function.

@`closeRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Closing tag render function.

@`codeRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Code render function.

@`contentOpenRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Content open tag render function.

@`contentCloseRenderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Content close tag render function.

:::

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
