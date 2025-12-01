---
title: "@mdit/plugin-ruby"
icon: paperclip
---

提供 `<ruby>` 声明支持的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { ruby } from "@mdit/plugin-ruby";

const mdIt = MarkdownIt().use(ruby);

mdIt.render("{中国:zhōng|guó}");
```

## 格式

通过 `{ruby base:ruby text1|ruby text2|...}` 来添加 ruby 声明。

::: tip 转义

- 你可以使用 `\` 来转义 `{` `}` 或 `:`:

  ```md
  \{中国:zhōng|guó}
  ```

  会被渲染为

  \{中国:zhōng|guó}

:::

## 示例

`{中国:zhōng|guó}`: {中国:zhōng|guó}
