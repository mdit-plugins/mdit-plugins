---
title: "@mdit/plugin-footnote"
icon: quote
---

支持页脚的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { footnote } from "@mdit/plugin-footnote";

const mdIt = MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { footnote } = require("@mdit/plugin-footnote");

const mdIt = MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

:::

## 格式

- 在 Markdown 中使用 `[^锚点文字]` 来定义脚注。

- 在之后的任何行首使用 `[^锚点文字]: ...` 来描述脚注内容。

- 如果脚注包含多个段落，其后的段落应当保持双层缩进。

::: tip 嵌套和转义

- 支持嵌套：

  ```MD
  脚注 1 链接 [^first]。

  [^first]：脚注可以参考[^second]。
  [^second]：其他脚注。
  ```

- 转义可以通过添加 `\` 来完成：

  ```MD
  紧随的 \[^first] 不是脚注。
  ```

  将渲染为

  紧随的 \[^first] 不是脚注。

::::

## 例子

脚注 1 链接[^first]。

脚注 2 链接[^second]。

行内的脚注^[行内脚注文本] 定义。

重复的页脚定义[^second]。

[^first]: 脚注 **可以包含特殊标记**

    也可以由多个段落组成

[^second]: 脚注文字。

```md
脚注 1 链接[^first]。

脚注 2 链接[^second]。

行内的脚注^[行内脚注文本] 定义。

重复的页脚定义[^second]。

[^first]: 脚注 **可以包含特殊标记**

    也可以由多个段落组成

[^second]: 脚注文字。
```
