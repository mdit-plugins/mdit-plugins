---
title: "@mdit/plugin-layout"
icon: table-columns
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

Nested containers must be indented by 2 or 3 spaces. The indentation must be at least as deep as the first content line inside the parent item (First-Line Anchor Rule):

```md
@grids grid-cols-2
@grid
Content here
@flexs flex-col
@flex
Nested content
@end
@grid
Outer content
@end
```

::: warning Indentation Rules

- Nested container indent must be **2 or 3 spaces**
- Indent must be **≥ the first content line's indent** inside the item
- **4+ spaces** triggers a Markdown code block (CommonMark)

:::

## Supported Utilities

### Flexbox

- **Direction**: `flex-row`, `flex-col`, `flex-row-reverse`, `flex-col-reverse`
- **Wrap**: `flex-wrap`, `flex-nowrap`, `flex-wrap-reverse`
- **Flex**: `flex-1`, `flex-auto`, `flex-initial`, `flex-none`
- **Grow/Shrink**: `grow`, `grow-0`, `shrink`, `shrink-0`
- **Order**: `order-{n}`, `order-first`, `order-last`, `order-none`

### Grid

- **Columns**: `grid-cols-{n}`, `grid-cols-none`
- **Rows**: `grid-rows-{n}`, `grid-rows-none`
- **Span**: `col-span-{n}`, `col-span-full`, `row-span-{n}`, `row-span-full`
- **Start/End**: `col-start-{n}`, `col-end-{n}`, `row-start-{n}`, `row-end-{n}`
- **Auto Flow**: `grid-flow-row`, `grid-flow-col`, `grid-flow-dense`, `grid-flow-row-dense`, `grid-flow-col-dense`
- **Auto Sizing**: `auto-cols-auto`, `auto-cols-min`, `auto-cols-max`, `auto-cols-fr`, `auto-rows-auto`, `auto-rows-min`, `auto-rows-max`, `auto-rows-fr`

### Spacing & Alignment

- **Gap**: `gap-{n}`, `gap-x-{n}`, `gap-y-{n}`, `gap-px`, `gap-x-px`, `gap-y-px`
- **Justify**: `justify-start`, `justify-end`, `justify-center`, `justify-between`, `justify-around`, `justify-evenly`, `justify-stretch`
- **Justify Items/Self**: `justify-items-{value}`, `justify-self-{value}`
- **Align Items/Self/Content**: `items-{value}`, `self-{value}`, `content-{value}`
- **Place**: `place-content-{value}`, `place-items-{value}`, `place-self-{value}`

### Multi-column

- **Columns**: `columns-{n}`
- **Breaks**: `break-after-{value}`, `break-before-{value}`, `break-inside-{value}`
- **Span**: `.span-all` class maps to `column-span: all`

### Other

- **Aspect Ratio**: `aspect-auto`, `aspect-square`, `aspect-video`

## Options

The default bundle (`@mdit/plugin-layout`) converts utility classes to inline CSS styles. For use with Tailwind CSS or custom stylesheets, use the slim bundle:

```ts
import MarkdownIt from "markdown-it";
import { layoutSlim } from "@mdit/plugin-layout/slim";

const mdIt = MarkdownIt().use(layoutSlim);
```

The slim bundle passes utilities as CSS class names instead of converting them to inline styles.

## Demo

### Flexbox Layout

```md
@flexs gap-4 items-center
@flex flex-1

### Left Column

This content grows to fill available space.
@flex

### Right Column

This content takes its natural width.
@end
```

### Grid Layout

```md
@grids.gallery grid-cols-3 gap-8
@grid

### Item 1

Standard content.
@grid col-span-2

### Item 2

This item spans two columns.
@grid

### Item 3

More content.
@end
```

### Multi-column Layout

```md
@columns columns-3 gap-6
@column

# Introduction

Text flows naturally.
@column.span-all

## Spanning Heading

This heading spans all columns.
@column

# Conclusion

Final notes.
@end
```
