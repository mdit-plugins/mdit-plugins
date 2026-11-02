---
title: "@mdit/plugin-emoji"
shortTitle: "plugin-emoji"
icon: face-smile
---

markdown-it 的表情插件。

<!-- more -->

## 使用

```ts
import { fullEmoji } from "@mdit/plugin-emoji";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(fullEmoji);

mdIt.render("来自火星的问候 :satellite:");
```

提供了几种不同的预设：

- `fullEmoji`: 包含所有可用的表情支持
- `lightEmoji`: 包含常用表情的一个子集
- `bareEmoji`: 不包含任何默认定义，仅包含你在选项中定义的内容

同一个 markdown-it 实例只支持一个预设：重复安装（换成其它变体或传入不同选项）时，保持首次安装的规则及其定义。

## 语法

- `:表情名称:`
- 捷键短语，如 `:)`, `:D` 等 (如果启用)

## 选项

:::: fields
@`definitions` type=`Record<string, string>` default="`{}` (取决于预设)"

重写可用的表情定义。键是表情名称，值是表情字符。

::: warning 不可信输入

表情定义的值会作为原始 HTML 直接输出，因此 `definitions` 绝不能包含不可信的用户输入，否则必须先对值进行清理。

:::

@`enabled` type=string[] default=`[]`

如果指定，则仅渲染此列表中的表情。否则，将渲染定义中的所有表情。

@`shortcuts` type=`Record<string, string | string[]>` default="`{}` (取决于预设)"

重写默认快捷键。键是表情名称，值是表情的快捷键短语。

空字符串或纯空白的快捷键会被忽略。

::::

## 示例

::: preview 示例

来自火星的问候 :satellite:

