---
title: "@mdit/plugin-container"
shortTitle: "plugin-container"
icon: box-open
---

用于创建块级自定义容器的插件。

<!-- more -->

## 使用

```ts
import { container } from "@mdit/plugin-container";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(container, {
  // your options, name is required
  name: "warning",
});

mdIt.render(`
::: warning

Warning Text

:::
`);
```

## 语法

使用此插件，你可以创建块容器，例如:

```md
::: warning
_here be dragons_
:::
```

并指定它们应该如何呈现。如果没有定义渲染器，将创建带有容器名称 class 的 `<div>`：

```html
<div class="warning">
  <em>here be dragons</em>
</div>
```

标记与代码块相同。但是默认情况下，插件使用另一个字符作为标记并且内容由插件呈现为 Markdown 标记。

::::: tip 嵌套和转义

- 嵌套可以通过增加外层容器的 marker 数量完成:

  ```md
  :::: warning
  警告内容内容...

  ::: details
  详情...
  :::
  ::::
  ```

  会被渲染为

  :::: warning
  警告内容内容...

  ::: details
  详情...
  :::
  ::::

- 转义可以通过在 marker 前添加 `\` 转义来完成:

  ```md
  \::: warning

  :::
  ```

  会被渲染为

  \::: warning

  :::

:::::

## 选项

::: fields
@`name` type=string required

容器名称。

@`marker` type=string default=`":"`

容器标识符。

@`validate` type=Validator

```ts
/**
 * 校验内容是否应该作为此类型容器
 *
 * @default params.trim().split(" ", 2)[0] === name
 * @param params 标识符后面的内容
 * @param markup 标识字符
 * @returns 是否是此容器类型
 */
type Validator = (params: string, markup: string) => boolean;
```

校验内容是否应该作为此类型容器。

@`openRenderer` type=RendererRule

<!-- @include: ../render-rule.snippet.md -->

开始标签渲染函数。

@`closeRenderer` type=RendererRule

<!-- @include: ../render-rule.snippet.md -->

结束标签渲染函数。

:::

## 示例

### 提示容器

通过添加下列代码和一些样式:

```js
import { escapeHtml } from "@mdit/helper";

md.use(container, {
  name: "hint",
  openRenderer: (tokens, index, _options) => {
    const info = tokens[index].info.trim().slice(4).trim();

    return `<div class="custom-container hint">\n<p class="custom-container-title">${
      escapeHtml(info) || "Hint"
    }</p>\n`;
  },
});
```

::: warning 不可信输入

自定义容器标题来自文档内容，因此渲染为 HTML 时必须进行 HTML 转义；上面的示例使用 `escapeHtml` 进行转义。

:::

:::: preview 你可以这样写一个提示:

::: hint 这是一个提示

:::

::: hint

这是一个为你准备的**提示**!

- 提示 1
  - 提示 1.1
  - 提示 1.2
- 提示 2

:::

::::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-container`](https://www.npmjs.com/package/markdown-it-container) `4.0.0` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     23 |       20 |            0 |          3 |

以下用例是已记录的差异：

- `indented-opening` — The current package requires the closing marker to be indented exactly like the opening marker (both are 2 columns here, then 0), so the container stays unclosed; the reference accepts the unindented closing marker and closes it.
- `indented-closing` — The reference accepts a closing marker indented by less than four columns; the current package requires the closing marker to be indented exactly like the opening marker, so it keeps the `:::` line as container content.
- `indented-closing-after-blank` — Same closing-marker rule as `indented-closing`: the reference closes the empty container, while the current package renders the indented marker as a paragraph inside it.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       11,219 |       11,117 | 1.01× |
| normal/medium |        2,173 |        2,151 | 1.01× |
| normal/large  |          556 |          562 | 0.99× |
| heavy/small   |        6,945 |        7,044 | 0.99× |
| heavy/medium  |        1,012 |          838 | 1.21× |
| heavy/large   |          293 |          293 | 1.00× |

几何平均吞吐量比值：1.03×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列                     | 输入规模               | 当前拟合指数 | 参考拟合指数 |
| ------------------------ | ---------------------- | -----------: | -----------: |
| deeply-nested-containers | 128 / 256 / 512 / 1024 |        ~1.00 |        ~1.65 |
| non-matching-containers  | 128 / 256 / 512 / 1024 |        ~1.00 |        ~1.00 |
| sibling-containers       | 128 / 256 / 512 / 1024 |        ~1.00 |        ~1.00 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                  | 解压体积 | 入口 gzip |
| ----------------------------------- | -------: | --------: |
| @mdit/plugin-container（当前）      |  37.0 kB |    1.1 kB |
| markdown-it-container@4.0.0（参考） |  20.1 kB |    1.4 kB |

### 说明

- The current package takes a required `name` option object, while the reference takes the container name as a positional argument; both sides are installed through custom renderers so that two equivalent containers are registered (`warning` with the default `:` marker and `spoiler` with the `%` marker).
- The current package does not need `openRenderer` / `closeRenderer` to be compared: both are user render functions with no reference counterpart. The default renderer output (the container class on the opening `<div>`) is compared.
- `indented-opening`, `indented-closing` and `indented-closing-after-blank` are expected differences: the current package only accepts a closing marker indented exactly like the opening marker, while the reference accepts any closing marker indented less than four columns relative to the enclosing block, so the reference closes those blocks and the current package keeps the marker as content.
- Both custom renderers raise markdown-it's `maxNesting` to 10,000; the default cap of 100 limits how deeply containers can nest and would hide the closing-marker scan of the `deeply-nested-containers` series. The reference rescans the remaining lines for every nesting level and grows quadratically; the current package reuses the enclosing scan and stays linear. The benchmark corpora are shallow, so throughput is unaffected.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
