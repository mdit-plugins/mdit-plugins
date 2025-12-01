---
title: "@mdit/plugin-dl"
icon: list-check
---

支持定义列表的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { dl } from "@mdit/plugin-dl";

const mdIt = MarkdownIt().use(dl);

mdIt.render(`\
苹果
: 蔷薇科苹果属植物的果仁果实。

橘子
: 柑橘属常绿乔木的果实。
`);
```

## 语法

语法基于 [PanDoc 定义列表](https://pandoc.org/MANUAL.html#definition-lists)。

每个术语必须在一行，该行可选跟一个空行。在术语后，需跟着一个或多个它的定义。

每个定义需要以 `:` 或 `~` 开头，后面跟着一个或多个定义的段落。当定义有多个块元素时，后续的块元素均应缩进四个空格。

如果术语后有空行，那么定义的文本将被视作段落，反之将会显示一个紧凑的列表。

## 示例

::: preview 示例

术语 1

: 定义 1

术语 2 with _inline markup_

: 定义 2

    定义 2 有多个段落。

    - 列表 1
    - 列表 2

术语 3

: 定义 3
包含软换行

    定义的第二个段落。

---

术语 1
: 定义 1

术语 2
: 定义 2a
: 定义 2b

:::
