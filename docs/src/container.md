---
title: "@mdit/plugin-container"
icon: box-open
---

Plugin for creating block-level custom containers.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { container } from "@mdit/plugin-container";

const mdIt = MarkdownIt().use(container, {
  // your options, name is required
  name: "warning",
});

mdIt.render(`
::: warning

Warning Text

:::
`);
```

## Syntax

With this plugin you can create block containers like:

```md
::: warning
_here be dragons_
:::
```

and specify how they should be rendered. If no renderer defined, `<div>` with container name class will be created:

```html
<div class="warning">
  <em>here be dragons</em>
</div>
```

Markup is the same as for fenced code blocks. However by default the plugin use another character as marker and content is rendered as markdown markup by plugin.

::::: tip Nesting and escaping

- Nestings can be done by increasing marker number of outer container:

  ```md
  :::: warning
  Warning contents...
  ::: details
  Some details
  :::
  ::::
  ```

  will be

  :::: warning
  Warning contents...
  ::: details
  Some details
  :::
  ::::

- Escaping can be done by adding `\` to escape the marker:

  ```md
  \::: warning

  :::
  ```

  will be

  \::: warning

  :::

:::::

## Options

```ts
interface MarkdownItContainerOptions {
  /**
   * Container name
   */
  name: string;

  /**
   * Container marker
   *
   * @default ":"
   */
  marker?: string;

  /**
   * Validate whether it should be regarded as this container type
   *
   * @param params the content after the marker
   * @param markup marker character
   * @returns is this container type or not
   *
   * @default params.trim().split(" ", 2)[0] === name
   */
  validate?: (params: string, markup: string) => boolean;

  /**
   * Opening tag render function
   */
  openRender?: RenderRule;

  /**
   * Closing tag render function
   */
  closeRender?: RenderRule;
}
```

## Demo

### Hint container

With the following code and some styles:

```js
md.use(container, {
  name: "hint",
  openRender: (tokens, index, _options) => {
    const info = tokens[index].info.trim().slice(4).trim();

    return `<div class="custom-container hint">\n<p class="custom-container-title">${
      info || "Hint"
    }</p>\n`;
  },
});
```

:::: preview You can write a hint like this:

::: hint Here is a Hint
:::

::: hint

Here is a **hint** for you!

- Hint 1
  - Hint 1.1
  - Hint 1.2
- Hint 2

:::

::::
