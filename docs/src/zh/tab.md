---
title: "@mdit/plugin-tab"
icon: tab
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

使用此插件，您可以使用 `::: name` 和 `:::` 来创建选项卡容器，其中 `name` 是您设置为名称的值。

在这个容器中，您可以使用 `@tab` 标记来标记和分隔选项卡内容。

`@tab` 标记后面可以跟一个文本，该文本将用作选项卡标题，您可以使用 `@tab:active` 将选项卡标记为默认活动状态。

`@tab` 标记之后和容器关闭标记或新的 `@tab` 标记之前的任何内容都将被视为选项卡内容。 并且第一个 `@tab` 标记之前的内容将被删除。

为了支持全局标签切换状态，该插件允许您在 `tabs` 容器中添加一个 id 后缀，它将用作标签 id，并且还允许您在 `@tab` 标记中添加一个 id 后缀，将被使用作为选项卡值。 因此，您可以让所有具有相同 ID 的选项卡共享相同的切换事件。

默认情况下，插件会为您呈现相关的标签 dom，如果您想自定义呈现，可以将 `tabsOpenRenderer`、`tabsCloseRenderer`、`tabOpenRenderer` 和 `tabCloseRenderer` 传递给插件选项。

`tabsOpenRenderer` 和 `tabOpenRenderer` 接收额外信息作为第一个参数，有关更多详细信息，请参阅 [选项](#选项)。

该插件不提供任何样式，也不会注册任何事件，需要您自行添加样式和事件。

## 选项

```ts
interface MarkdownItTabData {
  /**
   * Title of tab
   *
   * Tab 标题
   */
  title: string;

  /**
   * Identifier of tab
   *
   * Tab 标识符
   */
  id?: string;

  /**
   * Whether the tab is active
   *
   * Tab 是否激活
   */
  isActive?: boolean;
}

interface MarkdownItTabInfo {
  /**
   * Which tab is active
   *
   * @description -1 means no tab is active
   *
   * 激活的 Tab
   *
   * @description -1 表示没有 Tab 激活
   */
  active: number;

  /**
   * Data of tabs
   *
   * Tab 数据
   */
  data: MarkdownItTabData[];
}

interface MarkdownItTabOptions {
  /**
   * The name of the tab container.
   *
   * Tab 容器的名称。
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
    self: Renderer
  ) => string;

  /**
   * Tabs close renderer
   */
  tabsCloseRenderer?: (
    tokens: Token[],
    index: number,
    options: Options,
    env: unknown,
    self: Renderer
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
    self: Renderer
  ) => string;

  /**
   * tab close renderer
   */
  tabCloseRenderer?: (
    tokens: Token[],
    index: number,
    options: Options,
    env: unknown,
    self: Renderer
  ) => string;
}
```

## 示例

一个水果选项卡列表:

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

另一个水果选项卡列表:

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

一个没有绑定 id 的水果选项卡列表:

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
