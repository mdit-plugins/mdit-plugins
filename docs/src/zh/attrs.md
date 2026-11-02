---
title: "@mdit/plugin-attrs"
shortTitle: "plugin-attrs"
icon: tags
---

用于向 Markdown 内容添加属性的插件。

<!-- more -->

## 使用

```ts
import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(attrs, {
  // 你的选项，可选
});

mdIt.render("# Heading 🎉{#heading}");
```

## 语法

你可以使用语法 `{attrs}` 来为 Markdown 元素添加属性。

比如，如果你想要一个 id 为 say-hello-world，文字为 Hello World 的二级标题，你可以使用:

```md
## Hello World {#say-hello-world}
```

如果你想要一个有 full-width Class 的图片，你可以使用:

```md
![img](link/to/image.png){.full-width}
```

同时，其他属性也收到支持:

```md
一个包含文字的段落。 {#p .a .b align=center customize-attr="content with spaces"}
```

会被渲染为:

```html
<p id="p" class="a b" align="center" customize-attr="content with spaces">一个包含文字的段落。</p>
```

::: tip 转义

转义可以通过使用 `\` 来转义标识符来完成:

```md
### 标题 \{#heading}
```

会被渲染为

### 标题 \{#heading}

当属性从原始字符串解析时（例如 `parseAttrs()` 或围栏信息串），带引号的值中 `\"` 与 `\\` 会分别产生字面量 `"` 和 `\`；其他反斜杠（以及不带引号的值中的反斜杠）会原样保留。标题/段落上的行内属性在 markdown-it 的行内转义规则之后处理，因此其中的转义引号不会由本插件反转义。

:::

::: warning 安全

由于属性来自 Markdown 内容，`@mdit/plugin-attrs` 会丢弃可能执行脚本的属性：

- 事件处理器属性，即名称以 `on` 开头的属性（大小写不敏感），例如 `onclick`、`onerror`；
- 值使用危险 URL scheme（`javascript:`、`vbscript:` 或 `file:`）的 URL 属性（`href`、`src`、`action`、`formaction`、`poster`、`srcset`、`xlink:href` 等），包括用前导控制字符、制表符或换行混淆的写法；
- markdown-it 允许的图片 data URL（`data:image/gif;`、`data:image/png;`、`data:image/jpeg;`、`data:image/webp;`）之外的 `data:` URL 属性，如 `data:text/html`、`data:image/svg+xml` 会被丢弃。

URL 属性策略与 markdown-it 内置的链接校验一致。该过滤始终生效，即使属性出现在 `allowed` 中也会被丢弃，`parseAttrs` 行为一致。其他属性如 `class`、`id`、`style`、`aria-*`、`data-*` 不受影响。

插件不会清洗你通过 markdown-it 的 `html` 选项显式启用的 HTML。请只对可信 Markdown 启用 attrs，或在不可信场景通过 `allowed` 限制可生成的属性。

:::

## 选项

你可以向 `@mdit/plugin-attrs` 传递选项以自定义插件行为。

::: fields
@`rule` type=`"all" | boolean | MarkdownItAttrRuleName[]` default=`"all"`

启用的规则。

```ts
type MarkdownItAttrRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "hr"
  | "heading"
  | "softbreak"
  | "blockInfo"
  | "blockEnd"
  // legacy alias of "blockEnd"
  | "block"
  // opt-in, excluded from "all"
  | "tasklist"
  | "dl";
```

默认值为 `"all"`，这会启用所有规则。这是最重要的选项，因为它控制哪些 Markdown 元素将启用属性功能，并影响插件的性能。

如果你只需要为标题添加 id 属性（在大多数情况下），你应该设置 `rule: ["heading"]` 来只为标题启用属性功能。

`fence` 规则仅作用于代码块，而 `blockInfo` 规则作用于其他在信息行上携带属性的块级 token（例如 `@mdit/plugin-container` 的容器）。`blockEnd` 规则作用于写在块级元素末尾的属性，`block` 是它的旧别名。

`tasklist` 规则为将列表项内容包裹在 label 中的任务列表插件（例如 `@mdit/plugin-tasklist`）提供属性支持。任务列表不属于 markdown-it 核心语法，因此该规则需要在规则数组中显式启用，不包含在 `"all"` 中。`dl` 规则同样为定义列表（例如 `@mdit/plugin-dl`）提供支持，其定义内容被段落包裹，属性对其他规则不可见。

@`allowed` type=`(string | RegExp)[] | AllowedAttrEntry[]` default=`[]`

允许的属性。

设置空数组意味着允许所有属性。

危险属性（见上方安全警告）即使出现在此处也会被丢弃。

```ts
interface AllowedAttrEntry {
  name: string | RegExp;
  value?: (string | RegExp)[];
}
```

可以使用简单格式 `(string | RegExp)[]` 仅按属性名过滤：

```ts
// 只允许 class 和 id 属性
allowed: ["class", "id"];
```

或使用条目格式 `AllowedAttrEntry[]` 按属性名独立约束允许的值：

```ts
allowed: [
  { name: "referrerpolicy", value: ["no-referrer", "no-referrer-when-downgrade"] },
  { name: /^data-/, value: ["true", "false"] },
  { name: "class" }, // 允许 class，不限值
];
```

@`fenceAttrsOnPre` type=boolean default=`true`

将代码块属性放在 `<pre>` 上而非 `<code>` 上。

启用后，代码块的属性（如 ` ```js {data-file="index.js"} `）会从 `<code>` 移到外层 `<pre>` 标签。若已安装自定义代码块渲染器则跳过。

