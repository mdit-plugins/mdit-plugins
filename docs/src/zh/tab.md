---
title: "@mdit/plugin-tab"
icon: table-columns
---

用于创建块级自定义选项卡的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { tab } from "@mdit/plugin-tab";

const mdIt = MarkdownIt().use(tab, {
  // 你的选项，name 是必填的
  name: "tabs",
});

mdIt.render("content");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { tab } = require("@mdit/plugin-tab");

const mdIt = MarkdownIt().use(tab, {
  // 你的选项，name 是必填的
  name: "tabs",
});

mdIt.render("content");
```

:::

使用此插件，你可以使用 `::: name` 和 `:::` 来创建选项卡容器，其中 `name` 是你设置为名称的值。

在这个容器中，你可以使用 `@tab` 标记来标记和分隔选项卡内容。

`@tab` 标记后面可以跟一个文本，该文本将用作选项卡标题，你可以使用 `@tab:active` 将选项卡标记为默认活动状态。

`@tab` 标记之后和容器关闭标记或新的 `@tab` 标记之前的任何内容都将被视为选项卡内容。 并且第一个 `@tab` 标记之前的内容将被删除。

为了支持全局标签切换状态，该插件允许你在 `tabs` 容器中添加一个 id 后缀，它将用作标签 id，并且还允许你在 `@tab` 标记中添加一个 id 后缀，将被使用作为选项卡值。 因此，你可以让所有具有相同 ID 的选项卡共享相同的切换事件。

默认情况下，插件会为你呈现相关的标签 dom，如果你想自定义呈现，可以将 `openRender`、`closeRender`、`tabOpenRender` 和 `tabCloseRender` 传递给插件选项。

`openRender` 和 `tabOpenRender` 接收额外信息作为第一个参数，有关更多详细信息，请参阅 [选项](#选项)。

该插件不提供任何样式，也不会注册任何事件，需要你自行添加样式和事件。

::: tip 嵌套和转义

- **不**支持嵌套，因为 `@tab` 不包含任何关于它标记的选项卡容器的信息。

- 如果你需要在行首使用 `@tab`，你可以使用 `\` 将其转义为 `\@tab`

- 如果你的选项卡标题包含 `#`，你可以使用 `\` 将其转义：

  ```md
  @tab c\#
  ```

:::

## 选项

```ts
interface MarkdownItTabData {
  /**
   * Tab 标题
   */
  title: string;

  /**
   * Tab 索引
   */
  index: number;

  /**
   * Tab 标识符
   */
  id?: string;

  /**
   * Tab 是否激活
   */
  isActive?: boolean;
}

interface MarkdownItTabInfo {
  /**
   * 激活的 Tab
   *
   * @description -1 表示没有 Tab 激活
   */
  active: number;

  /**
   * Tab 数据
   */
  data: MarkdownItTabData[];
}

interface MarkdownItTabOptions {
  /**
   * Tab 容器的名称。
   */
  name: string;

  /**
   * 开始渲染器
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
   * 结束渲染器
   */
  closeRender?: RenderRule;

  /**
   * 选项卡开始渲染器
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
   * 选项卡结束渲染器
   */
  tabCloseRender?: RenderRule;
}
```

## 示例

:::: md-demo 一个水果选项卡列表

::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::

::::

:::: md-demo 另一个水果选项卡列表

::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

::::

:::: md-demo 一个没有绑定 id 的水果选项卡列表

::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

::::
