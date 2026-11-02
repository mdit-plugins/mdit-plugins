---
title: "@mdit/plugin-sub"
shortTitle: "plugin-sub"
icon: subscript
---

提供下角标支持的插件。

<!-- more -->

## 使用

```ts
import { sub } from "@mdit/plugin-sub";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(sub);

mdIt.render("H~2~O");
```

## 语法

使用 `~ ~` 进行下角标标注。

::: tip 转义

- 你可以使用 `\` 来转义 `~`:

  ```md
  H\~2~O
  ```

  会被渲染为

  H\~2~O

:::

## 示例

<!-- prettier-ignore -->
`H~2~O`: H~2~O

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-sub`](https://www.npmjs.com/package/markdown-it-sub) `2.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     24 |       24 |            0 |          0 |

24 个用例的输出与参考包完全一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       10,776 |       10,753 | 1.00× |
| normal/medium |        2,348 |        2,338 | 1.00× |
| normal/large  |          648 |          650 | 1.00× |
| heavy/small   |        3,887 |        3,888 | 1.00× |
| heavy/medium  |          732 |          738 | 0.99× |
| heavy/large   |          202 |          203 | 0.99× |

几何平均吞吐量比值：1.00×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列              | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| ----------------- | ------------------------ | -----------: | -----------: |
| inline-subscripts | 500 / 1000 / 2000 / 4000 |        ~1.01 |        ~1.01 |
| long-inline-run   | 512 / 1024 / 2048 / 4096 |        ~0.93 |        ~0.92 |
| unmatched-openers | 500 / 1000 / 2000 / 4000 |        ~0.99 |        ~1.00 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                            | 解压体积 | 入口 gzip |
| ----------------------------- | -------: | --------: |
| @mdit/plugin-sub（当前）      |  18.3 kB |     156 B |
| markdown-it-sub@2.0.0（参考） |   9.6 kB |     674 B |

### 说明

- Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.
- The package uses the shared linear inline rule; like the reference it scans to the next marker, rejects unescaped whitespace in the content and unescapes backslash escapes. Every correctness case renders identical HTML, so no case is a documented difference.
- Scaling: the scanner stops at the next marker character, so repeated unmatched openers do not rescan the remaining line, and `long-inline-run` scans its content once. `inline-subscripts`, `unmatched-openers` and `long-inline-run` all fit a near-linear exponent on both sides; no superlinear path was found.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
