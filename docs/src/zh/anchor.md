---
title: "@mdit/plugin-anchor"
shortTitle: "plugin-anchor"
icon: anchor
---

为标题添加 `id` 属性，可附带永久链接的插件。

<!-- more -->

## 使用

```ts
import { anchor } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor);

mdIt.render("# 标题");
```

使用自定义 slugify：

```ts
import { anchor } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor, {
  slugify: (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff-]+/g, "-")
      .replace(/-+/g, "-"),
});

mdIt.render("# 你好 世界");
```

## 语法

所有匹配 `level` 选项的标题将自动添加 `id` 和 `tabindex` 属性。

## 共享 slug 注册表

已使用的 slug 存储在 `env.markdownItAnchor.slugs`（一个 `{ [slug]: true }` 映射）中。在此之后加载的插件可以通过 `state.env.markdownItAnchor.slugs` 读取同一个对象。

该映射位于 `env` 上，因此在接收同一对象的多次 `render()` 调用之间共享。当多个 Markdown 源组成单个 HTML 页面时，传入同一个 `env`。当它们各自构成独立页面时，为每个页面传入新的 `env`（或省略）。

你还可以预置保留的 ID：

```ts
import { anchor } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor);

const env = { markdownItAnchor: { slugs: { h1: true } } };

mdIt.render("# H1", env);
// <h1 id="h1-1" tabindex="-1">H1</h1>

// env.markdownItAnchor.slugs === { h1: true, "h1-1": true }
```

## 选项

:::: fields
@`level` type=`number | number[]` default=`1`

要添加锚点的标题级别。数字表示「该级别及更深的级别（例如 `2` 表示 h2–h6）」，数组表示「精确匹配的级别」。

@`slugify` type=`(str: string) => string`

自定义 slug 化函数，将标题文本转换为 URL 友好的 slug。

默认会转小写 ASCII 字母、保留非 ASCII 字符（如中文）、将空白与连字符折叠为单个连字符，并剥离其余 ASCII 标点。如果你想要严格百分号编码的 slug，可使用导出的 `legacySlugify`：

```ts
import { anchor, legacySlugify } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor, { slugify: legacySlugify });
```

@`slugifyWithState` type=`(str: string, state: StateCore) => string`

类似 `slugify`，但可访问 markdown-it 状态，例如使用 `state.env`。

@`getTokensText` type=`(tokens: Token[]) => string`

自定义从标题 token 中提取文本内容的函数。默认包含 `text` 和 `code_inline` token。

@`uniqueSlugStartIndex` type=number default=`1`

重复 slug 编号的起始索引。设为 `2` 可得到 `title`、`title-2`、`title-3`。

@`defaultPlaceHolder` type=string default=`"heading"`

当标题没有文本内容、生成的 slug 为空时（如纯图片标题）使用的占位 slug。

@`permalink` type=PermalinkGenerator

