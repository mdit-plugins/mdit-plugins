---
title: "@mdit/plugin-tasklist"
icon: check
---

提供任务列表支持的插件。

<!-- more -->

## 使用

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

## 格式

- 使用 `- [ ] 一些文字` 渲染一个未勾选的任务项
- 使用 `- [x] 一些文字` 渲染一个勾选了的任务项 (我们也支持大写的 `X`)

## 选项

```ts
interface MarkdownItTasklistOptions {
  /**
   * 是否禁用 checkbox
   *
   * @default true
   */
  disabled?: boolean;

  /**
   * 是否使用 `<label>` 来包裹文字
   *
   * @default true
   */
  label?: boolean;

  /**
   * tasklist 容器的 class
   *
   * @default 'task-list-container'
   */
  containerClass?: string;

  /**
   * tasklist item 的 class
   *
   * @default 'task-list-item'
   */
  itemClass?: string;

  /**
   * tasklist item label 的 class
   *
   * @default 'task-list-item-label'
   */
  labelClass?: string;

  /**
   * tasklist item checkbox 的 class
   *
   * @default 'task-list-item-checkbox'
   */
  checkboxClass?: string;
}
```

## 示例

::: md-demo 示例

- [ ] 计划 A
- [x] 计划 B

:::
