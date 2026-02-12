---
title: "@mdit/plugin-layout"
icon: grip
---

Plugin for creating Flexbox, CSS Grid, and Multi-column layouts using directives.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { layout } from "@mdit/plugin-layout";

const mdIt = MarkdownIt().use(layout);

mdIt.render(`\
@flexs gap-4
@flex
Left content
@flex
Right content
@end
`);
```

## Syntax

The plugin uses directive-based syntax with a "plural-for-container, singular-for-item" convention:

| Layout Mode      | Container  | Item      | Close  |
| :--------------- | :--------- | :-------- | :----- |
| **Flexbox**      | `@flexs`   | `@flex`   | `@end` |
| **CSS Grid**     | `@grids`   | `@grid`   | `@end` |
| **Multi-column** | `@columns` | `@column` | `@end` |

### Attribute Injection

Directives support class and id selectors attached directly to the directive name:

```md
@flexs.nav#top gap-4 items-center
```

- `.class-name` adds a CSS class
- `#id` adds an HTML id
- Space-separated text after selectors are utility classes mapped to inline styles

### Nesting

Same or different containers can be nested inside items at the same indentation level.

```md
@flexs
@flex
@grids grid-cols-2
@grid
Nested content
@end
@end
```

**Prefix mode** (multiple `@`) provides an explicit depth indicator — recommended for complex nesting:

```md
@flexs
@flex
@@flexs
@@flex
Content (depth 2 via @@)
@@end
@end
```

In prefix mode, `@@` = depth 2, `@@@` = depth 3, etc. Items and `@end` must use the same number of `@` as their container, otherwise markers will be rendered as text. This explicit depth indication makes it easier to maintain clear structure and avoid mismatches in complex nesting.

Layout directives also work inside list items and blockquotes:

<!-- prettier-ignore-start -->
```md
- list item
  @flexs
  @flex
  Content in list
  @end
```
<!-- prettier-ignore-end -->

## Supported Utilities

### Flexbox

@flexs flex-wrap gap-8

@flex

**Direction**:

- `flex-row`
- `flex-col`
- `flex-row-reverse`
- `flex-col-reverse`

@flex

**Wrap**:

- `flex-wrap`
- `flex-nowrap`
- `flex-wrap-reverse`

@flex

**Flex**:

- `flex-1`
- `flex-auto`
- `flex-initial`
- `flex-none`

@flex

**Grow/Shrink**:

- `grow`
- `grow-0`
- `shrink`
- `shrink-0`

@flex

**Order**:

- `order-{n}`
- `order-first`
- `order-last`
- `order-none`

@end

### Grid

@flexs flex-wrap gap-8

@flex

**Columns**:

- `grid-cols-{n}`
- `grid-cols-none`

@flex

**Rows**:

- `grid-rows-{n}`
- `grid-rows-none`

@flex

**Span**:

- `col-span-{n}`
- `col-span-full`
- `row-span-{n}`
- `row-span-full`

@flex

**Start/End**:

- `col-start-{n}`
- `col-end-{n}`
- `row-start-{n}`
- `row-end-{n}`

@flex

**Auto Flow**:

- `grid-flow-row`
- `grid-flow-col`
- `grid-flow-dense`
- `grid-flow-row-dense`
- `grid-flow-col-dense`

@flex

**Auto Sizing**:

- `auto-cols-auto`
- `auto-cols-min`
- `auto-cols-max`
- `auto-cols-fr`
- `auto-rows-auto`
- `auto-rows-min`
- `auto-rows-max`
- `auto-rows-fr`

@end

### Spacing & Alignment

@flexs flex-wrap gap-8

@flex

**Gap**:

- `gap-{n}`
- `gap-x-{n}`
- `gap-y-{n}`
- `gap-px`
- `gap-x-px`
- `gap-y-px`

@flex

**Justify**:

- `justify-start`
- `justify-end`
- `justify-center`
- `justify-between`
- `justify-around`
- `justify-evenly`
- `justify-stretch`

@flex

**Justify Items/Self**:

- `justify-items-{value}`
- `justify-self-{value}`

@flex

**Align Items/Self/Content**:

- `items-{value}`
- `self-{value}`
- `content-{value}`

@flex

**Place**:

- `place-content-{value}`
- `place-items-{value}`
- `place-self-{value}`

@end

### Multi-column

@flexs flex-wrap gap-8

@flex

**Columns**:

- `columns-{n}`

@flex

**Breaks**:

- `break-after-{value}`
- `break-before-{value}`
- `break-inside-{value}`

@flex

**Span**:

- `.span-all` class maps to `column-span: all`

@end

### Other

@flexs flex-wrap gap-8

@flex

**Aspect Ratio**:

- `aspect-auto`
- `aspect-square`
- `aspect-video`

@end

## Options

```ts
interface MarkdownItLayoutOptions {
  /**
   * Whether to convert utility classes to inline CSS styles.
   *
   * @default true
   */
  inlineStyles?: boolean;
}
```

When `inlineStyles` is `true` (default), utility classes are converted to inline CSS styles. When `false`, utilities are added as CSS class names for use with Tailwind CSS or custom stylesheets.

A slim bundle without the utility conversion is also available:

```ts
import { layoutSlim } from "@mdit/plugin-layout/slim";
```

## Demo

::: preview

@flexs gap-4 items-center

@flex.flex-demo flex-1

### Left Column

This content grows to fill available space.

@flex.flex-demo

### Right Column

This content takes its natural width.

@end

:::

<style scoped>
.flex-demo {
    border: 1px solid red;
}
</style>
