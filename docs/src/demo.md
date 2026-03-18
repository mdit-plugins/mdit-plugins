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

### name

- Type: `string`
- Default: `"demo"`
- Details: Container name.

### showCodeFirst

- Type: `boolean`
- Default: `false`
- Details: Whether code is displayed before result.

### openRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Opening tag render function.

### closeRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Closing tag render function.

### codeRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Code render function.

### contentOpenRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Content open tag render function.

### contentCloseRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Content close tag render function.

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
