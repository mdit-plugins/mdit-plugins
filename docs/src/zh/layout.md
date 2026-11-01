---
title: "@mdit/plugin-layout"
shortTitle: "plugin-layout"
icon: table-cells-large
---

用于创建 Flexbox、CSS Grid 和多列布局的指令式插件。

重复安装插件不会产生效果：首次安装的选项、解析规则与渲染器会继续生效。

<!-- more -->

## 使用

```ts
import { layout } from "@mdit/plugin-layout";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(layout);

mdIt.render(`\
@flexs gap-4
@flex
左侧内容
@flex
右侧内容
@end
`);
```

## 语法

插件使用基于指令的语法，采用"复数表示容器、单数表示子项"的约定:

| 布局模式     | 容器       | 子项      | 关闭   |
| :----------- | :--------- | :-------- | :----- |
| **弹性盒**   | `@flexs`   | `@flex`   | `@end` |
| **CSS 网格** | `@grids`   | `@grid`   | `@end` |
| **多列**     | `@columns` | `@column` | `@end` |

在另一个布局容器之外，可以使用任意正整数个前导 `@` 开启容器，例如 `@flexs`、`@@flexs` 或 `@@@flexs`。这个数量就是容器的标记数：子项和关闭容器的 `@end` 必须使用完全相同的数量。

### 属性注入

指令支持直接附加在指令名称上的类和 ID 选择器:

```md
@flexs.nav#top gap-4 items-center
```

- `.class-name` 添加 CSS 类
- `#id` 添加 HTML id
- 选择器后的空格分隔文本是工具类，会被映射为内联样式

### 嵌套

嵌套时，内层容器使用比外层**更少**的前导 `@`。外层 `@@flexs` 可以包含内层 `@grids`，而子项和 `@end` 始终使用各自容器的标记数:

```md
@@flexs
@@flex
@grids grid-cols-2
@grid
嵌套内容
@end
@@end
```

三层嵌套遵循同样的规则：`@@@flexs` 包裹 `@@flexs`，后者再包裹 `@grids`:

```md
@@@flexs
@@@flex
@@flexs
@@flex
@grids grid-cols-2
@grid
深层内容
@end
@@end
@@@end
```

内层容器的标记数必须小于外层。在 `@flexs` 中，`@grids` 与 `@@grids` 都会被解析为普通文本:

```md
@flexs
@flex
@grids
@grid
@@grids
@@grid
这段内容只是普通文本，不是嵌套的网格。
@end
```

指令行可以相对当前块缩进 0-3 个空格，缩进仅用于装饰。缩进 4 个及以上空格的行属于缩进代码块或段落惰性续行，永远不会开启指令，这与 CommonMark 一致。

没有匹配 `@end` 的容器会在父块结束时自动关闭。反缩进到父块之外的内容（例如列表内布局块之后的顶格行）会正常交由父级解析。在同一块级层级中（例如嵌套容器或列表项内；带 `>` 前缀的行除外），同类型的子项标记，或 `@` 数量与某个外层容器相同的 `@end` 会被当作边界；不要在这些位置将它们作为普通文本书写。

## 支持的工具类

### 弹性盒

@flexs flex-wrap gap-8

@flex

**方向**：

- `flex-row`
- `flex-col`
- `flex-row-reverse`
- `flex-col-reverse`

@flex

**换行**:

- `flex-wrap`
- `flex-nowrap`
- `flex-wrap-reverse`

@flex

**弹性**:

- `flex-1`
- `flex-auto`
- `flex-initial`
- `flex-none`

@flex

**增长/收缩**:

- `grow`
- `grow-0`
- `shrink`
- `shrink-0`

@flex

**排序**:

- `order-{n}`
- `order-first`
- `order-last`
- `order-none`

@end

### 网格

@flexs flex-wrap gap-8

@flex

**列**:

- `grid-cols-{n}`
- `grid-cols-none`

@flex

**行**:

- `grid-rows-{n}`
- `grid-rows-none`

@flex

**跨越**:

- `col-span-{n}`
- `col-span-full`
- `row-span-{n}`
- `row-span-full`

@flex

**起止**:

- `col-start-{n}`
- `col-end-{n}`
- `row-start-{n}`
- `row-end-{n}`

@flex

**自动流**:

- `grid-flow-row`
- `grid-flow-col`
- `grid-flow-dense`
- `grid-flow-row-dense`
- `grid-flow-col-dense`

@flex

**自动尺寸**:

- `auto-cols-auto`
- `auto-cols-min`
- `auto-cols-max`
- `auto-cols-fr`
- `auto-rows-auto`
- `auto-rows-min`
- `auto-rows-max`
- `auto-rows-fr`

@end

### 间距与对齐

@flexs flex-wrap gap-8

@flex

**间距**:

- `gap-{n}`
- `gap-x-{n}`
- `gap-y-{n}`
- `gap-px`
- `gap-x-px`
- `gap-y-px`

@flex

**主轴对齐**:

- `justify-start`
- `justify-end`
- `justify-center`
- `justify-between`
- `justify-around`
- `justify-evenly`
- `justify-stretch`

@flex

**项目/自身对齐**:

- `justify-items-{value}`
- `justify-self-{value}`

@flex

**交叉轴对齐**:

- `items-{value}`
- `self-{value}`
- `content-{value}`

@flex

**放置**:

- `place-content-{value}`
- `place-items-{value}`
- `place-self-{value}`

@end

### 多列

@flexs flex-wrap gap-8

@flex

**列数**:

- `columns-{n}`

@flex

**断裂**:

- `break-after-{value}`
- `break-before-{value}`
- `break-inside-{value}`

@flex

**跨列**:

- `.span-all` 类映射为 `column-span: all`

@end

### 其他

@flexs flex-wrap gap-8

@flex

**宽高比**:

- `aspect-auto`
- `aspect-square`
- `aspect-video`

@end

## 选项

::: fields
@`inlineStyles` type=boolean default=`true`

当 `inlineStyles` 为 `true`（默认值）时，工具类会被转换为内联 CSS 样式。为 `false` 时，工具类会作为 CSS 类名添加，可配合 Tailwind CSS 或自定义样式表使用。

:::

## 示例

::: preview

@flexs gap-4 items-center
@flex.flex-demo flex-1

### 左列

此内容会增长以填充可用空间。

@flex.flex-demo

### 右列

此内容使用其自然宽度。

@end

:::

<style scoped>
.flex-demo {
    border: 1px solid red;
}
</style>
