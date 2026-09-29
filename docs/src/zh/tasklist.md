---
title: "@mdit/plugin-tasklist"
shortTitle: "plugin-tasklist"
icon: list-check
---

提供任务列表支持的插件。

<!-- more -->

## 使用

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

## 格式

- 使用 `- [ ] 一些文字` 渲染一个未勾选的任务项
- 使用 `- [x] 一些文字` 渲染一个勾选了的任务项 (我们也支持大写的 `X`)

## 选项

::: fields
@`disabled` type=boolean default=`true`

是否禁用 checkbox。

@`label` type=boolean default=`true`

是否使用 `<label>` 来包裹文字。

@`containerClass` type=string default=`'task-list-container'`

tasklist 容器的 class。

@`itemClass` type=string default=`'task-list-item'`

tasklist item 的 class。

@`labelClass` type=string default=`'task-list-item-label'`

tasklist item label 的 class。

@`checkboxClass` type=string default=`'task-list-item-checkbox'`

tasklist item checkbox 的 class。

:::

## 示例

::: preview 示例

- [ ] 计划 A
- [x] 计划 B

:::
