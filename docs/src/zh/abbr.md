---
title: "@mdit/plugin-abbr"
shortTitle: "plugin-abbr"
icon: spell-check
---

支持缩写词 `<abbr>` 标签的插件。

<!-- more -->

## 使用

```ts
import { abbr } from "@mdit/plugin-abbr";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(abbr);

mdIt.render(`
*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
The HTML specification is maintained by the W3C.
`);
```

<!-- markdownlint-disable MD028 -->

## 语法

通过此插件，你可以通过以额外 `*` 开头的链接声明来声明缩略词。

<!-- prettier-ignore-start -->

```md
*[缩略词]: 内容
```

<!-- prettier-ignore-end -->

::: tip 转义

转义可以通过添加额外的 `\` 以转义 `*` `[` 或 `]` 字符:

```md
\*[文字]: 内容
```

会被渲染为

\*[文字]: 内容

:::

## 示例

<!-- prettier-ignore-start -->

::: preview 示例

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

The HTML specification is maintained by the W3C.

:::

<!-- prettier-ignore-end -->

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-abbr`](https://www.npmjs.com/package/markdown-it-abbr) `2.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     23 |       23 |            0 |          0 |

23 个用例的输出与参考包完全一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       10,455 |       10,268 | 1.02× |
| normal/medium |        2,386 |        2,378 | 1.00× |
| normal/large  |          595 |          597 | 1.00× |
| heavy/small   |        5,572 |        5,473 | 1.02× |
| heavy/medium  |        1,048 |        1,055 | 0.99× |
| heavy/large   |          259 |          258 | 1.00× |

几何平均吞吐量比值：1.01×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列                      | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| ------------------------- | ------------------------ | -----------: | -----------: |
| dense-occurrences         | 128 / 256 / 512 / 1024   |        ~0.97 |        ~0.97 |
| interleaved-abbreviations | 512 / 1024 / 2048 / 4096 |        ~1.83 |        ~1.81 |
| many-definitions          | 128 / 256 / 512 / 1024   |        ~0.96 |        ~0.96 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                             | 解压体积 | 入口 gzip |
| ------------------------------ | -------: | --------: |
| @mdit/plugin-abbr（当前）      |  27.7 kB |     954 B |
| markdown-it-abbr@2.0.0（参考） |  21.2 kB |    1.6 kB |

### 说明

- Neither package takes options; both are installed with their defaults.
- The replacement pass rewrites the inline token list with `md.utils.arrayReplaceAt`, which copies the whole token array for every text token that contains an abbreviation. A paragraph with inline markup between abbreviations therefore grows quadratically; both implementations fork the same algorithm and show the same exponent.
- Abbreviations are matched case-sensitively and only at word boundaries, so `HTML` is not replaced inside `HTML5` or `html`.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
