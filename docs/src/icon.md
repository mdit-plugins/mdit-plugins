---
title: "@mdit/plugin-icon"
icon: icons
---

Plugins with icon support.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { icon } from "@mdit/plugin-icon";

const mdIt = new MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
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

::: tip Why not markdownit-plugin-emoji?

`markdownit-plugin-emoji` only supports converting known emoji codes to icons, while this plugin supports any custom icon classes.

This is useful when you are using it with font icon libraries like Font Awesome, Material Icons, etc.

:::

## Demo

::: preview Demo

iPhone is made by ::apple::.

:::
