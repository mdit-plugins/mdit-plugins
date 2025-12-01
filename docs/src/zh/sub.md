---
title: "@mdit/plugin-sub"
icon: subscript
---

提供上角标支持的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { sub } from "@mdit/plugin-sub";

const mdIt = MarkdownIt().use(sub);

mdIt.render("H~2~O");
```

## 格式

使用 `~ ~` 进行上角标标注。

::: tip 转义

- 你可以使用 `\` 来转义 `~`:

  ```md
  H\~2~O
  ```

  会被渲染为

  H\~2~O

:::

## 示例

`H~2~O`: H~2~O