经典快捷键: :-) :-(

:::

## 自定义渲染器

默认情况下，表情被渲染为相应的 Unicode 字符。但你可以根据需要更改渲染器函数。

例如，使用 [twemoji](https://github.com/twitter/twemoji)：

```ts
import { fullEmoji } from "@mdit/plugin-emoji";
import MarkdownIt from "markdown-it";
import twemoji from "twemoji";

const mdIt = new MarkdownIt().use(fullEmoji);

mdIt.renderer.rules.emoji = (tokens, idx) => twemoji.parse(tokens[idx].content);
```

你可以使用以下样式使图片高度与行高匹配：

```css
.emoji {
  height: 1.2em;
}
```

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-emoji`](https://www.npmjs.com/package/markdown-it-emoji) `3.1.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 变体  | 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| ----- | -----: | -------: | -----------: | ---------: |
| bare  |     25 |       25 |            0 |          0 |
| light |     25 |       25 |            0 |          0 |
| full  |     25 |       23 |            0 |          2 |

以下用例是已记录的差异：

- `full/full-new-emoji-name` — This Unicode 15.1 name exists only in the current `full` data; the reference renders it as literal text. `light` and `bare` render it literally on both sides.
- `full/full-reference-only-name` — `u6e80` (🈵) only exists in the reference data; the current `full` data names the same character `no_vacancy` and renders `:u6e80:` as literal text. `light` and `bare` render it literally on both sides.

### 基准性能

| 变体  | 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ----- | ------------- | -----------: | -----------: | ----: |
| bare  | normal/small  |       10,596 |       10,623 | 1.00× |
| bare  | normal/medium |        1,963 |        1,967 | 1.00× |
| bare  | normal/large  |          551 |          552 | 1.00× |
| bare  | heavy/small   |       11,797 |       11,816 | 1.00× |
| bare  | heavy/medium  |        2,246 |        2,242 | 1.00× |
| bare  | heavy/large   |          629 |          627 | 1.00× |
| light | normal/small  |        9,954 |        9,972 | 1.00× |
| light | normal/medium |        1,854 |        1,850 | 1.00× |
| light | normal/large  |          500 |          511 | 0.98× |
| light | heavy/small   |        7,909 |        7,864 | 1.01× |
| light | heavy/medium  |        1,495 |        1,502 | 1.00× |
| light | heavy/large   |          417 |          417 | 1.00× |
| full  | normal/small  |        8,762 |        8,756 | 1.00× |
| full  | normal/medium |        1,642 |        1,642 | 1.00× |
| full  | normal/large  |          461 |          462 | 1.00× |
| full  | heavy/small   |        6,794 |        6,735 | 1.01× |
| full  | heavy/medium  |        1,296 |        1,279 | 1.01× |
| full  | heavy/large   |          361 |          359 | 1.01× |

几何平均吞吐量比值：1.00×（共 18 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 变体  | 系列                      | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| ----- | ------------------------- | ------------------------ | -----------: | -----------: |
| bare  | dense-emoji-text          | 512 / 1024 / 2048 / 4096 |        ~1.00 |        ~1.01 |
| bare  | inline-token-replacements | 512 / 1024 / 2048 / 4096 |        ~1.76 |        ~1.76 |
| bare  | unmatched-colon-words     | 512 / 1024 / 2048 / 4096 |        ~0.98 |        ~0.98 |
| light | dense-emoji-text          | 512 / 1024 / 2048 / 4096 |        ~0.99 |        ~1.00 |
| light | inline-token-replacements | 512 / 1024 / 2048 / 4096 |        ~1.78 |        ~1.78 |
| light | unmatched-colon-words     | 512 / 1024 / 2048 / 4096 |        ~0.99 |        ~0.99 |
| full  | dense-emoji-text          | 512 / 1024 / 2048 / 4096 |        ~1.01 |        ~1.00 |
| full  | inline-token-replacements | 512 / 1024 / 2048 / 4096 |        ~1.50 |        ~2.01 |
| full  | unmatched-colon-words     | 512 / 1024 / 2048 / 4096 |        ~1.03 |        ~1.02 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                              | 解压体积 | 入口 gzip |
| ------------------------------- | -------: | --------: |
| @mdit/plugin-emoji（当前）      | 289.5 kB |   17.8 kB |
| markdown-it-emoji@3.1.0（参考） | 344.3 kB |      91 B |

### 说明

- The `bare` preset ships no built-in data, so both sides receive the same custom definitions (the reference option is `defs`, the current one `definitions`), shortcuts and `enabled` whitelist (`enabled: ["smile", "rocket"]`).
- `light` data (150 names) and the shortcut table (25 names) are identical on both sides, so every `light` case matches.
- `full` data differs: the current package ships 1957 names, markdown-it-emoji 3.1.0 ships 1903. 55 newer names (Unicode 15.1/16.0 additions such as `head_shaking_horizontally`, `phoenix` or `leafless_tree`) exist only in the current data, and the reference-only generated name `u6e80` (🈵, exposed as `no_vacancy` in the current data) is missing from the current data. The two `full` cases covering these names are reported as documented diffs; the `light` and `bare` variants render them as literal text on both sides.
- The current package ignores empty or whitespace-only shortcut aliases, while the reference compiles a zero-length alternative that duplicates emojis next to whitespace or punctuation (e.g. `a :smile: b` with an empty `smile` alias becomes `a 😄😄 b`). This is documented behavior of the current package and is not covered by a case, because such an alias changes every shortcut-bearing text token.
- Scaling: `dense-emoji-text` and `unmatched-colon-words` are linear baselines. `inline-token-replacements` is superlinear and exposes the replacement loop from markdown-it-emoji#22: every matching text token is rewritten with `arrayReplaceAt`, which copies the whole inline children array, so an inline token with m matching children costs O(m²).
- Benchmarks render fixed corpora (`normal` = sparse emoji, `heavy` = dense emoji) and compare both sides interleaved; the ratio and exponent values in the result file come from the controlled sequential comparison run, not from ad-hoc runs.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
