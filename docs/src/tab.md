---
title: "@mdit/plugin-tab"
icon: table-columns
---

Plugin for creating block-level custom tabs.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { tab } from "@mdit/plugin-tab";

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

By default the plugin renders related tabs dom for you, if you want to customize the rendering, you can pass `openRender`, `closeRender`, `tabOpenRender` and `tabCloseRender` to the plugin options.

`openRender` and `tabOpenRender` receives extra information as first args, see [Options](#options) for more details.

The plugin doesn't provide any styles, and will not register any events, so that you should add styles and events by yourself.

::: tip Nesting and escaping

- Nesting can be supported by adding 2 indents in your nested tab container:

<!-- prettier-ignore-start -->

  ```md
  :::: tabs
  @tab test1

  A text 1.

  @tab test2
    ::: tabs
    @tab sub-test1
    A **bold** text 1.
    @tab:active sub-test2
    A **bold** text 2.
    :::
  @tab:active test3
  A **bold** text 3.
  ::::
  ```

<!-- prettier-ignore-end -->

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
  openRender?: (
    info: MarkdownItTabInfo,
    tokens: Token[],
    index: number,
    options: Options,
    env: any,
    self: Renderer,
  ) => string;

  /**
   * Tabs close renderer
   */
  closeRender?: RenderRule;

  /**
   * tab open renderer
   */
  tabOpenRender?: (
    data: MarkdownItTabData,
    tokens: Token[],
    index: number,
    options: Options,
    env: any,
    self: Renderer,
  ) => string;

  /**
   * tab close renderer
   */
  tabCloseRender?: RenderRule;
}
```

## Demo

:::: preview A tab of fruit

::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::

::::

:::: preview Another tab of fruit

::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

::::

:::: preview A tab of fruit without id

::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

::::
