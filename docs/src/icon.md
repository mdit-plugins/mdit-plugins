---
title: "@mdit/plugin-icon"
shortTitle: "plugin-icon"
icon: icons
---

Plugins with icon support.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { icon } from "@mdit/plugin-icon";

const mdIt = new MarkdownIt().use(icon);

mdIt.render("Use ::face-smile:: for a plain icon.");
```

## Syntax

Use `::icon classes::` to insert custom icons. By default the plugin renders a `<i>` tag with the raw content as its class. The bundled renderers (`defaultRender`, `iconifyRender`, `fontawesomeRender` and `iconfontRender`), used via the `render` option, additionally treat any part starting with `=` as a size definition and any part starting with `/` as a color definition:

```md
<!-- with `render: defaultRender`: <i icon="icon1" style="font-size:16px;color:red"></i> -->

::icon1 =16 /red::
```

If you are not satisfied with the default render, you can use `render` option to customize icon rendering:

```js
import MarkdownIt from "markdown-it";
import { fontawesomeRender, icon, iconfontRender, iconifyRender } from "@mdit/plugin-icon";

const mdIt = new MarkdownIt().use(icon, {
  // only one render can be set, pick the one you need

  // support for iconify
  render: iconifyRender,

  // support for fontawesome
  // render: fontawesomeRender,

  // support for iconfont
  // render: iconfontRender,

  // custom render
  // render: (rawIcon) => `<span class="${rawIcon}"></span>`,
});
```

For the build-in helper and render function usage, see source code and related unit tests for more details:

- [src/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/src/render.ts)
- [\_\_tests\_\_/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/__tests__/render.ts)
- [src/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/src/utils.ts)
- [\_\_tests\_\_/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/__tests__/utils.ts)

::: tip Icon vs. emoji

Both `@mdit/plugin-icon` and [@mdit/plugin-emoji](./emoji.md) turn short text into icons, but they solve different problems.

- **Icon set**: `@mdit/plugin-emoji` only converts a fixed set of known emoji codes (e.g. `:smile:`) into icons based on its `definitions` option. `@mdit/plugin-icon` accepts any custom icon class, so it works with any font icon library such as Font Awesome, Material Icons or Iconify, as well as your own CSS classes.
- **Syntax**: `@mdit/plugin-emoji` uses `:emoji:` and can additionally register shortcuts for plain text. `@mdit/plugin-icon` uses `::icon::` and never touches plain text.
- **Rendering**: `@mdit/plugin-emoji` outputs the HTML you provide through `definitions`. `@mdit/plugin-icon` renders a default `<i>` tag and lets you replace it with one of the bundled renderers or your own `render` function.

In short, pick `@mdit/plugin-emoji` when you want to map emoji codes to images or icons, and pick `@mdit/plugin-icon` when you want to write icon classes directly in Markdown.

:::

## Options

::: fields
@`render` type=`(content: string, env: MarkdownItEnv) => string`

Render function that turns the icon content into HTML.

By default the plugin outputs `<i class="{content}"></i>`, using the raw content as the class name.

The package exports the following bundled renderers, which additionally read `size`, `color` and attributes from the content:

- `defaultRender`: outputs `<i icon="{content}">`.
- `iconifyRender`: outputs `<iconify-icon icon="{content}">` for [Iconify](https://iconify.design/docs/iconify-icon/).
- `fontawesomeRender`: outputs `<i class="{classes}">` for [Font Awesome](https://fontawesome.com/), completing short aliases and adding `fa-solid` when no family is given.
- `iconfontRender`: outputs `<span class="iconfont icon-{content}">` for [iconfont](https://www.iconfont.cn/).

Only one renderer can be set at a time. Set it to a custom function to fully control the output, or leave it unset to keep the default `<i class="{content}"></i>` output.

:::

## Demo

::: preview Demo

Use ::face-smile:: for a plain icon, and the bundled renderers also read the size and color from the content: ::face-smile =32 /orange::

:::
