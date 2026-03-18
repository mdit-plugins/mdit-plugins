---
title: "@mdit/plugin-tab"
icon: table-columns
---

用于创建块级自定义选项卡的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { tab } from "@mdit/plugin-tab";

const mdIt = MarkdownIt().use(tab, {
  // 你的选项，name 是必填的
  name: "tabs",
});

mdIt.render("content");
```

使用此插件，你可以使用 `::: name` 和 `:::` 来创建选项卡容器，其中 `name` 是你设置为名称的值。

在这个容器中，你可以使用 `@tab` 标记来标记和分隔选项卡内容。

`@tab` 标记后面可以跟一个文本，该文本将用作选项卡标题，你可以使用 `@tab:active` 将选项卡标记为默认活动状态。

`@tab` 标记之后和容器关闭标记或新的 `@tab` 标记之前的任何内容都将被视为选项卡内容。 并且第一个 `@tab` 标记之前的内容将被删除。

为了支持全局标签切换状态，该插件允许你在 `tabs` 容器中添加一个 id 后缀，它将用作标签 id，并且还允许你在 `@tab` 标记中添加一个 id 后缀，将被使用作为选项卡值。 因此，你可以让所有具有相同 ID 的选项卡共享相同的切换事件。

默认情况下，插件会为你呈现相关的标签 dom，如果你想自定义呈现，可以将 `openRender`、`closeRender`、`tabOpenRender` 和 `tabCloseRender` 传递给插件选项。

`openRender` 和 `tabOpenRender` 接收额外信息作为第一个参数，有关更多详细信息，请参阅 [选项](#选项)。

该插件不提供任何样式，也不会注册任何事件，需要你自行添加样式和事件。

::: tip 嵌套和转义

- 嵌套可以通过在嵌套的选项卡容器中添加 2 个缩进来支持：

<!-- prettier-ignore-start -->

  ```md
  :::: tabs
  @tab 文本 1

  文本1

  @tab 文本 2
    ::: tabs
    @tab 子文本 1
    **加粗**文本 1。
    @tab:active 子文本 2
    **加粗**文本 2。
    :::
  @tab:active 文本 3
  **加粗**文本 3。
  ::::
  ```

<!-- prettier-ignore-end -->

- 如果你需要在行首使用 `@tab`，你可以使用 `\` 将其转义为 `\@tab`

- 如果你的选项卡标题包含 `#`，你可以使用 `\` 将其转义：

  ```md
  @tab c\#
  ```

:::

## 选项

### name

- 类型：`string`
- 必填：是
- 详情：选项卡容器的名称。

### openRender

- 类型：`TabsOpenRender`

```ts
interface MarkdownItTabData {
  /**
   * 选项卡标题
   */
  title: string;

  /**
   * 选项卡索引
   */
  index: number;

  /**
   * 选项卡标识符
   */
  id?: string;

  /**
   * 选项卡是否处于激活状态
   */
  isActive?: boolean;
}

interface MarkdownItTabInfo {
  /**
   * 当前激活的选项卡
   *
   * @description -1 表示没有选项卡处于激活状态
   */
  active: number;

  /**
   * 选项卡数据
   */
  data: MarkdownItTabData[];
}

/**
 * 选项卡容器打开渲染器
 */
type TabsOpenRender = (
  info: MarkdownItTabInfo,
  tokens: Token[],
  index: number,
  options: Options,
  env: any,
  self: Renderer,
) => string;
```

- 详情：选项卡容器打开渲染函数。

### closeRender

- 类型：`RenderRule`

<!-- @include: ../render-rule.snippet.md -->

- 详情：选项卡容器结束渲染函数。

### tabOpenRender

- 类型：`TabOpenRender`

```ts
interface MarkdownItTabData {
  /**
   * 选项卡标题
   */
  title: string;

  /**
   * 选项卡索引
   */
  index: number;

  /**
   * 选项卡标识符
   */
  id?: string;

  /**
   * 选项卡是否处于激活状态
   */
  isActive?: boolean;
}

/**
 * 选项卡打开渲染器
 */
type TabOpenRender = (
  info: MarkdownItTabData,
  tokens: Token[],
  index: number,
  options: Options,
  env: any,
  self: Renderer,
) => string;
```

- 详情：选项卡开始渲染函数。

### tabCloseRender

- 类型：`RenderRule`

<!-- @include: ../render-rule.snippet.md -->

- 详情：选项卡结束渲染函数。

## 示例

:::: preview 一个水果选项卡列表

::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::

::::

:::: preview 另一个水果选项卡列表

::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

::::

:::: preview 一个没有绑定 id 的水果选项卡列表

::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::

::::
