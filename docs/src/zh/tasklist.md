---
title: "@mdit/plugin-tasklist"
shortTitle: "plugin-tasklist"
icon: list-check
---

提供任务列表支持的插件。

<!-- more -->

## 使用

```ts
import { tasklist } from "@mdit/plugin-tasklist";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(tasklist, {
  // your options, optional
});

mdIt.render(`\
- [x] task 1
- [ ] task 2
`);
```

## 语法

- 使用 `- [ ] 一些文字` 渲染一个未勾选的任务项
- 使用 `- [x] 一些文字` 渲染一个勾选了的任务项 (我们也支持大写的 `X`)

## 选项

::: fields
@`disabled` type=boolean default=`true`

是否禁用 checkbox。

@`label` type=boolean default=`true`

是否使用 `<label>` 来包裹文字。

@`containerClass` type=string default=`'task-list-container'`

tasklist 容器的 class。

@`itemClass` type=string default=`'task-list-item'`

tasklist item 的 class。

@`labelClass` type=string default=`'task-list-item-label'`

tasklist item label 的 class。

@`checkboxClass` type=string default=`'task-list-item-checkbox'`

tasklist item checkbox 的 class。

:::

## 示例

::: preview 示例

- [ ] 计划 A
- [x] 计划 B

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-task-checkbox`](https://www.npmjs.com/package/markdown-it-task-checkbox) `1.0.6` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     21 |        7 |           13 |          1 |

以下用例是已记录的差异：

- `marker-as-link-reference` — The marker also resolves as a link reference: the current package removes the three parsed marker tokens, while the reference only strips the first text token, leaving the link markup inside the item.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       14,640 |       14,664 | 1.00× |
| normal/medium |        2,058 |        2,042 | 1.01× |
| normal/large  |          516 |          510 | 1.01× |
| heavy/small   |        6,656 |        6,428 | 1.04× |
| heavy/medium  |        1,178 |        1,067 | 1.10× |
| heavy/large   |          261 |          161 | 1.62× |

几何平均吞吐量比值：1.11×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列            | 输入规模                 | 当前拟合指数 | 参考拟合指数 |
| --------------- | ------------------------ | -----------: | -----------: |
| long-task-items | 64 / 128 / 256 / 512     |        ~1.00 |        ~1.11 |
| many-lists      | 64 / 128 / 256 / 512     |        ~1.00 |        ~1.18 |
| many-task-items | 512 / 1024 / 2048 / 4096 |        ~1.02 |        ~1.62 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                      | 解压体积 | 入口 gzip |
| --------------------------------------- | -------: | --------: |
| @mdit/plugin-tasklist（当前）           |  27.4 kB |     731 B |
| markdown-it-task-checkbox@1.0.6（参考） |  76.9 kB |    1.4 kB |

### 说明

- `ulClass` / `liClass` are mapped to `containerClass` / `itemClass` with the reference defaults (`task-list` / `task-list-item`); `divWrap` stays `false` and `disabled` stays `true` on the reference side.
- Both packages label the item text, but the structure differs by design: the current package nests the checkbox inside `<label class="task-list-item-label">` and emits no ids, while the reference emits `<input id="cbx_N"><label for="cbx_N">`. Normalization unwraps the label tags and removes the generated `cbx_*` ids, so the compared part is the list structure, container/item classes, checkbox state and item text.
- `checkboxClass` is set to an empty string because the reference emits no class on the checkbox; the resulting empty `class` attribute is normalized away. The current package's extra `labelClass` is not observable after the label tags are normalized.
- `checked="checked"` / `disabled="disabled"` and the reference `checked="true"` / `disabled="true"` are equivalent boolean attributes; the normalizer canonicalizes them to the bare attribute.
- Scaling: the reference locates the parent list token with a backward scan through the token stream for every task item, which is quadratic in the number of items in one list; the current package records the last token index per nesting level in one forward pass and stays linear. `many-task-items` exposes the difference.
- Attribute order is normalized.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
