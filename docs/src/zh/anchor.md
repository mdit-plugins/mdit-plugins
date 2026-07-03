---
title: "@mdit/plugin-anchor"
icon: link
---

为标题添加 `id` 属性，可附带永久链接的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { anchor } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt().use(anchor);

mdIt.render("# 标题");
```

使用自定义 slugify：

```ts
import MarkdownIt from "markdown-it";
import { anchor } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt().use(anchor, {
  slugify: (s) => encodeURIComponent(s.trim().toLowerCase().replace(/\s+/g, "-")),
});

mdIt.render("# 你好 世界");
```

## 语法

所有匹配 `level` 选项的标题将自动添加 `id` 和 `tabindex` 属性。

## 示例

::: preview 示例

### 你好世界

这是一段示例文本。

#### 子章节

另一段文本。

:::

## 选项

### level

- 类型：`number | number[]`
- 默认值：`1`
- 详情：要添加锚点的标题级别。数字表示「该级别及以上」，数组表示「精确匹配的级别」。

### slugify

- 类型：`(str: string) => string`
- 详情：自定义 slug 化函数，将标题文本转换为 URL 友好的 slug。

### slugifyWithState

- 类型：`(str: string, state: StateCore) => string`
- 详情：类似 `slugify`，但可访问 markdown-it 状态，例如使用 `state.env`。

### getTokensText

- 类型：`(tokens: Token[]) => string`
- 详情：自定义从标题 token 中提取文本内容的函数。默认包含 `text` 和 `code_inline` token。

### uniqueSlugStartIndex

- 类型：`number`
- 默认值：`1`
- 详情：重复 slug 编号的起始索引。设为 `2` 可得到 `title`、`title-2`、`title-3`。

### permalink

- 类型：`PermalinkGenerator`
- 详情：渲染永久链接的函数。见下方[永久链接](#永久链接)。使用提供的预设之一或自行编写。

### callback

- 类型：`(token: Token, info: AnchorInfo) => void`
- 详情：在渲染每个标题后调用，传入 `token` 和包含 `slug`、`title` 的 `info` 对象。

### tabIndex

- 类型：`string | number | false`
- 默认值：`"-1"`
- 详情：标题上 `tabindex` 属性的值。默认 `-1` 使标题可被聚焦但不可通过键盘导航到达——屏幕阅读器会在跳转时朗读标题内容。设为 `false` 可移除该属性。

::: tip 手动设置 ID

你可以通过 [@mdit/plugin-attrs](../attrs.md) 手动设置标题 ID。确保 attrs 在 anchor **之前**加载：

```ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";
import { anchor } from "@mdit/plugin-anchor";

const mdIt = MarkdownIt()
  .use(attrs, { allowed: ["id"] })
  .use(anchor);

mdIt.render("# 我的标题 {#custom-id}");
```

Anchor 插件会复用已有的 `id`。

:::

## 永久链接

插件提供了四种永久链接预设。根据无障碍需求选择合适的方案。

所有渲染器共享以下通用选项：

| 名称          | 描述                             | 默认值                   |
| ------------- | -------------------------------- | ------------------------ |
| `class`       | 永久链接锚点的 CSS 类。          | `header-anchor`          |
| `symbol`      | 永久链接锚点中的符号。           | `#`                      |
| `renderHref`  | 自定义永久链接 `href` 渲染函数。 | `(slug) => \`#${slug}\`` |
| `renderAttrs` | 自定义永久链接属性渲染函数。     | `() => ({})`             |

### headerLink

将整个标题内容包裹在永久链接锚点中。

简单且开箱即用的无障碍方案。缺点是无法在标题中包含链接。

```ts
import { headerLink } from "@mdit/plugin-anchor/permalink";
```

**输出：** `<h2 id="title"><a href="#title">标题</a></h2>`

| 名称              | 描述                                                     | 默认值  |
| ----------------- | -------------------------------------------------------- | ------- |
| `safariReaderFix` | 在链接内添加 `<span>` 使 Safari 阅读器视图正确显示标题。 | `false` |
|                   | 见[通用选项](#永久链接)。                                |         |

### linkInsideHeader

在标题内部插入永久链接锚点，位于文本之后或之前。

```ts
import { linkInsideHeader } from "@mdit/plugin-anchor/permalink";
```

**输出：** `<h2 id="title">标题 <a href="#title">#</a></h2>`

| 名称         | 描述                                                                  | 默认值  |
| ------------ | --------------------------------------------------------------------- | ------- |
| `space`      | 在标题文本和永久链接之间添加空格。可传入字符串自定义（如 `&nbsp;`）。 | `true`  |
| `placement`  | 永久链接的位置，`before` 或 `after`。                                 | `after` |
| `ariaHidden` | 是否添加 `aria-hidden="true"` 到永久链接。                            | `false` |
|              | 见[通用选项](#永久链接)。                                             |         |

::: warning 无障碍

如果使用 `#` 这样的符号，屏幕阅读器会将其作为每个标题的一部分朗读。
建议使用 `ariaHidden()` 或传入可访问的 HTML 作为 `symbol`。

:::

### ariaHidden

`linkInsideHeader` 的别名，默认 `ariaHidden: true`。

```ts
import { ariaHidden } from "@mdit/plugin-anchor/permalink";
```

**输出：** `<h2 id="title">标题 <a href="#title" aria-hidden="true">#</a></h2>`

### linkAfterHeader

在标题块**之后**放置永久链接锚点。提供最灵活的屏幕阅读器无障碍体验。

```ts
import { linkAfterHeader } from "@mdit/plugin-anchor/permalink";
```

**输出：** `<h2 id="title">标题</h2><a href="#title"><span class="sr-only">永久链接</span> <span aria-hidden="true">#</span></a>`

| 名称                  | 描述                                                                             | 默认值            |
| --------------------- | -------------------------------------------------------------------------------- | ----------------- |
| `style`               | 样式：`visually-hidden`、`aria-label`、`aria-describedby` 或 `aria-labelledby`。 | `visually-hidden` |
| `assistiveText`       | 接收标题返回辅助文本的函数。`visually-hidden` 和 `aria-label` 样式必须提供。     | `undefined`       |
| `visuallyHiddenClass` | 使元素视觉隐藏的 CSS 类。`visually-hidden` 样式必须提供。                        | `undefined`       |
| `space`               | 在辅助文本和永久链接符号之间添加空格。                                           | `true`            |
| `placement`           | 永久链接符号相对于辅助文本的位置（`before` / `after`）。                         | `after`           |
| `wrapper`             | 可选的 `[开始标签, 结束标签]` HTML 包装器，包裹标题与永久链接。                  | `null`            |
|                       | 见[通用选项](#永久链接)。                                                        |                   |

### 自定义永久链接

如果预设不满足需求，可以提供自己的渲染器：

```ts
function customPermalink(slug, opts, state, idx) {
  // 修改 state.tokens 中 idx 周围的 token 来构建永久链接
}

mdIt.use(anchor, { permalink: customPermalink });
```

其中 `state` 是 markdown-it 的 `StateCore` 实例，`idx` 是 `heading_open` token
的索引。`heading_open` 之后紧跟着一个包含标题文本的 `inline` token，最后是
`heading_close`。
