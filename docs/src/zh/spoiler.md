---
title: "@mdit/plugin-spoiler"
shortTitle: "plugin-spoiler"
icon: eraser
---

用于隐藏内容的插件。

<!-- more -->

## 使用

```ts
import { spoiler } from "@mdit/plugin-spoiler";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(spoiler);

mdIt.render("VuePress Theme Hope !!十分强大!!。");
```

在使用默认选项的情况下，你可以导入 `@mdit/plugin-spoiler/style` 以应用相应样式。

## 语法

使用 `!! !!` 进行标记。

## 选项

::: fields
@`tag` type=string default=`"span"`

剧透元素的 HTML 标签名称。

@`attrs` type=`[attr: string, value: string][] | (() => [attr: string, value: string][])` default=`() => [["class", "spoiler"], ["tabindex","-1"]]`

剧透元素的自定义 HTML 属性。静态数组会为每个令牌克隆一份；工厂函数会为每个令牌调用一次，且必须返回新数组（推荐用于动态属性）。

:::

## 示例

::: preview 示例

VuePress Theme Hope !!十分强大!!。

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-spoiler`](https://www.npmjs.com/package/markdown-it-spoiler) `1.1.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     22 |       22 |            0 |          0 |

22 个用例的输出与参考包完全一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       18,894 |       19,234 | 0.98× |
| normal/medium |        2,566 |        2,562 | 1.00× |
| normal/large  |          747 |          753 | 0.99× |
| heavy/small   |        5,901 |        6,009 | 0.98× |
| heavy/medium  |        1,199 |        1,190 | 1.01× |
| heavy/large   |          339 |          342 | 0.99× |

几何平均吞吐量比值：0.99×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列               | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| ------------------ | ------------------------ | -----------: | -----------: |
| inline-spoilers    | 500 / 1000 / 2000 / 4000 |        ~1.02 |        ~1.01 |
| nested-odd-markers | 128 / 256 / 512 / 1024   |        ~0.98 |        ~0.99 |
| unmatched-openers  | 500 / 1000 / 2000 / 4000 |        ~1.00 |        ~1.00 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                | 解压体积 | 入口 gzip |
| --------------------------------- | -------: | --------: |
| @mdit/plugin-spoiler（当前）      |  21.3 kB |     235 B |
| markdown-it-spoiler@1.1.1（参考） |   6.6 kB |    1.7 kB |

### 说明

- The current package adds `tabindex="-1"` to the spoiler element by default for keyboard accessibility. The variant sets `attrs` to `[["class", "spoiler"]]` so that the compared markup is the reference's `<span class="spoiler">`; the accessibility attribute is an intentional addition and is not part of this comparison.
- The reference exposes a `frontPriorMode` option that controls where an odd leftover marker is placed. The current package has no counterpart, so both sides are compared in the reference's default mode (`frontPriorMode: false`); the odd-length marker cases cover that mode.
- All correctness cases render identical HTML, so no output normalization beyond the harness default (attribute order) is applied.
- Scaling: both implementations consume each marker run once and relocate lone odd markers within a single run of adjacent close tags, so `inline-spoilers`, `unmatched-openers` and `nested-odd-markers` all grow linearly; no superlinear path was found.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
