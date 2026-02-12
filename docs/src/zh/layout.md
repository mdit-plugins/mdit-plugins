---
title: "@mdit/plugin-layout"
icon: grip
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

相同或不同容器均可以在相同缩进层级嵌套于子项内，插件可以正确匹配:

```md
@flexs
@flex
@grids grid-cols-2
@grid
嵌套内容
@end
@end
```

**前缀模式**（多 `@`）提供显式深度标识 —— 推荐用于复杂嵌套:

```md
@flexs
@flex
@@flexs
@@flex
内容（通过 @@ 识别为深度 2）
@@end
@end
```

在前缀模式下，`@@` = 深度 2，`@@@` = 深度 3，以此类推。子项和 `@end` 必须使用与其容器相同数量的 `@`，否则会拒绝渲染。这种显式的深度标识使得在复杂嵌套中更容易保持结构清晰，避免错误匹配。

布局指令也可以在列表项和块引用内使用:

<!-- prettier-ignore-start -->
```md
- 列表项
  @flexs
  @flex
  列表中的内容
  @end
```
<!-- prettier-ignore-end -->

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

```ts
interface MarkdownItLayoutOptions {
  /**
   * 是否将工具类转换为内联 CSS 样式。
   *
   * @default true
   */
  inlineStyles?: boolean;
}
```

当 `inlineStyles` 为 `true`（默认值）时，工具类会被转换为内联 CSS 样式。为 `false` 时，工具类会作为 CSS 类名添加，可配合 Tailwind CSS 或自定义样式表使用。

精简包不含工具类转换功能:

```ts
import { layoutSlim } from "@mdit/plugin-layout/slim";
```

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
