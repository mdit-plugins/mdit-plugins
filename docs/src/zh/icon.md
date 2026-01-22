---
title: "@mdit/plugin-icon"
icon: icons
---

支持图标的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { icon } from "@mdit/plugin-icon";

const mdIt = MarkdownIt().use(icon);

mdIt.render("iPhone is made by ::apple::.");
```

## 语法

使用 `::icon classes::` 插入自定义图标。默认情况下，插件将使用给定的图标类渲染一个 `<i>` 标签。任何以 `=` 开头的类将被视为大小定义，`/` 将被视为颜色定义：

```md
<!-- <i class="icon1" style="font-size:16px;color:red" -->

::icon1 =16 /red::
```

如果你对默认渲染不满意，可以使用 `render` 选项自定义图标渲染：

```js
import MarkdownIt from "markdown-it";
import { fontAwesomeRender, icon, iconfontRender, iconifyRender } from "@mdit/plugin-icon";

const mdIt = MarkdownIt().use(icon, {
  // 支持 iconify
  render: iconifyRender,

  // 支持 fontawesome
  render: fontAwesomeRender,

  // 支持 iconfont
  render: iconfontRender,

  // 自定义渲染
  render: (rawIcon) => {
    return `<span class="${rawIcon}"></span>`;
  },
});
```

有关内置帮助器和渲染函数的使用，请查看源代码和相关单元测试以获取更多详细信息：

- [src/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/src/render.ts)
- [\_\_tests\_\_/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/__tests__/render.ts)
- [src/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/src/utils.ts)
- [\_\_tests\_\_/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/icon/__tests__/utils.ts)

::: tip 为什么不使用 markdownit-plugin-emoji？

`markdownit-plugin-emoji` 仅支持将已知的表情代码转换为图标，而此插件支持任何自定义图标类。

当你与字体图标库一起使用时，如 Font Awesome、Material Icons 等，这将非常有用。

:::

## 演示

::: preview 演示

iPhone 是由 ::apple:: 制造的。

:::
