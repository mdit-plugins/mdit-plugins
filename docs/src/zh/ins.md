---
title: "@mdit/plugin-ins"
shortTitle: "plugin-ins"
icon: underline
---

添加 ins 标签支持的插件。

<!-- more -->

## 使用

```ts
import { ins } from "@mdit/plugin-ins";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(ins);

mdIt.render("VuePress Theme Hope ++十分++ 强大。");
```

## 语法

使用 `++ ++` 插入 `<ins>` 标签。

## 示例

::: preview 示例

VuePress Theme Hope ++十分++ 强大。

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-ins`](https://www.npmjs.com/package/markdown-it-ins) `4.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     23 |       23 |            0 |          0 |

23 个用例的输出与参考包完全一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       10,799 |       10,688 | 1.01× |
| normal/medium |        2,256 |        2,212 | 1.02× |
| normal/large  |          629 |          621 | 1.01× |
| heavy/small   |        4,295 |        4,311 | 1.00× |
| heavy/medium  |          812 |          793 | 1.02× |
| heavy/large   |          221 |          223 | 0.99× |

几何平均吞吐量比值：1.01×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列               | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| ------------------ | ------------------------ | -----------: | -----------: |
| inline-insertions  | 500 / 1000 / 2000 / 4000 |        ~1.03 |        ~1.02 |
| nested-odd-markers | 128 / 256 / 512 / 1024   |        ~1.04 |        ~1.01 |
| unmatched-openers  | 500 / 1000 / 2000 / 4000 |        ~1.03 |        ~1.00 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                            | 解压体积 | 入口 gzip |
| ----------------------------- | -------: | --------: |
| @mdit/plugin-ins（当前）      |  18.6 kB |     187 B |
| markdown-it-ins@4.0.0（参考） |  15.6 kB |    1.1 kB |

### 说明

- Both packages are option-less and neither side receives options; both renderers use markdown-it's default options.
- The package registers the shared nested inline rule with doubled `++` markers, like the reference; both follow the CommonMark emphasis delimiter rules and relocate the lone marker of odd-length runs. Every correctness case renders identical HTML, so no case is a documented difference.
- Scaling: both implementations consume each marker run once and move the lone marker of an odd-length run within a single run of adjacent close tags. `inline-insertions`, `unmatched-openers` and `nested-odd-markers` all fit a near-linear exponent on both sides; no superlinear path was found.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
