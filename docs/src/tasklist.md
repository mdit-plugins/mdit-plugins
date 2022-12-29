---
title: "@mdit/plugin-tasklist"
icon: check
---

Plugins to support tasklist.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

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

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { tasklist } = require("@mdit/plugin-tasklist");

const mdIt = MarkdownIt().use(tasklist, {
  // your options, optional
});

mdIt.render(`\
- [x] task 1
- [ ] task 2
`);
```

:::

## Syntax

- Use `- [ ] some text` to render a unchecked task item.
- Use `- [x] some text` to render a checked task item. (Capital `X` is also supported)

## Options

```ts
interface MarkdownItTasklistOptions {
  /**
   * Whether disable checkbox
   *
   * @default true
   */
  disabled?: boolean;

  /**
   * Whether use `<label>` to wrap text
   *
   * @default true
   */
  label?: boolean;

  /**
   * Class for tasklist container
   *
   * @default 'task-list-container'
   */
  containerClass?: string;

  /**
   * Class for tasklist item
   *
   * @default 'task-list-item'
   */
  itemClass?: string;

  /**
   * Class for tasklist item label
   *
   * @default 'task-list-item-label'
   */
  labelClass?: string;

  /**
   * Class for tasklist item checkbox
   *
   * @default 'task-list-item-checkbox'
   */
  checkboxClass?: string;
}
```

## Demo

- [ ] Plan A
- [x] Plan B

```md
- [ ] Plan A
- [x] Plan B
```
