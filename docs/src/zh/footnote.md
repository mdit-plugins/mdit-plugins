---
title: "@mdit/plugin-footnote"
shortTitle: "plugin-footnote"
icon: quote-left
---

支持页脚的插件。

<!-- more -->

## 使用

```ts
import { footnote } from "@mdit/plugin-footnote";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

## 语法

- 在 Markdown 中使用 `[^锚点文字]` 来定义脚注。

- 在之后的任何行首使用 `[^锚点文字]: ...` 来描述脚注内容。

- 如果脚注包含多个段落，其后的段落应当保持双层缩进。

::: tip 嵌套和转义

- 支持嵌套：

  ```MD
  脚注 1 链接 [^first]。

  [^first]: 脚注可以参考[^second]。
  [^second]: 其他脚注。
  ```

- 转义可以通过添加 `\` 来完成：

  ```MD
  紧随的 \[^first] 不是脚注。
  ```

  将渲染为

  紧随的 \[^first] 不是脚注。

::::

## 示例

::: preview 示例

脚注 1 链接[^first]。

脚注 2 链接[^second]。

行内的脚注^[行内脚注文本] 定义。

重复的页脚定义[^second]。

[^first]: 脚注 **可以包含特殊标记**

    也可以由多个段落组成

[^second]: 脚注文字。

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-footnote`](https://www.npmjs.com/package/markdown-it-footnote) `4.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     22 |        6 |           16 |          0 |

22 个用例在规范化后与参考包一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       18,421 |       18,224 | 1.01× |
| normal/medium |        2,618 |        2,610 | 1.00× |
| normal/large  |          630 |          633 | 0.99× |
| heavy/small   |        9,856 |        9,687 | 1.02× |
| heavy/medium  |        1,686 |        1,619 | 1.04× |
| heavy/large   |          419 |          350 | 1.20× |

几何平均吞吐量比值：1.04×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列                 | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| -------------------- | ------------------------ | -----------: | -----------: |
| duplicate-references | 128 / 256 / 512 / 1024   |        ~0.99 |        ~0.99 |
| many-definitions     | 128 / 256 / 512 / 1024   |        ~1.01 |        ~1.01 |
| many-footnotes       | 512 / 1024 / 2048 / 4096 |        ~1.05 |        ~1.62 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                 | 解压体积 | 入口 gzip |
| ---------------------------------- | -------: | --------: |
| @mdit/plugin-footnote（当前）      |  57.9 kB |    1.7 kB |
| markdown-it-footnote@4.0.0（参考） |  46.8 kB |    2.7 kB |

### 说明

- The current package emits an extra empty `<a class="footnote-anchor">` inside `<sup class="footnote-ref">` so that consumers can set a CSS scroll offset, while the reference keeps the back-reference id on the link itself. Normalization removes that element and unifies the generated `footnote*` / `fn*` ids and `href`s before comparing.
- Generated footnote ids, reference ids and `href` targets are normalized; footnote numbering, captions (`[1]`, `[1:1]`) and the rendered footnote list are compared.
- Neither plugin takes options, so `ourOptions` and `referenceOptions` are omitted.
- The current package escapes a caller-provided `env.docId` before interpolating it into generated ids (the reference does not). The harness renders without `env`, so the `docId` path is not exercised by the cases.
- Scaling: the reference `footnote_tail` rebuilds the token array for every footnote definition (`state.tokens = state.tokens.concat(tokens)`), which is quadratic in the number of footnotes; the current package pushes into the existing array instead. `many-footnotes` exposes this (reference exponent ~1.6, current ~1.0).
- Attribute order is normalized.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
