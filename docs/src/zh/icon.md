---
title: "@mdit/plugin-icon"
shortTitle: "plugin-icon"
icon: icons
---

支持图标的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { icon } from "@mdit/plugin-icon";

const mdIt = new MarkdownIt().use(icon);

mdIt.render("使用 ::face-smile:: 插入一个普通图标。");
```

## 语法

使用 `::icon classes::` 插入自定义图标。默认情况下，插件会渲染一个以原始内容作为 class 的 `<i>` 标签。通过 `render` 选项使用内置渲染器（`defaultRender`、`iconifyRender`、`fontawesomeRender` 和 `iconfontRender`）时，任何以 `=` 开头的部分会被视为大小定义，以 `/` 开头的部分会被视为颜色定义：

```md
<!-- 使用 `render: defaultRender` 时：<i icon="icon1" style="font-size:16px;color:red"></i> -->

::icon1 =16 /red::
```

如果你对默认渲染不满意，可以使用 `render` 选项自定义图标渲染：

```js
import MarkdownIt from "markdown-it";
import { fontawesomeRender, icon, iconfontRender, iconifyRender } from "@mdit/plugin-icon";

const mdIt = new MarkdownIt().use(icon, {
  // 只能设置一个 render，选择你需要的那个

  // 支持 iconify
  render: iconifyRender,

  // 支持 fontawesome
  // render: fontawesomeRender,

  // 支持 iconfont
  // render: iconfontRender,

  // 自定义渲染
  // render: (rawIcon) => `<span class="${rawIcon}"></span>`,
});
```

有关内置帮助器和渲染函数的使用，请查看源代码和相关单元测试以获取更多详细信息：

- [src/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/src/render.ts)
- [\_\_tests\_\_/render.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/__tests__/render.ts)
- [src/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/src/utils.ts)
- [\_\_tests\_\_/utils.ts](https://github.com/mdit-plugins/mdit-plugins/tree/main/packages/plugin-icon/__tests__/utils.ts)

::: tip 图标插件与 emoji 插件

`@mdit/plugin-icon` 和 [@mdit/plugin-emoji](./emoji.md) 都能把简短文本转换为图标，但它们解决的问题不同。

- **图标集**：`@mdit/plugin-emoji` 仅按 `definitions` 选项把一组固定的已知表情代码（如 `:smile:`）转换为图标；`@mdit/plugin-icon` 接受任意自定义图标类，因此可用于 Font Awesome、Material Icons、Iconify 等任何字体图标库，以及你自己编写的 CSS 类。
- **语法**：`@mdit/plugin-emoji` 使用 `:emoji:` 语法，并可额外为纯文本注册快捷键；`@mdit/plugin-icon` 使用 `::icon::` 语法，不会影响纯文本。
- **渲染**：`@mdit/plugin-emoji` 输出你在 `definitions` 中提供的 HTML；`@mdit/plugin-icon` 默认渲染 `<i>` 标签，并允许你改用内置渲染器或自己的 `render` 函数。

简而言之，想把表情代码映射到图片或图标时选择 `@mdit/plugin-emoji`，想直接在 Markdown 中书写图标类时选择 `@mdit/plugin-icon`。

:::

## 选项

::: fields
@`render` type=`(content: string, env: MarkdownItEnv) => string`

将图标内容转换为 HTML 的渲染函数。

默认情况下，插件输出 `<i class="{content}"></i>`，即以原始内容作为 class 名。

包中导出了以下内置渲染器，它们会额外从内容中读取 `size`、`color` 和属性：

- `defaultRender`：输出 `<i icon="{content}">`。
- `iconifyRender`：为 [Iconify](https://iconify.design/docs/iconify-icon/) 输出 `<iconify-icon icon="{content}">`。
- `fontawesomeRender`：为 [Font Awesome](https://fontawesome.com/) 输出 `<i class="{classes}">`，会补全短别名，并在未指定字体族时追加 `fa-solid`。
- `iconfontRender`：为 [iconfont](https://www.iconfont.cn/) 输出 `<span class="iconfont icon-{content}">`。

同一时间只能设置一个渲染器。将其设为自定义函数即可完全控制输出；不设置时保持默认的 `<i class="{content}"></i>` 输出。

:::

## 演示

::: preview 演示

使用 ::face-smile:: 插入一个普通图标；内置渲染器还会从内容中读取大小与颜色：::face-smile =32 /orange::

:::
