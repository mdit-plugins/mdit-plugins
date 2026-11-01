---
title: "@mdit/plugin-layout"
shortTitle: "plugin-layout"
icon: table-cells-large
---

Plugin for creating Flexbox, CSS Grid, and Multi-column layouts using directives.

Installing the plugin twice is a no-op: the first installation's options, parser rules and renderers stay in effect.

<!-- more -->

## Usage

```ts
import { layout } from "@mdit/plugin-layout";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(layout);

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

Any positive number of leading `@` characters can open a container outside another layout container, for example `@flexs`, `@@flexs` or `@@@flexs`. That number is the marker count of the container: its items and closing `@end` must use exactly the same count.

### Attribute Injection

Directives support class and id selectors attached directly to the directive name:

```md
@flexs.nav#top gap-4 items-center
```

- `.class-name` adds a CSS class
- `#id` adds an HTML id
- Space-separated text after selectors are utility classes mapped to inline styles

### Nesting

Containers are nested with **fewer** leading `@` characters than their parent. An outer `@@flexs` can contain an inner `@grids`, while both items and `@end` keep the marker count of their own container:

```md
@@flexs
@@flex
@grids grid-cols-2
@grid
Nested content
@end
@@end
```

Three levels follow the same rule: `@@@flexs` wraps `@@flexs`, which wraps `@grids`:

```md
@@@flexs
@@@flex
@@flexs
@@flex
@grids grid-cols-2
@grid
Deep content
@end
@@end
@@@end
```

A nested container must have a smaller marker count than its parent. Inside `@flexs`, both `@grids` and `@@grids` are parsed as ordinary text:

```md
@flexs
@flex
@grids
@grid
@@grids
@@grid
This is text, not a nested grid.
@end
```

Directive lines may be indented by 0-3 spaces relative to the current block; the indentation is decorative. Lines indented 4+ spaces are indented code blocks or lazy paragraph continuations and never start directives, matching CommonMark.

A container without a matching `@end` is auto-closed at the end of its parent block. Content that is outdented past the parent block (for example a top-level line after a list-indented container) is parsed by the parent normally. At the same block level (for example inside a nested container or list item; blockquote-prefixed lines are exempt), a same-type item marker or an `@end` whose `@` count matches an enclosing container is treated as a boundary; avoid writing such markers as literal text there.

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

::: fields
@`inlineStyles` type=boolean default=`true`

When `true`, utility classes are converted to inline CSS styles. When `false`, utilities are added as CSS class names for use with Tailwind CSS or custom stylesheets.

:::

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
