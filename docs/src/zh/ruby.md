---
title: "@mdit/plugin-ruby"
shortTitle: "plugin-ruby"
icon: language
---

提供 `<ruby>` 声明支持的插件。

<!-- more -->

## 使用

```ts
import { ruby } from "@mdit/plugin-ruby";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(ruby);

mdIt.render("{中国:zhōng|guó}");
```

## 语法

通过 `{ruby base:ruby text1|ruby text2|...}` 来添加 ruby 声明。

::: tip 转义

- 你可以使用 `\` 来转义 `{` `}` 或 `:`:

  ```md
  \{中国:zhōng|guó}
  ```

  会被渲染为

  \{中国:zhōng|guó}

:::

## 示例

`{中国:zhōng|guó}`: {中国:zhōng|guó}

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-ruby`](https://www.npmjs.com/package/markdown-it-ruby) `1.1.2` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     21 |       10 |            0 |         11 |

以下用例是已记录的差异：

- `documented-syntax` — The reference splits on `|`, not on `:`: it renders `中国:zhōng` as the base text with `guó` as ruby text, while this package splits the base per character and pairs `中`/`zhōng` and `国`/`guó`.
- `upstream-syntax` — This package does not recognize the upstream `|` divider, so it leaves the construct as plain text; the reference renders it as ruby.
- `simple-ruby` — Same divider difference: this package renders ruby, the reference leaves the text untouched.
- `equal-length-pairs` — Divider difference: this package splits per character into two `<rt>` pairs, while the reference does not recognize `:` as the divider.
- `wrapped-in-strong` — Divider difference inside emphasis; both sides keep the surrounding `**` markup.
- `inline-markup-inside-ruby` — Divider difference: this package parses inline markup inside the base text, the reference leaves the whole construct as text with the emphasis parsed normally.
- `inline-markup-in-ruby-text` — Divider difference: this package parses inline markup inside the ruby text, the reference leaves the construct as text.
- `empty-ruby-segment` — This package rejects empty `|`-separated segments and leaves the source as text; the reference sees no `:` divider, treats `ab:` as base text and renders an empty `<rt></rt>`.
- `extra-colon` — This package keeps everything after the first `:` as ruby text; the reference does not recognize `:` and leaves the source as text.
- `escaped-backslash` — This package treats `\\` as an escaped backslash and the following `:` as the divider; the reference does not parse `:` at all.
- `in-table-cell` — Divider difference: this package renders ruby inside the table cell, the reference keeps the source text.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |        7,132 |        7,643 | 0.93× |
| normal/medium |        1,394 |        1,494 | 0.93× |
| normal/large  |          347 |          369 | 0.94× |
| heavy/small   |        3,289 |        3,308 | 0.99× |
| heavy/medium  |          622 |          624 | 1.00× |
| heavy/large   |          152 |          150 | 1.01× |

几何平均吞吐量比值：0.97×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列                    | 输入规模                | 当前拟合指数 | 参考拟合指数 |
| ----------------------- | ----------------------- | -----------: | -----------: |
| dense-documented-syntax | 128 / 256 / 512 / 1024  |        ~1.01 |        ~1.92 |
| unmatched-openers       | 256 / 512 / 1024 / 2048 |        ~1.93 |        ~1.93 |
| upstream-syntax         | 128 / 256 / 512 / 1024  |        ~1.94 |        ~1.00 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                             | 解压体积 | 入口 gzip |
| ------------------------------ | -------: | --------: |
| @mdit/plugin-ruby（当前）      |  20.1 kB |     575 B |
| markdown-it-ruby@1.1.2（参考） |  21.3 kB |    1.9 kB |

### 说明

- The current package and the installed reference use different dividers: this package implements `{ruby base:ruby text}` (the upstream syntax that the fork was based on), while the installed `markdown-it-ruby@1.1.2` implements DenDenMarkdown's `{ruby base|ruby text}`. This is a real behavioral difference, not a normalization, so every case that renders ruby on one side renders plain text on the other and carries a `note`.
- The reference has an `rp` option (`[open, close]`). This package does not implement it, so the reference is left at its default `rp: []`, which renders no `<rp>` elements and matches the current package's output shape.
- The reference renders empty rubies such as `{ab:|}` (base `ab:`, empty `<rt></rt>`) because it only splits on `|`; this package rejects empty `|`-separated segments and empty ruby text, which is covered by `empty-ruby-segment`.
- Because the syntax differs, every benchmark corpus mixes both divider styles: each side parses its own syntax and only scans over the other side's lines. Throughput ratios therefore compare equivalent mixtures, not identical parse work.
- Both implementations scan forward to the end of the line when an opening `{` has no valid divider/close in that line; `unmatched-openers` exposes that quadratic path for both, `dense-documented-syntax` is linear for this package but quadratic for the reference, and `upstream-syntax` is the mirror image.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
