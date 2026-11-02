---
title: "@mdit/plugin-dl"
shortTitle: "plugin-dl"
icon: book
---

支持定义列表的插件。

<!-- more -->

## 使用

```ts
import { dl } from "@mdit/plugin-dl";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(dl);

mdIt.render(`\
苹果
: 蔷薇科苹果属植物的果仁果实。

橘子
: 柑橘属常绿乔木的果实。
`);
```

## 语法

语法基于 [PanDoc 定义列表](https://pandoc.org/MANUAL.html#definition-lists)。

每个术语必须在一行，该行可选跟一个空行。在术语后，需跟着一个或多个它的定义。

每个定义需要以 `:` 或 `~` 开头，后面可以跟着一个或多个定义的段落，段落可以从同一行或下一行开始。当定义有多个块元素时，后续的块元素均应缩进四个空格。

如果术语后有空行，那么定义的文本将被视作段落，反之将会显示一个紧凑的列表。

## 示例

::: preview 示例

术语 1

: 定义 1

术语 2 with _inline markup_

: 定义 2

    定义 2 有多个段落。

    - 列表 1
    - 列表 2

术语 3

: 定义 3
包含软换行

    定义的第二个段落。

---

术语 1
: 定义 1

术语 2
: 定义 2a
: 定义 2b

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-deflist`](https://www.npmjs.com/package/markdown-it-deflist) `4.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     22 |       22 |            0 |          0 |

22 个用例的输出与参考包完全一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       12,034 |       12,072 | 1.00× |
| normal/medium |        2,298 |        2,313 | 0.99× |
| normal/large  |          582 |          582 | 1.00× |
| heavy/small   |        6,307 |        6,328 | 1.00× |
| heavy/medium  |        1,371 |        1,373 | 1.00× |
| heavy/large   |          338 |          336 | 1.01× |

几何平均吞吐量比值：1.00×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列                      | 输入规模               | 当前拟合指数 | 参考拟合指数 |
| ------------------------- | ---------------------- | -----------: | -----------: |
| many-definitions-per-term | 128 / 256 / 512 / 1024 |        ~1.00 |        ~1.00 |
| many-terms                | 128 / 256 / 512 / 1024 |        ~1.00 |        ~1.00 |
| nested-definitions        | 128 / 256 / 512 / 1024 |        ~1.58 |        ~1.59 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                | 解压体积 | 入口 gzip |
| --------------------------------- | -------: | --------: |
| @mdit/plugin-dl（当前）           |  29.9 kB |     978 B |
| markdown-it-deflist@4.0.0（参考） |  26.7 kB |    1.9 kB |

### 说明

- Neither package takes options; both are installed with their defaults.
- The current package and the reference only differ in source-map / token metadata that is not rendered, so every correctness case compares equal.
- Historical context: the reference implementation had a hang (infinite loop) on definition lines starting with `: >` or `~ >` (markdown-it-deflist#5), fixed in 2.0.3. The installed 4.0.0 and this fork are both linear on that pattern and on all other probed patterns.
- `nested-definitions` grows its indentation by four spaces per level, so the generated input itself is quadratic in the series size; the fitted exponent is a lower bound for the parser's work per input byte, not a quadratic parser.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
