---
title: "@mdit/plugin-alert"
shortTitle: "plugin-alert"
icon: bell
---

支持 GFM 风格的警告语法。([参考](https://github.com/orgs/community/discussions/16925))

重复安装插件不会产生效果：首次安装的选项、解析规则与渲染器会继续生效。

<!-- more -->

## 使用

```ts
import { alert } from "@mdit/plugin-alert";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(alert);

mdIt.render(`
> [!warning]
> 警告文字
`);
```

<!-- markdownlint-disable MD028 -->

## 语法

通过此插件，你可以创建以 `[!警告名称]` 开头的块级警告，如：

```md
> [!warning]
> 警告文字
```

`警告名称` 不区分大小写，可以是以下字符串：

- `note`
- `tip`
- `important`
- `caution`
- `warning`

::: tip 嵌套和转义

- 默认情况下，GFM 风格的警告只能放置在根级，但是你可以使用 `deep: true` 来启用深层和嵌套支持：

  ```js
  md.use(alert, {
    deep: true,
  });
  ```

  ```md
  > [!warning]
  > 警告文字
  >
  > > [!warning]
  > > 嵌套警告文字

  - > [!warning]
    > 警告文字
  ```

  会被渲染为

  > [!warning]
  > 警告文字
  >
  > > [!warning]
  > > 嵌套警告文字
  - > [!warning]
    > 警告文字

- 通过添加 `\` 转义 `!` `[` 或 `]` 标记来实现转义：

  ```md
  > [\!warning]
  > 警告文字

  > \[!warning]
  > 警告文字
  ```

  会被渲染为

  > [\!warning]
  > 警告文字

  > \[!warning]
  > 警告文字

:::

## 选项

::: fields
@`alertNames` type=string[] default=`['tip', 'warning', 'caution', 'important', 'note']`

允许的警告名称。

@`deep` type=boolean default=`false`

是否允许深层的警告语法。

@`openRenderer` type=RendererRule

<!-- @include: ../render-rule.snippet.md -->

提示开始标签渲染函数。

@`closeRenderer` type=RendererRule

<!-- @include: ../render-rule.snippet.md -->

提示结束标签渲染函数。

@`titleRenderer` type=RendererRule

提示标题渲染函数。

:::

## 示例

::: preview 示例

> [!note]
> 注释文字

> [!important]
> 重要文字

> [!tip]
> 提示文字

> [!warning]
> 注意文字

> [!caution]
> 警告文字

:::

<!-- markdownlint-enable MD028 -->

::: tip 样式

在使用默认选项的情况下，你可以在你的项目中导入 `@mdit/plugin-alert/style` 以应用样式。

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-github-alerts`](https://www.npmjs.com/package/markdown-it-github-alerts) `1.0.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |        4 |           12 |          9 |

以下用例是已记录的差异：

- `uppercase` — The reference lowercases the alert name before capitalizing the default title, so `[!TIP]` renders `Tip`; the current package preserves the written casing and renders `TIP`.
- `list-body` — The reference keeps the marker line's empty paragraph and emits `<p></p>` before the list; the current package consumes the marker line and starts the body with the list.
- `nested-blockquote` — The reference keeps an empty `<p></p>` for the marker line and closes the hoisted alert `<div>` before the nested `</blockquote>`; the current package keeps the nested blockquote inside the alert with balanced tags.
- `nested-alert` — The reference transforms the outermost blockquote because its first inline token starts with the marker, leaving the inner blockquote inside the alert; the current package (`deep: true`) transforms the inner blockquote and keeps the outer quote.
- `empty-body` — The reference accepts a marker with no body and renders an empty alert; the current package requires at least one body line, so the marker stays a literal blockquote.
- `empty-quoted-body` — The reference keeps an empty paragraph for the empty quoted line before the body; the current package consumes the marker line and emits only the body paragraph.
- `custom-title` — The reference treats trailing text after the marker as a custom title; the current package rejects the marker when anything but spaces follows `]`, so it stays a literal blockquote.
- `escaped-bracket` — The reference's regex accepts an optional backslash before `[`, so `\[!note]` is still parsed as an alert; the current package treats the escaped bracket as literal text, as documented.
- `hr-before-marker` — The reference searches the first inline token of the blockquote and therefore finds the marker after an `<hr>`; the current package only accepts the marker on the first line of the blockquote.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       17,243 |       17,098 | 1.01× |
| normal/medium |        2,481 |        2,501 | 0.99× |
| normal/large  |          787 |          796 | 0.99× |
| heavy/small   |        8,224 |        8,179 | 1.01× |
| heavy/medium  |        1,646 |        1,658 | 0.99× |
| heavy/large   |          429 |          435 | 0.99× |

几何平均吞吐量比值：1.00×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列            | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| --------------- | ------------------------ | -----------: | -----------: |
| alert-rows      | 250 / 500 / 1000 / 2000  |        ~1.02 |        ~1.01 |
| long-alert-body | 500 / 1000 / 2000 / 4000 |        ~1.00 |        ~0.99 |
| nested-alerts   | 250 / 500 / 1000 / 2000  |        ~1.02 |        ~1.01 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                      | 解压体积 | 入口 gzip |
| --------------------------------------- | -------: | --------: |
| @mdit/plugin-alert（当前）              |  57.4 kB |    1.4 kB |
| markdown-it-github-alerts@1.0.1（参考） |  15.0 kB |    1.9 kB |

### 说明

- `deep: true` is enabled on the current package because the reference transforms every outermost blockquote after block parsing and therefore recognizes alerts at any nesting depth; the comparison covers nested blockquotes and alerts inside list items.
- The reference's default GitHub SVG icons are disabled with `icons: {}` because the current package has no icon option. This is a documented default-markup difference, not a normalization: with default options the reference title contains an inline `<svg>`, while the current title contains only text.
- `deep: true` and `icons: {}` were measured to be irrelevant for the throughput gap: enabling `deep` costs about 1.6% only on the heavy corpus (one nested alert per unit) and 0% on the normal corpus, and disabling the reference icons changes the reference throughput by about 0.2%. The benchmark difference therefore follows the implementations, not the option mapping.
- Whitespace between block-level tags is normalized because the reference renders its opening `<div>` and title `<p>` without newlines while the current package uses markdown-it's default block renderer; attribute order is normalized by the shared normalizer as well. Text content and code whitespace are preserved.
- The reference removes the marker from the first inline token and keeps the surrounding blockquote content. An alert whose first content line is empty therefore leaves an empty `<p></p>`, and a nested blockquote is hoisted into the alert. The current package consumes the marker line before parsing the body, so those structural differences remain visible in the `list-body`, `nested-blockquote`, `empty-quoted-body` and `nested-alert` cases.
- Parse-level differences are documented rather than normalized: the reference supports a custom title from trailing text (`> [!note] Title`), accepts a marker without any body, treats `\[!note]` as an alert, and finds a marker in the first inline token even after another block such as `<hr>`. The current package requires the marker line to contain only the marker, requires body content, and honors the escaped bracket. See the matching diff cases.
- Default title casing differs: the reference lowercases the marker before capitalizing it (`[!TIP]` → `Tip`), while the current package capitalizes the written name and preserves its casing (`[!TIP]` → `TIP`).
- Both sides use the same five case-insensitive alert names and the default `markdown-alert` class prefix. The reference's `classPrefix` / `titles` options and the current package's `openRenderer` / `closeRenderer` / `titleRenderer` hooks have no counterpart on the other side and are left at their defaults.
- Scaling: the reference scans a blockquote's token range once per outermost blockquote and the current package scans each alert body once, so `alert-rows`, `long-alert-body` and `nested-alerts` all grow linearly; no superlinear path was found.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
