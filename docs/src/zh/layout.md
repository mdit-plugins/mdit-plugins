---
title: "@mdit/plugin-layout"
icon: table-columns
---

用于创建 Flexbox、CSS Grid 和多列布局的指令式插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { layout } from "@mdit/plugin-layout";

const mdIt = MarkdownIt().use(layout);

mdIt.render(`\
@flexs gap-4
@flex
左侧内容
@flex
右侧内容
@end
`);
```

## 格式

插件使用基于指令的语法，采用"复数表示容器、单数表示子项"的约定:

| 布局模式     | 容器       | 子项      | 关闭   |
| :----------- | :--------- | :-------- | :----- |
| **弹性盒**   | `@flexs`   | `@flex`   | `@end` |
| **CSS 网格** | `@grids`   | `@grid`   | `@end` |
| **多列**     | `@columns` | `@column` | `@end` |

### 属性注入

指令支持直接附加在指令名称上的类和 ID 选择器:

```md
@flexs.nav#top gap-4 items-center
```

- `.class-name` 添加 CSS 类
- `#id` 添加 HTML id
- 选择器后的空格分隔文本是工具类，会被映射为内联样式

### 嵌套

嵌套容器必须缩进 2 或 3 个空格。缩进量必须不小于父子项内第一行内容的缩进量（首行锚定法）:

```md
@grids grid-cols-2
@grid
内容在这里
@flexs flex-col
@flex
嵌套内容
@end
@grid
外层内容
@end
```

::: warning 缩进规则

- 嵌套容器缩进必须为 **2 或 3 个空格**
- 缩进必须 **≥ 子项内第一行内容的缩进量**
- **4 个及以上空格** 会触发 Markdown 代码块（CommonMark）

:::

## 支持的工具类

### 弹性盒

- **方向**: `flex-row`、`flex-col`、`flex-row-reverse`、`flex-col-reverse`
- **换行**: `flex-wrap`、`flex-nowrap`、`flex-wrap-reverse`
- **弹性**: `flex-1`、`flex-auto`、`flex-initial`、`flex-none`
- **增长/收缩**: `grow`、`grow-0`、`shrink`、`shrink-0`
- **排序**: `order-{n}`、`order-first`、`order-last`、`order-none`

### 网格

- **列**: `grid-cols-{n}`、`grid-cols-none`
- **行**: `grid-rows-{n}`、`grid-rows-none`
- **跨越**: `col-span-{n}`、`col-span-full`、`row-span-{n}`、`row-span-full`
- **起止**: `col-start-{n}`、`col-end-{n}`、`row-start-{n}`、`row-end-{n}`
- **自动流**: `grid-flow-row`、`grid-flow-col`、`grid-flow-dense`、`grid-flow-row-dense`、`grid-flow-col-dense`
- **自动尺寸**: `auto-cols-auto`、`auto-cols-min`、`auto-cols-max`、`auto-cols-fr`、`auto-rows-auto`、`auto-rows-min`、`auto-rows-max`、`auto-rows-fr`

### 间距与对齐

- **间距**: `gap-{n}`、`gap-x-{n}`、`gap-y-{n}`、`gap-px`、`gap-x-px`、`gap-y-px`
- **主轴对齐**: `justify-start`、`justify-end`、`justify-center`、`justify-between`、`justify-around`、`justify-evenly`、`justify-stretch`
- **项目/自身对齐**: `justify-items-{value}`、`justify-self-{value}`
- **交叉轴对齐**: `items-{value}`、`self-{value}`、`content-{value}`
- **放置**: `place-content-{value}`、`place-items-{value}`、`place-self-{value}`

### 多列

- **列数**: `columns-{n}`
- **断裂**: `break-after-{value}`、`break-before-{value}`、`break-inside-{value}`
- **跨列**: `.span-all` 类映射为 `column-span: all`

### 其他

- **宽高比**: `aspect-auto`、`aspect-square`、`aspect-video`

## 选项

默认包（`@mdit/plugin-layout`）将工具类转换为内联 CSS 样式。如需配合 Tailwind CSS 或自定义样式表使用，请使用精简包:

```ts
import MarkdownIt from "markdown-it";
import { layoutSlim } from "@mdit/plugin-layout/slim";

const mdIt = MarkdownIt().use(layoutSlim);
```

精简包将工具类作为 CSS 类名传递，而不是转换为内联样式。

## 示例

### 弹性盒布局

```md
@flexs gap-4 items-center
@flex flex-1

### 左列

此内容会增长以填充可用空间。
@flex

### 右列

此内容使用其自然宽度。
@end
```

### 网格布局

```md
@grids.gallery grid-cols-3 gap-8
@grid

### 项目 1

标准内容。
@grid col-span-2

### 项目 2

此项目跨越两列。
@grid

### 项目 3

更多内容。
@end
```

### 多列布局

```md
@columns columns-3 gap-6
@column

# 简介

文本自然流动。
@column.span-all

## 跨列标题

此标题跨越所有列。
@column

# 总结

最后的说明。
@end
```
