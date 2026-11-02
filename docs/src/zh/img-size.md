---
title: "@mdit/plugin-img-size"
shortTitle: "plugin-img-size"
icon: up-right-and-down-left-from-center
---

支持设置图片尺寸的插件。

<!-- more -->

## 使用

```ts
import { legacyImgSize, imgSize, obsidianImgSize } from "@mdit/plugin-img-size";
import MarkdownIt from "markdown-it";

// 新格式
const mdNew = new MarkdownIt().use(imgSize);
mdNew.render("![image =300x200](https://example.com/image.png)");

// Obsidian 格式
const mdObsidian = new MarkdownIt().use(obsidianImgSize);
mdObsidian.render("![image|300x200](https://example.com/image.png)");

// 旧格式
const mdLegacy = new MarkdownIt().use(legacyImgSize);
mdLegacy.render("![image](https://example.com/image.png =300x200)");
```

## 语法

### 新语法

在图片替代文字后面添加 `=widthxheight`，并用空格分隔。

`width` 和 `height` 都应该是数字，单位为像素，并且都是可选的。也支持单个尾随 `%` 以使用百分比，设置为 `0` 的维度将被视为未指定，宽度和高度都为 `0` 的尺寸将被忽略。

```md
![替代文字 =200x300](/example.png)
![替代文字 =200x](/example.jpg "标题")
![替代文字 =x300](/example.bmp)
![替代文字 =50%x300](/example.webp)
```

渲染为 ↓

```html
<img src="/example.png" alt="替代文字" width="200" height="300" />
<img src="/example.jpg" alt="替代文字" title="标题" width="200" />
<img src="/example.bmp" alt="替代文字" height="300" />
<img src="/example.webp" alt="替代文字" width="50%" height="300" />
```

### Obsidian 语法

在图片替代文字后面添加 `widthxheight`，并用 `|` 分隔。

`width` 和 `height` 都应该是数字，单位为像素，并且都是必需的。设置其中一个为 `0` 以按比例缩放另一个。

```md
![替代文字|200x200](/example.png)
![替代文字|200x0](/example.jpg)
![替代文字|0x300](/example.bmp)
```

渲染为 ↓

```html
<img src="/example.png" alt="替代文字" width="200" height="200" />
<img src="/example.jpg" alt="替代文字" width="200" />
<img src="/example.bmp" alt="替代文字" height="300" />
```

### 旧语法 (已废弃)

::: warning 这种语法可能会在 GitHub 等平台上导致渲染问题。

:::

在图片链接部分的末尾添加 `=widthxheight`，并用空格分隔。

`width` 和 `height` 都应该是数字，单位为像素，并且都是可选的。也支持单个尾随 `%` 以使用百分比，设置为 `0` 的维度将被视为未指定，宽度和高度都为 `0` 的尺寸将被忽略。

```md
![替代文字](/example.png =200x300)
![替代文字](/example.jpg "标题" =200x)
![替代文字](/example.bmp =x300)
![替代文字](/example.webp =50%x300)
```

渲染为 ↓

```html
<img src="/example.png" alt="替代文字" width="200" height="300" />
<img src="/example.jpg" alt="替代文字" title="标题" width="200" />
<img src="/example.bmp" alt="替代文字" height="300" />
<img src="/example.webp" alt="替代文字" width="50%" height="300" />
```

::: tip 在三种语法之间选择

- 旧语法在不支持的环境中会导致图片渲染问题（例如：GitHub）
- 新语法和 Obsidian 语法都与 Markdown 标准兼容，但新语法更自然。

:::

## 示例

::: preview 示例

<!-- 新语法 -->

![Logo =200x200](/logo.svg "Markdown")
![Logo =150x](/logo.svg "Markdown")
![Logo =x100](/logo.svg "Markdown")
![Logo =50%x300](/logo.svg "Markdown")

<!-- 旧语法 -->

![Logo](/logo.svg "Markdown" =200x200)
![Logo](/logo.svg "Markdown" =150x)
![Logo](/logo.svg "Markdown" =x100)
![Logo](/logo.svg "Markdown" =50%x300)

<!-- Obsidian 语法 -->

![Logo|200x200](/logo.svg)
![Logo|150x0](/logo.svg)
![Logo|0x100](/logo.svg)

:::

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-imsize`](https://www.npmjs.com/package/markdown-it-imsize) `2.0.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     25 |       19 |            0 |          6 |

以下用例是已记录的差异：

- `zero-width` — The current package drops a `0` width (treated as unspecified), the reference emits `width="0"`.
- `zero-height` — The current package drops a `0` height (treated as unspecified), the reference emits `height="0"`.
- `zero-both` — The current package rejects an all-zero size and leaves the markdown unparsed as an image, the reference renders the image with `width="0" height="0"`.
- `zero-percent-width` — The current package treats `0%` as an unspecified width, the reference emits `width="0%"`.
- `percent-in-middle` — The reference number scanner accepts `%` anywhere in a dimension, while the current package only accepts one trailing `%`.
- `tab-before-size` — The current package accepts a tab before the size, the reference only accepts a literal space.

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       18,139 |       18,221 | 1.00× |
| normal/medium |        2,169 |        2,189 | 0.99× |
| normal/large  |          568 |          573 | 0.99× |
| heavy/small   |       15,608 |       16,314 | 0.96× |
| heavy/medium  |        2,014 |        2,102 | 0.96× |
| heavy/large   |          552 |          575 | 0.96× |

几何平均吞吐量比值：0.98×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列             | 输入规模             | 当前拟合指数 | 参考拟合指数 |
| ---------------- | -------------------- | -----------: | -----------: |
| malformed-sizes  | 64 / 128 / 256 / 512 |        ~1.02 |        ~1.02 |
| sized-images     | 64 / 128 / 256 / 512 |        ~1.01 |        ~1.01 |
| unmatched-labels | 64 / 128 / 256 / 512 |        ~1.19 |        ~1.19 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                               | 解压体积 | 入口 gzip |
| -------------------------------- | -------: | --------: |
| @mdit/plugin-img-size（当前）    |  87.2 kB |    1.8 kB |
| markdown-it-imsize@2.0.1（参考） | 638.1 kB |    1.6 kB |

### 说明

- Only the deprecated `legacyImgSize` variant is compared: `imgSize` (`![alt =100x200](url)`) and `obsidianImgSize` (`![alt|100x200](url)`) are extensions of this package with no equivalent in `markdown-it-imsize`.
- The current package treats a dimension whose numeric value is `0` as unspecified and rejects a size whose width and height are both `0`; the reference emits the literal `0`. `zero-width`, `zero-height`, `zero-both` and `zero-percent-width` document this.
- The current package accepts a single trailing `%` per dimension (the documented syntax); the reference's number scanner accepts `%` anywhere, so `=5%0x3%0` is parsed by the reference only. Documented in `percent-in-middle`.
- The current package accepts any whitespace before the size specification, while the reference requires a literal space (its check is `charCodeAt(pos - 1) === 0x20`); `tab-before-size` is therefore parsed by the current package only.
- The reference `autofill` option is not compared: it reads image files from disk (`image-size`) and its output depends on the filesystem.
- Scaling: the reference image rule re-attempts `parseLinkLabel` for every `![` opener and parses every label again; malformed sizes fall back to the core image rule. markdown-it caches `skipToken` positions, so all series stay ~linear (no superlinear behavior was found in the upstream implementation).
- Attribute order is normalized.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
