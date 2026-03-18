---
title: "@mdit/plugin-tasklist"
icon: square-check
---

提供任务列表支持的插件。

<!-- more -->

## 使用

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

## 格式

- 使用 `- [ ] 一些文字` 渲染一个未勾选的任务项
- 使用 `- [x] 一些文字` 渲染一个勾选了的任务项 (我们也支持大写的 `X`)

## 选项

### disabled

- 类型：`boolean`
- 默认值：`true`
- 详情：是否禁用 checkbox。

### label

- 类型：`boolean`
- 默认值：`true`
- 详情：是否使用 `<label>` 来包裹文字。

### containerClass

- 类型：`string`
- 默认值：`'task-list-container'`
- 详情：tasklist 容器的 class。

### itemClass

- 类型：`string`
- 默认值：`'task-list-item'`
- 详情：tasklist item 的 class。

### labelClass

- 类型：`string`
- 默认值：`'task-list-item-label'`
- 详情：tasklist item label 的 class。

### checkboxClass

- 类型：`string`
- 默认值：`'task-list-item-checkbox'`
- 详情：tasklist item checkbox 的 class。

## 示例

::: preview 示例

- [ ] 计划 A
- [x] 计划 B

:::
