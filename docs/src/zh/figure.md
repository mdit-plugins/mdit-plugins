---
title: "@mdit/plugin-figure"
shortTitle: "plugin-figure"
icon: image
---

生成带有标题的图片插件。

<!-- more -->

## 使用

```ts
import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(figure, {
  // 你的选项，可选的
});

mdIt.render("![image](https://example.com/image.png)");
```

## 语法

有时，你可能希望为图像添加描述，并将其单独展示在上下文中，所以我们提供了此插件

当你单独将图片至于一行 (也可同时嵌套链接)，图像将显示为 `<figure>` ，标题或图片替代文字将显示为 `<figcaption>`。

## 选项

::: fields
@`moveAttrs` type=`boolean | (string | RegExp)[]` default=`false`

将图片属性复制或移动到 `<figure>` 上。

- `true`：**复制**除原生 img 属性（src、alt、srcset、width、height、loading 等）外的所有属性到 `<figure>`，图片保留这些属性。
- `(string | RegExp)[]`：**移动**仅匹配的属性到 `<figure>`，图片失去这些属性。

原生 img 属性（src、alt、title、width、height 等）永远不会被移动或复制到 `<figure>` 上，且 `title` 始终作为 `<figcaption>` 内容显示。

当 `<figure>` 已有 `class` 或 `style` 属性时，图片的值会合并进去：`class` 会去重，`style` 声明会用 `;` 连接（空声明会被丢弃）。合并重复的键时，属性名按不区分大小写比较。其他重复的属性会被忽略，保留 figure 原有的值。

```ts
// 复制所有非原生属性到 figure（img 保留）
moveAttrs: true;

// 将 class 和 data-* 属性移动到 figure（img 失去）
moveAttrs: ["class", /^data-/];
```

@`focusable` type=boolean default=`true`

图片是否可聚焦。启用时会为图片添加 `tabindex="0"`，除非图片已带有 `tabindex` 属性，此时会保留原有值。

@`linkImage` type=boolean default=`true`

是否将链接图片 (`[![image](url)](link)`) 转换为 figure。

:::

## 示例

::: preview 示例

![Logo](/favicon.ico)

[![Logo](/favicon.ico)](https://commonmark.org/)

![Logo](/favicon.ico "Markdown")

[![Logo](/favicon.ico "Markdown")](https://commonmark.org/)

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-image-figures`](https://www.npmjs.com/package/markdown-it-image-figures) `2.1.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     21 |       18 |            0 |          3 |

以下用例是已记录的差异：

- `figure-alt-only` — The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.
- `linked-image-alt-only` — The current package falls back to the alt text as the caption, while the reference emits no `<figcaption>` for `figcaption: "title"`.
- `tight-list-image` — The current package skips images inside hidden (tight list) paragraphs, so the paragraph is untouched; the reference converts it and emits a `<figcaption>` without a `<figure>` wrapper.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       14,215 |       14,199 | 1.00× |
| normal/medium |        2,447 |        2,438 | 1.00× |
| normal/large  |          562 |          570 | 0.99× |
| heavy/small   |        9,527 |        9,588 | 0.99× |
| heavy/medium  |        1,644 |        1,597 | 1.03× |
| heavy/large   |          377 |          361 | 1.04× |

几何平均吞吐量比值：1.01×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列           | 输入规模             | 当前拟合指数 | 参考拟合指数 |
| -------------- | -------------------- | -----------: | -----------: |
| linked-figures | 64 / 128 / 256 / 512 |        ~1.00 |        ~1.01 |
| long-captions  | 64 / 128 / 256 / 512 |        ~1.00 |        ~1.00 |
| many-figures   | 64 / 128 / 256 / 512 |        ~1.11 |        ~1.01 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                                      | 解压体积 | 入口 gzip |
| --------------------------------------- | -------: | --------: |
| @mdit/plugin-figure（当前）             |  37.8 kB |    1.1 kB |
| markdown-it-image-figures@2.1.1（参考） |  22.7 kB |     972 B |

### 说明

- `focusable` is disabled because the current package adds `tabindex="0"` to the image, while the reference `tabindex` option numbers figures from `1`; the reference option is therefore not used.
- The current package derives `<figcaption>` from the image `title` and falls back to the `alt` text; `markdown-it-image-figures` has no fallback mode, so `figcaption: "title"` is compared and alt-only images are documented as a difference.
- The current package skips hidden paragraphs (tight list items) so that a `<figcaption>` is never emitted without its `<figure>` wrapper; the reference converts images in tight list items without a `<figure>` wrapper. Documented in `tight-list-image`.
- `moveAttrs` is not compared: for `true` the current package copies non-native image attributes to `<figure>` and keeps them on the image, for a pattern list it moves them (the image loses them), and it merges `class`/`style` values. The reference `copyAttrs` copies every matching attribute to `<figure>` and keeps the original order on the image, which is not equivalent.
- Reference-only options (`dataType`, `link`, `tabindex`, `lazy`, `async`, `classes`, `removeSrc`) have no equivalent and are not compared.
- Scaling: the reference core rule walks the token stream once and calls `md.parseInline` once per caption, so the work is linear in the document size and caption length; all three series measure ~1 (no superlinear behavior was found in the upstream implementation).
- Attribute order is normalized.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
