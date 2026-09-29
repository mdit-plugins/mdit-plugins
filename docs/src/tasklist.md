---
title: "@mdit/plugin-tasklist"
shortTitle: "plugin-tasklist"
icon: list-check
---

Plugins to support tasklist.

<!-- more -->

## Usage

```ts
import MarkdownIt from "markdown-it";
import { tasklist } from "@mdit/plugin-tasklist";

const mdIt = new MarkdownIt().use(tasklist, {
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

::: fields
@`disabled` type=boolean default=`true`

Whether to disable checkbox.

@`label` type=boolean default=`true`

Whether to use `<label>` to wrap text.

@`containerClass` type=string default=`'task-list-container'`

Class for tasklist container.

@`itemClass` type=string default=`'task-list-item'`

Class for tasklist item.

@`labelClass` type=string default=`'task-list-item-label'`

Class for tasklist item label.

@`checkboxClass` type=string default=`'task-list-item-checkbox'`

Class for tasklist item checkbox.

:::

## Demo

::: preview Demo

- [ ] Plan A
- [x] Plan B

:::
