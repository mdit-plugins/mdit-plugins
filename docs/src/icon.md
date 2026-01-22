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

const mdIt = MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
```

## Syntax

Use `::icon classes::` to insert custom icons. By default the plugin will render a `<i>` tag with the given icon class. Any classes started with a `=` will be treated as a size definition, and `/` will be treated as a color definition:

```md
<!-- <i class="icon1" style="font-size:16px;color:red" -->

::icon1 =16 /red::
```

If you are not satisfied with the default render, you can use `render` option to customize icon rendering:

```js
import MarkdownIt from "markdown-it";
import { fontAwesomeRender, icon, iconfontRender, iconifyRender } from "@mdit/plugin-icon";

const mdIt = MarkdownIt().use(icon, {
  // support for iconify
  render: iconifyRender,

  // support for fontawesome
  render: fontAwesomeRender,

  // support for iconfont
  render: iconfontRender,

  // custom render
  render: (rawIcon) => {
    return `<span class="${rawIcon}"></span>`;
  },
});
```

For the build-in helper and render function usage, see source code and related unit tests for more details:

- [src/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/src/render.ts)
- [\_\_tests\_\_/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/__tests__/render.ts)
- [src/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/src/utils.ts)
- [\_\_tests\_\_/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/__tests__/utils.ts)

::: tip Why not markdownit-plugin-emoji?

`markdownit-plugin-emoji` only supports converting known emoji codes to icons, while this plugin supports any custom icon classes.

This is useful when you are using it with font icon libraries like Font Awesome, Material Icons, etc.

:::

## Demo

::: preview Demo

iPhone is made by ::apple::.

:::
