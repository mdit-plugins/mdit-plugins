---
title: "@mdit/plugin-tasklist"
icon: square-check
---

Plugins to support tasklist.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { tasklist } from "@mdit/plugin-tasklist";

const mdIt = MarkdownIt().use(tasklist, {
  // your options, optional
});

mdIt.render(`\
- [x] task 1
- [ ] task 2
`);
```

## Syntax

- Use `- [ ] some text` to render a unchecked task item.
- Use `- [x] some text` to render a checked task item. (Capital `X` is also supported)

## Options

### disabled

- Type: `boolean`
- Default: `true`
- Details: Whether to disable checkbox.

### label

- Type: `boolean`
- Default: `true`
- Details: Whether to use `<label>` to wrap text.

### containerClass

- Type: `string`
- Default: `'task-list-container'`
- Details: Class for tasklist container.

### itemClass

- Type: `string`
- Default: `'task-list-item'`
- Details: Class for tasklist item.

### labelClass

- Type: `string`
- Default: `'task-list-item-label'`
- Details: Class for tasklist item label.

### checkboxClass

- Type: `string`
- Default: `'task-list-item-checkbox'`
- Details: Class for tasklist item checkbox.

## Demo

::: preview Demo

- [ ] Plan A
- [x] Plan B

:::