@`left` type=string default=`'{'`

属性左分隔符。

@`right` type=string default=`'}'`

属性右分隔符。

:::

## 编程式解析

包导出了 `parseAttrs` 工具函数，以便其他工具 (如 shiki transformer) 复用属性解析逻辑：

```ts
import { parseAttrs } from "@mdit/plugin-attrs";

parseAttrs("foo {.bar #baz data-a=b}");
// [["class", "bar"], ["id", "baz"], ["data-a", "b"]]

parseAttrs("foo"); // null
```

`parseAttrs(content, options)` 返回解析出的 `[key, value]` 属性元组，未找到有效属性部分时返回 `null`。有效属性部分未解析出任何属性（如全部被 `allowed` 过滤）时返回空数组。除了与插件选项行为一致的 `left`、`right` 和 `allowed` 外，还支持额外的 `where` 选项：

::: fields
@`where` type=`"start" | "end" | "only"` default=`"end"`

属性部分在内容中的位置：位于开头、位于结尾，或内容仅包含属性部分。

:::

## 示例

> 所有的 class 都使用 `margin: 4px;padding: 4px;border: 1px solid red;` 进行显示以展示效果。

::: preview 行内元素

包含 `行内代码`{.inline-code} 和 ![favicon](/favicon.ico){.image} 的文字，也支持 _强调_{.inline-emphasis} 和 **加粗**{.inline-bold}。

:::

::: preview 块级元素

块级元素 {.block}

:::

::: preview 代码块

```js {.fence}
const a = 1;
```

:::

> 此处没有红色边框：文档使用的语法高亮会替换 fence 渲染器并丢弃这些属性，大多数代码高亮方案都是如此。

::: preview 表格

| A                        | B   | C   | D              |
| ------------------------ | --- | --- | -------------- |
| A1                       | B1  | C1  | D1 {rowspan=3} |
| A2 {colspan=2 rowspan=2} | B2  | C2  | D2             |
| A3                       | B3  | C3  | D3             |

{.table border=1}

:::

::: preview 列表

- 列表内容{.list-item}
  - 嵌套列表内容
    {.nested}

{.list-wrapper}

:::

::: preview 水平线

--- {.horizontal}

:::

::: preview 换行

一行换行的文字  
{.break}

:::

<style scoped>
.block,
.break,
.horizontal,
.image,
.inline-code,
.list-wrapper,
.list-item,
.nested,
.inline-emphasis,
.inline-bold,
.table,
.fence {
  margin: 4px;
  padding: 4px;
  border: 1px solid red;
}
</style>

<!-- comparison:start -->

## 对比

与上游 [`markdown-it-attrs`](https://www.npmjs.com/package/markdown-it-attrs) `5.0.1` 包对比。基准测试运行于 Node.js v26.13.0, Apple M4 (darwin arm64)，测量日期为 2026-11-02。下表由仓库提交的对比数据生成。

### 正确性

| 用例数 | 完全一致 | 规范化后一致 | 已记录差异 |
| -----: | -------: | -----------: | ---------: |
|     20 |       20 |            0 |          0 |

20 个用例的输出与参考包完全一致。

### 基准性能

| 用例          | 当前 (ops/s) | 参考 (ops/s) |  比值 |
| ------------- | -----------: | -----------: | ----: |
| normal/small  |       19,682 |       18,961 | 1.04× |
| normal/medium |        5,147 |        4,863 | 1.06× |
| normal/large  |        1,757 |        1,676 | 1.05× |
| heavy/small   |        8,870 |        8,658 | 1.02× |
| heavy/medium  |        2,289 |        2,228 | 1.03× |
| heavy/large   |          759 |          739 | 1.03× |

几何平均吞吐量比值：1.04×（共 6 个用例）；大于 1× 表示当前包更快。

### 复杂度缩放

| 系列             | 输入规模             | 当前拟合指数 | 参考拟合指数 |
| ---------------- | -------------------- | -----------: | -----------: |
| heading-attrs    | 64 / 128 / 256 / 512 |        ~1.07 |        ~1.09 |
| inline-attrs     | 64 / 128 / 256 / 512 |        ~0.91 |        ~0.94 |
| unmatched-braces | 64 / 128 / 256 / 512 |        ~0.73 |        ~0.74 |

拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。

### 包体积

| 包                              | 解压体积 | 入口 gzip |
| ------------------------------- | -------: | --------: |
| @mdit/plugin-attrs（当前）      | 240.6 kB |    4.6 kB |
| markdown-it-attrs@5.0.1（参考） | 423.4 kB |    2.6 kB |

### 说明

- `fenceAttrsOnPre` is set to `false` on the current package so that fence attrs are placed on `<code>`, matching the reference default.
- Table extension rules (`rowspan` / `colspan` cells) are not compared because the reference does not implement them.
- 包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。
- 入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。
- 基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。

<!-- comparison:end -->
