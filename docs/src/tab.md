---
title: "@mdit/plugin-tab"
icon: tab
---

Plugin for creating block-level custom tabs.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { tab } from "@mdit/plugin-tab";

const mdIt = MarkdownIt().use(tab, {
  // your options, name is required
  name: "tabs",
});

mdIt.render("content");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { tab } = require("@mdit/plugin-tab");

const mdIt = MarkdownIt().use(tab, {
  // your options, name is required
  name: "tabs",
});

mdIt.render("content");
```

:::

With this plugin, you can create tabs container with `::: name` and `:::`, with `name` is the value you set as name.

In this container, you can use `@tab` marker to mark and separate tab contents.

`@tab` marker can be followed by a text, which will be used as tab title, and you can use `@tab:active` to mark the tab with default active state.

Any contents after a `@tab` marker and before container closing marker or new `@tab` marker will be considered as tab content. And contents before first `@tab` marker will be dropped.

To support global tab switching state, the plugin allows you to add an id suffix in `tabs` container, which will be used as tab id, and Also allows you to add an id suffix in `@tab` marker, which will be used as tab value. So it's possible for you to make all tabs with same id share same switch event.

By default the plugin renders related tabs dom for you, if you want to customize the rendering, you can pass `tabsOpenRenderer`, `tabsCloseRenderer`, `tabOpenRenderer` and `tabCloseRenderer` to the plugin options.

`tabsOpenRenderer` and `tabOpenRenderer` receives extra information as first args, see [Options](#options) for more details.

The plugin doesn't provide any styles, and will not register any events, so that you should add styles and events by yourself.

::: tip Nesting and escaping

- Nesting is **not** supported because `@tab` does not contain any information about what tab container it's marking.

- If you need to use `@tab` at the beginning of the line, you can use `\` to escape it to `\@tab`

- If your tab title contain `#`, you can escape it with `\`:

  ```md
  @tab c\#
  ```

:::

## Options

```ts
interface MarkdownItTabData {
  /**
   * Title of tab
   */
  title: string;

  /**
   * Tab index
   */
  index: number;

  /**
   * Identifier of tab
   */
  id?: string;

  /**
   * Whether the tab is active
   */
  isActive?: boolean;
}

interface MarkdownItTabInfo {
  /**
   * Which tab is active
   *
   * @description -1 means no tab is active
   */
  active: number;

  /**
   * Data of tabs
   */
  data: MarkdownItTabData[];
}

interface MarkdownItTabOptions {
  /**
   * The name of the tab container.
   */
  name: string;

  /**
   * Tabs open renderer
   */
  tabsOpenRenderer?: (
    info: MarkdownItTabInfo,
    tokens: Token[],
    index: number,
    options: Options,
    env: unknown,
    self: Renderer,
  ) => string;

  /**
   * Tabs close renderer
   */
  tabsCloseRenderer?: (
    tokens: Token[],
    index: number,
    options: Options,
    env: unknown,
    self: Renderer,
  ) => string;

  /**
   * tab open renderer
   */
  tabOpenRenderer?: (
    data: MarkdownItTabData,
    tokens: Token[],
    index: number,
    options: Options,
    env: unknown,
    self: Renderer,
  ) => string;

  /**
   * tab close renderer
   */
  tabCloseRenderer?: (
    tokens: Token[],
    index: number,
    options: Options,
    env: unknown,
    self: Renderer,
  ) => string;
}
```

## Demo

A tab of fruit:

::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::

```md
::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::
```

Another tab of fruit:

::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

```md
::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::
```

A tab of fruit without id:

::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

```md
::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::
```
