---
title: "@mdit/plugin-plantuml"
shortTitle: "plugin-plantuml"
icon: diagram-project
---

支持 plant uml 的插件，基于 [@mdit/plugin-uml](uml.md)。

<!-- more -->

## 使用

```ts
import { plantuml } from "@mdit/plugin-plantuml";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(plantuml);

mdIt.render(`\
@startuml
Bob -> Alice : hello
@enduml
`);
```

## 选项

:::: fields
@`type` type=`"uml" | "fence"` default=`"uml"`

Plantuml 解析类型。

@`name` type=string default=`"uml"`

图表类型。仅在使用默认地址获取器时可用。

@`fence` type=string

代码块名称。默认为 `name` 的值。

@`open` type=string

开始标记。仅当类型为 "uml" 时可用。默认为 `"start" + name`。

@`close` type=string

结束标记。仅当类型为 "uml" 时可用。默认为 `"end" + name`。

@`server` type=string default=`"https://www.plantuml.com/plantuml"`

Plantuml 服务器。仅在使用默认地址获取器时可用。

::: warning 外部请求

使用默认 `srcGetter` 时，图表源码会被发送到配置的 PlantUML 服务器（默认为 `https://www.plantuml.com/plantuml`），这是一次可能泄露图表内容的外部请求。如果图表源码敏感，请自建服务器或提供自定义 `renderer`。

:::

@`format` type=string default=`"svg"`

图片格式。仅在使用默认地址获取器时可用。

@`srcGetter` type=`(content: string) => string`

图片地址获取器。接收图表内容并返回图片链接。

@`renderer` type=RendererRule

<!-- @include: ../render-rule.snippet.md -->

图表渲染器。

::::

## 示例

::: preview 示例

@startuml
Bob -> Alice : hello
@enduml

:::

::: preview 非 ASCII 示例

@startuml
Bob -> Alice : 你好
@enduml

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-plantuml`](https://www.npmjs.com/package/markdown-it-plantuml) `1.4.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     24 |        6 |           10 |          8 |

以下用例是已记录的差异：

- `list-item` — The current package strips the list indentation from the diagram source, while the reference keeps the two leading spaces of the content line. The rendered list and `<img>` structure are identical.
- `blockquote` — The reference slices `state.src` without removing blockquote markers, so the `>` prefix leaks into the diagram source; the current package dedents the quoted lines. The blockquote structure is identical.
- `nested-blockquote` — Same cause as `blockquote`: the reference keeps every `>` prefix in the diagram source, while the current package strips both quote levels. The nested blockquote structure is identical.
- `indented-marker` — Both sides accept the two-space indented marker, but the reference keeps the indentation of the content line in the diagram source and the current package strips it with `dedent`.
- `indented-content` — The current package removes the common indentation of the diagram body, while the reference keeps every line as written. The relative indentation is preserved by `dedent`, so the drawing itself is unchanged.
- `title` — The current package uses the raw marker suffix as alt, including the separating space after `@startuml`; the reference removes that space and inline-parses the title.
- `title-inline-markup` — Besides the separating space, the reference inline-parses the title, so `**Flow**` becomes `Flow` in alt; the current package keeps the raw markers.
- `title-html` — Only the separating space differs: the reference inline-parses `<b>` but keeps it as text in the alt attribute, so both sides end up with the same escaped HTML.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       36,932 |       34,019 | 1.09× |
| normal/medium |        9,063 |        7,248 | 1.25× |
| normal/large  |        3,114 |        1,844 | 1.69× |
| heavy/small   |       97,253 |       38,981 | 2.49× |
| heavy/medium  |       24,580 |        4,156 | 5.91× |
| heavy/large   |        8,286 |          557 | 14.9× |

几何平均吞吐量比值：2.82×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列              | 输入规模               | 当前拟合指数 | 参考拟合指数 |
| ----------------- | ---------------------- | -----------: | -----------: |
| long-diagram-body | 64 / 128 / 256 / 512   |        ~0.98 |        ~0.95 |
| many-diagrams     | 128 / 256 / 512 / 1024 |        ~1.01 |        ~1.94 |
| unmatched-openers | 128 / 256 / 512 / 1024 |        ~1.01 |        ~1.87 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                 | 解压体积 | 入口 gzip |
| ---------------------------------- | -------: | --------: |
| @mdit/plugin-plantuml（当前）      | 390.9 kB |     749 B |
| markdown-it-plantuml@1.4.1（参考） |  64.1 kB |    1.5 kB |

### 说明

- Both packages parse `@startuml` … `@enduml` blocks and render an `<img>` whose `src` points at a PlantUML server. The current package compresses with its platform deflate implementation (Node: `node:zlib`, browser: pako) and its own base64 variant, while the reference package ships its own deflate implementation, so the encoded URLs are not byte-comparable by design. The source generators are replaced through the documented hooks: `srcGetter` returns the token content on the current side and `generateSource` returns the diagram code on the reference side. The compared `src` is therefore the decoded diagram source (the text that would be compressed into the URL), not the encoded URL. No PlantUML server is contacted and no request is made while rendering.
- The current package parses through `@mdit/plugin-uml` and extracts block content with `state.getLines` plus `dedent`, while the reference slices `state.src` itself. As a result the reference keeps the raw indentation of indented blocks and lists (and even the `>` prefix of blockquotes) in the diagram source, whereas the current package strips it. The `list-item`, `blockquote`, `nested-blockquote`, `indented-marker` and `indented-content` cases document this; block structure itself is identical.
- An untitled diagram gets a different default alt text from each package (`PlantUML Diagram` vs `uml diagram`). Both are arbitrary fallbacks, so the current wording is normalized to the reference one before comparing; explicit titles are not normalized. Attribute order is normalized as well.
- Explicit titles differ by design: the current package uses the raw marker suffix (including the separating space after `@startuml`) and does not inline-parse it, while the reference drops that space and inline-parses the title, so emphasis and code markers disappear from its alt text. The `title`, `title-inline-markup` and `title-html` cases document this.
- The default renderer of each package is kept; only the `src` generator is replaced. Alt text, HTML escaping, block structure and the number of rendered images are therefore compared as produced by both plugins.
- Benchmarks run through the same deterministic renderers, so they measure parsing and markup generation only: the deflate + base64 encoders are bypassed on both sides and are not part of the throughput numbers. The `heavy` corpora contain many diagrams, so their ratios also reflect the reference's per-block document split described below. Corpora stay modest (normal ≈ 1/4/12 KB with one diagram per section, heavy ≈ 0.7/3/9 KB with four diagrams per section).
- Scaling: the reference extracts every block with `state.src.split('\n')`, so each diagram costs O(document size) and many diagrams cost O(blocks × document), i.e. quadratic (`many-diagrams`, and `unmatched-openers`, which places one unclosed marker inside every list item so each item auto-closes its own block). The current package slices only the block lines with `state.getLines` and stays linear in the number of diagrams. `long-diagram-body` is linear on both sides; no superlinear path was found in the current package. Encoding cost is excluded from all series.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
