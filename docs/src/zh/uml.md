---
title: "@mdit/plugin-uml"
shortTitle: "plugin-uml"
icon: scissors
---

支持从上下文中拆分内容的插件。

<!-- more -->

## 使用

```ts
import { uml } from "@mdit/plugin-uml";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(uml, {
  name: "demo",
  open: "demostart",
  close: "demoend",
  renderer: (tokens, index) => {
    // render content here
  },
});

mdIt.render(`\
@demostart
Content
Another content
@demoend
`);
```

该插件会将 `@openmarker` 和 `@closemarker` 之间的内容提取到单个 Token 中，然后使用 `renderer` 函数对其进行渲染。

::: tip

该插件与容器插件不同，容器内的内容将被解析为 markdown，而 uml 内的内容将被解析为纯文本并转换为单个 Token。

:::

::: tip 转义

- 你可以使用 `\` 来转义 `@`，因此以下内容不会被解析：

  ```MD
  \@demostart

  \@demoend
  ```

:::

::: warning 安全

`title` 属性始终会被转义。遵循 markdown-it 的 `html` 选项语义，默认渲染器仅在 `html: false`（默认值）时转义提取出的内容，因此 UML 块中由作者提供的 HTML 会作为纯文本渲染。当 `html: true` 时，内容会按原始 HTML 保留：该模式下作者 HTML 被信任，请在展示渲染结果前自行 sanitize（markdown-it 不会替你处理）。若需要完全控制，请传入自定义 `renderer`。

:::

## 选项

这四个选项在 TypeScript 类型中均为必填。

::: fields
@`name` type=string required

UML 名称。运行时默认为 `"uml"`。

@`open` type=string required

开始标记。运行时默认为 `"start"`。

@`close` type=string required

结束标记。运行时默认为 `"end"`。

@`renderer` type=RendererRule required

<!-- @include: ../render-rule.snippet.md -->

渲染函数。运行时默认使用内置渲染器，将内容包裹在 class 为 UML 名称、`title` 为转义后 info 字符串的 `<div>` 中。

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-plantuml`](https://www.npmjs.com/package/markdown-it-plantuml) `1.4.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |       15 |            0 |         10 |

以下用例是已记录的差异：

- `list-item` — The current package strips the list indentation from the diagram source (`getLines` with `blkIndent` plus `dedent`), while the reference slices `state.src` and keeps the two leading spaces. The list structure and the token map are identical.
- `list-item-unclosed` — Both sides auto-close the unclosed block at the end of the list item and produce the same map; the current package strips the item indentation from the source while the reference keeps it.
- `blockquote` — The reference slices `state.src` without removing blockquote markers, so the `>` prefix leaks into the diagram source; the current package strips it through `getLines`. The blockquote structure is identical.
- `nested-blockquote` — Same cause as `blockquote`: the reference keeps both `> >` prefixes in the diagram source, the current package strips both quote levels. The nested blockquote structure is identical.
- `indented-marker` — Both sides accept the two-space indented marker, but `dedent` removes the indentation of the content line in the current package while the reference keeps the line as written.
- `indented-content` — The current package removes the common indentation of the diagram body, the reference keeps every line as written. `dedent` preserves the relative indentation, so the drawing itself is unchanged.
- `title` — The current base keeps the raw marker suffix (including the separating space) as `info`; the reference removes that space and inline-parses the suffix for its alt text, which is the title compared here.
- `title-inline-markup` — Besides the separating space, the reference inline-parses the title, so `**Flow**` disappears from its alt text; the current base keeps the raw markers in `info`.
- `title-only-space` — The marker is followed by a single space, so the suffix is `" "`: the current base keeps it, while the reference unconditionally drops the first suffix character and ends up with an empty alt text.
- `odd-marker-suffix` — `@startumlExtra` still matches the opening marker as a prefix on both sides and both report the suffix `Extra` in `info`, but the reference unconditionally drops the first suffix character for its alt text (`xtra`), while the current base keeps the raw suffix as the title.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       36,353 |       32,756 | 1.11× |
| normal/medium |        9,046 |        7,274 | 1.24× |
| normal/large  |        3,029 |        1,854 | 1.63× |
| heavy/small   |       93,180 |       38,358 | 2.43× |
| heavy/medium  |       22,503 |        3,932 | 5.72× |
| heavy/large   |        7,041 |          477 | 14.8× |

几何平均吞吐量比值：2.78×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列              | 输入规模               | 当前拟合指数 | 参考拟合指数 |
| ----------------- | ---------------------- | -----------: | -----------: |
| long-block-body   | 128 / 256 / 512 / 1024 |        ~1.01 |        ~0.96 |
| many-blocks       | 128 / 256 / 512 / 1024 |        ~0.98 |        ~1.91 |
| unmatched-openers | 128 / 256 / 512 / 1024 |        ~1.01 |        ~1.90 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                 | 解压体积 | 入口 gzip |
| ---------------------------------- | -------: | --------: |
| @mdit/plugin-uml（当前）           |  24.3 kB |     665 B |
| markdown-it-plantuml@1.4.1（参考） |  64.1 kB |    1.5 kB |

### 说明

- `@mdit/plugin-uml` is the generalized base implementation of `markdown-it-plantuml`: it contains the same `@`-marker block rule, line scanning and auto-close rules, with the marker names, the token name and the renderer turned into options. This spec compares only that base block parser; the PlantUML image and encoder layer is out of scope and is disabled on both sides. The marker options are mapped 1:1 — the current side is configured with `{ name: "uml", open: "startuml", close: "enduml", renderer }` and the reference with `{ openMarker: "@startuml", closeMarker: "@enduml", generateSource, render }` — and each plugin registers its rule before `fence` with the same `alt` list, so the two parsers see the same block boundaries.
- Rendering is replaced by a deterministic dump on both sides: `blocks=N` followed by the document HTML of the shared markdown-it renderer, with every plugin block token serialized as `block markup=… params=… title=… map=… content=…` (strings JSON-quoted). The output is compared byte for byte (`normalize` is the identity function), because the only real differences are inside that record and the surrounding HTML comes from the same markdown-it core. No encoder, server URL or network access is involved on either side: the current `renderer` option and the reference `render` option return the record, and the reference `generateSource` returns the diagram source unchanged instead of the deflate + base64 server URL.
- The reference never stores the diagram source on its token: the block rule passes it to `generateSource` and keeps the result in the `src` attribute, while `token.content` stays empty. The current base stores it in `token.content`. The identity `generateSource` is therefore both the replacement for the encoder and the way the reference's extracted source is read back for the record; the `src`/`alt` attributes and the `<img>` tag are not compared (the current base pushes a placeholder `<uml>` token without attributes, and the image markup is the layer this spec excludes).
- The reference hard-codes the token type `uml_diagram`, which is also its renderer key. In the current package both are the `name` option (`uml` here, which is also the name `@mdit/plugin-plantuml` passes). The record prints a canonical `block` marker instead of the literal token type so that this naming difference does not mask the field-by-field comparison; the serializer of each side is installed as the renderer rule for its own token type, so a token of an unexpected type would not be rendered at all.
- Titles are handled differently by the two implementations. The reference derives an `alt` inside the block rule: it drops the first character of the marker suffix (`params.slice(1)`, assuming a separating space) and inline-parses the rest into `token.children`, falling back to the fixed `uml diagram` when the suffix is empty. The current base derives nothing: it exposes the raw suffix as `token.info` and leaves titles to the renderer (`@mdit/plugin-plantuml` uses that raw suffix as the image alt text). The compared `title` field is therefore the raw `info` on the current side and the inline-rendered alt text on the reference side; the fixed `uml diagram` fallback is not compared because it is an arbitrary label of the disabled image layer (the `plugin-plantuml` comparison covers it). `title`, `title-inline-markup`, `title-only-space` and `odd-marker-suffix` document the remaining differences.
- The body is extracted differently: the current package calls `state.getLines(startLine + 1, nextLine, state.blkIndent, false)` and `dedent`, while the reference slices the raw document with `state.src.split('\n').slice(startLine + 1, nextLine).join('\n')`. Both agree on the line range, the auto-close rules, the block count, the `markup` and the token `map` in every case; they disagree on the text. The reference keeps the indentation of list items and of indented blocks and even the `>` prefixes of blockquotes, while the current package strips the container prefixes and the common indentation. `list-item`, `list-item-unclosed`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` document this; the block structure around the diagrams is identical in all of them.
- Both sides reject a closing marker that is indented deeper than the opening one or followed by non-space text, keep that line as diagram content and auto-close the block at the end of the parent; `closing-marker-indented` and `closing-marker-trailing-text` pin this down. Markers inside fences and indented code blocks are not parsed by either side (both rules sit between `code` and `fence`), and an escaped (`\@startuml`) or mid-line marker stays paragraph text on both sides.
- Benchmarks use the same deterministic dump, so they measure block parsing and the shared markdown-it rendering only; the deflate + base64 encoder and the network are excluded on both sides. The `heavy` corpora contain four diagrams per section rather than one, so their ratios also include the reference's per-block whole-document split described below.
- Scaling: the reference extracts every block with `state.src.split('\n')`, so each block costs O(document) and many blocks cost O(blocks × document) — quadratic. `many-blocks` and `unmatched-openers` (every list item opens a block that is auto-closed by the next item) target that; `long-block-body` is linear on both sides and serves as the baseline. The current package slices only the block lines with `state.getLines` and stays linear in the number of blocks; no superlinear path was found in it.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