渲染永久链接的函数。见下方[永久链接](#永久链接)。使用提供的预设之一或自行编写。

@`callback` type=`(token: Token, info: AnchorInfo) => void`

在渲染每个标题后调用，传入 `token` 和包含 `slug`、`title` 的 `info` 对象。

@`tabIndex` type=`string | number | false` default=`"-1"`

标题上 `tabindex` 属性的值。默认 `-1` 使标题可被聚焦但不可通过键盘导航到达——屏幕阅读器会在跳转时朗读标题内容。设为 `false` 可移除该属性。

::: tip 手动设置 ID

你可以通过 [@mdit/plugin-attrs](./attrs.md) 手动设置标题 ID。确保 attrs 在 anchor **之前**加载：

```ts
import { anchor } from "@mdit/plugin-anchor";
import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(attrs, { allowed: ["id"] }).use(anchor);

mdIt.render("# 我的标题 {#custom-id}");
```

Anchor 插件会复用已有的 `id`。

:::

::::

## 示例

::: preview 示例

### 你好世界

这是一段示例文本。

#### 子章节

另一段文本。

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

简单且开箱即用的无障碍方案。若标题内已包含链接（markdown 链接，或在 `html` 开启时的原始 `<a>` 标签），则不会包裹，以避免产生非法的嵌套锚点。

```ts
import { headerLink } from "@mdit/plugin-anchor";
```

**输出：** `<h2 id="title" tabindex="-1"><a class="header-anchor" href="#title">标题</a></h2>`

| 名称              | 描述                                                     | 默认值  |
| ----------------- | -------------------------------------------------------- | ------- |
| `safariReaderFix` | 在链接内添加 `<span>` 使 Safari 阅读器视图正确显示标题。 | `false` |
|                   | 见[通用选项](#永久链接)。                                |         |

### linkInsideHeader

在标题内部插入永久链接锚点，位于文本之后或之前。

```ts
import { linkInsideHeader } from "@mdit/plugin-anchor";
```

**输出：** `<h2 id="title" tabindex="-1">标题 <a class="header-anchor" href="#title">#</a></h2>`

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
import { ariaHidden } from "@mdit/plugin-anchor";
```

**输出：** `<h2 id="title" tabindex="-1">标题 <a class="header-anchor" href="#title" aria-hidden="true">#</a></h2>`

### linkAfterHeader

在标题块**之后**放置永久链接锚点。提供最灵活的屏幕阅读器无障碍体验。

与其他预设不同，`linkAfterHeader` 没有默认选项 —— 使用默认的 `visually-hidden` 样式时至少需要传入 `assistiveText` 和 `visuallyHiddenClass`：

```ts
import { anchor, linkAfterHeader } from "@mdit/plugin-anchor";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(anchor, {
  permalink: linkAfterHeader({
    assistiveText: (title) => `永久链接：${title}`,
    visuallyHiddenClass: "sr-only",
  }),
});
```

**输出：** `<h2 id="title" tabindex="-1">标题</h2><a class="header-anchor" href="#title"><span class="sr-only">永久链接：标题</span> <span aria-hidden="true">#</span></a>`

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

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-anchor`](https://www.npmjs.com/package/markdown-it-anchor) `10.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 变体               | 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| ------------------ | -----: | -------: | -----------: | ---------: |
| default            |     22 |       16 |            0 |          6 |
| legacy-slugify     |     22 |       20 |            0 |          2 |
| link-inside-header |     22 |       20 |            0 |          2 |
| header-link        |     22 |       19 |            0 |          3 |

以下用例是已记录的差异：

- `default/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `default/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.
- `default/heading-punctuation` — Default slugify policy difference: the reference percent-encodes `,`, `!` and `?`, the current default strips them.
- `default/heading-cjk` — Default slugify policy difference: the reference percent-encodes CJK characters, the current default keeps them.
- `default/heading-only-punctuation` — The current default strips all punctuation and falls back to `heading`; the reference keeps `!!!` (percent-encoding leaves `!` untouched).
- `default/heading-html` — With `html: false` the angle brackets are text; the reference percent-encodes them and the current default strips them.
- `legacy-slugify/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `legacy-slugify/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.
- `link-inside-header/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `link-inside-header/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.
- `header-link/heading-with-link` — Our `headerLink` preset leaves this heading untouched; the reference wraps the existing link and emits nested anchors. The `default`, `legacy-slugify` and `link-inside-header` variants match.
- `header-link/heading-image-only` — No text tokens, so both slugify produce an empty slug. The reference keeps `id=""`; the current package falls back to `heading` via `defaultPlaceHolder`.
- `header-link/heading-empty` — Empty headings: the reference emits `id=""` and `id="-1"`; the current package emits the `heading` placeholder and `heading-1`.

### 基准性能

| 变体               | 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------------ | ------------- | -----------: | -----------: | ----: |
| default            | normal/small  |       17,248 |       17,044 | 1.01× |
| default            | normal/medium |        2,484 |        2,324 | 1.07× |
| default            | normal/large  |          620 |          497 | 1.25× |
| default            | heavy/small   |        8,319 |        7,655 | 1.09× |
| default            | heavy/medium  |        1,453 |          885 | 1.64× |
| default            | heavy/large   |          383 |           97 | 3.93× |
| legacy-slugify     | normal/small  |       17,307 |       17,214 | 1.01× |
| legacy-slugify     | normal/medium |        2,376 |        2,284 | 1.04× |
| legacy-slugify     | normal/large  |          629 |          494 | 1.27× |
| legacy-slugify     | heavy/small   |        8,224 |        7,521 | 1.09× |
| legacy-slugify     | heavy/medium  |        1,440 |          877 | 1.64× |
| legacy-slugify     | heavy/large   |          381 |           98 | 3.90× |
| link-inside-header | normal/small  |       15,135 |       15,005 | 1.01× |
| link-inside-header | normal/medium |        2,170 |        2,046 | 1.06× |
| link-inside-header | normal/large  |          553 |          445 | 1.24× |
| link-inside-header | heavy/small   |        5,719 |        5,283 | 1.08× |
| link-inside-header | heavy/medium  |          997 |          678 | 1.47× |
| link-inside-header | heavy/large   |          260 |           88 | 2.96× |
| header-link        | normal/small  |       15,863 |       15,505 | 1.02× |
| header-link        | normal/medium |        2,271 |        2,105 | 1.08× |
| header-link        | normal/large  |          575 |          456 | 1.26× |
| header-link        | heavy/small   |        6,523 |        5,879 | 1.11× |
| header-link        | heavy/medium  |        1,148 |          736 | 1.56× |
| header-link        | heavy/large   |          303 |           89 | 3.39× |

几何平均吞吐量比值：1.42×（共 24 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 变体               | 系列                   | 输入规模                  | 当前拟合指数 | 参考拟合指数 |
| ------------------ | ---------------------- | ------------------------- | -----------: | -----------: |
| default            | duplicate-headings     | 128 / 256 / 512 / 1024    |        ~1.01 |        ~1.90 |
| default            | heading-inline-content | 256 / 512 / 1024 / 2048   |        ~1.04 |        ~1.06 |
| default            | unique-headings        | 1024 / 2048 / 4096 / 8192 |        ~1.07 |        ~1.35 |
| legacy-slugify     | duplicate-headings     | 128 / 256 / 512 / 1024    |        ~1.00 |        ~1.90 |
| legacy-slugify     | heading-inline-content | 256 / 512 / 1024 / 2048   |        ~1.03 |        ~1.06 |
| legacy-slugify     | unique-headings        | 1024 / 2048 / 4096 / 8192 |        ~1.11 |        ~1.35 |
| link-inside-header | duplicate-headings     | 128 / 256 / 512 / 1024    |        ~1.00 |        ~1.81 |
| link-inside-header | heading-inline-content | 256 / 512 / 1024 / 2048   |        ~1.06 |        ~1.07 |
| link-inside-header | unique-headings        | 1024 / 2048 / 4096 / 8192 |        ~1.15 |        ~1.29 |
| header-link        | duplicate-headings     | 128 / 256 / 512 / 1024    |        ~1.01 |        ~1.83 |
| header-link        | heading-inline-content | 256 / 512 / 1024 / 2048   |        ~1.06 |        ~1.05 |
| header-link        | unique-headings        | 1024 / 2048 / 4096 / 8192 |        ~1.11 |        ~1.32 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                | 解压体积 | 入口 gzip |
| --------------------------------- | -------: | --------: |
| @mdit/plugin-anchor（当前）       |  80.5 kB |    2.2 kB |
| markdown-it-anchor@10.0.0（参考） | 138.7 kB |    2.2 kB |

### 说明

- The `default` variant uses the defaults of both packages. The current package intentionally ships a different default slugify than the reference legacy percent-encoding slugify: it lowercases ASCII, keeps non-ASCII characters (e.g. CJK), folds whitespace and dashes into a single dash and strips other ASCII punctuation. Headings with punctuation, CJK or raw HTML text therefore produce different ids; those cases carry a `note`. Generated ids are compared byte for byte and are never normalized.
- The `legacy-slugify` variant configures the current package with its exported `legacySlugify`, which is byte-identical to the reference default slugify, so every heading id matches.
- `link-inside-header` compares the `linkInsideHeader` permalink presets with the same `class` and `symbol` options and a matching slugify. Markup is identical except for the empty-slug placeholder difference.
- `header-link` compares the `headerLink` presets. The current preset leaves headings that already contain a link untouched, because wrapping them would emit invalid nested `<a>` elements, while the reference wraps the existing link; that case carries a `note`.
- Empty slugs are behavior, not a formatting difference: for headings without text (image-only or empty headings) the reference emits `id=""`, while the current package falls back to its `defaultPlaceHolder` option (`heading`). These cases carry a `note`.
- Manual heading ids (e.g. set by plugin-attrs) are not compared: both packages reuse a preset id and both throw on duplicate explicit ids (reference default `failOnNonUnique: true`; the current package has no option to disable the failure).
- Scaling: `duplicate-headings` is quadratic in the reference, because its unique-slug loop rescans the used-slug map for every duplicate; the current package resumes from the last used candidate and stays linear. `unique-headings` exposes the leftover `state.tokens.indexOf(token)` call the reference executes for every heading after the permalink step (the O(n²) loop from markdown-it-anchor#80); the current package only rescans when a permalink actually moves the heading token. `heading-inline-content` is the linear baseline.
- Benchmarks render fixed corpora (`normal` = sparse headings, `heavy` = heading-dense) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.
- Only attribute order is normalized (the harness default); no other normalization is applied.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
