---
title: "@mdit/plugin-cjk-friendly"
shortTitle: "plugin-cjk-friendly"
icon: bold
---

使强调语法对中文、日文和韩文友好的插件。

<!-- more -->

## 使用

```ts
import { cjkFriendly } from "@mdit/plugin-cjk-friendly";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(cjkFriendly);

mdIt.render(
  "**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。",
);
// <p><strong>このアスタリスクは強調記号として認識されず、そのまま表示されます。</strong>この文のせいで。</p>
```

::: tip

此插件实现了 [CJK-friendly CommonMark 修订](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md)。它只影响紧邻 CJK 字符的强调标记，因此其他语言的文档会保持原生 markdown-it 的输出。

VuePress 2 的 [`@vuepress/plugin-markdown-ext`](https://ecosystem.vuejs.press/plugins/markdown/markdown-ext.html) 已经依赖参考实现 `markdown-it-cjk-friendly`。

:::

## 语法

CommonMark 规定，`**` 的后面是标点符号时不能开启强调，除非它前面的字符是空白或标点。而 CJK 标点常常紧挨在结束标记之前，因此许多 CJK 强调标记无法被识别：

输入

```md
これは**私のやりたかったこと。**だからするの。
```

原生 markdown-it 输出

```html
<p>これは**私のやりたかったこと。**だからするの。</p>
```

使用此插件后输出

```html
<p>これは<strong>私のやりたかったこと。</strong>だからするの。</p>
```

此插件会将 CJK 字符、CJK 标点以及变体选择符序列视为 `*`、`**` 以及 GFM `~~` 标记的合法相邻字符。markdown-it 对 `_` 与 `__` 保留词内限制，因此该修订不会改变下划线强调。默认以 emoji 形式展示的字符（例如 😀）不会被当作 CJK 字符。

## 示例

输入

```md
**这些星号不会被识别为强调标记，而是就这么原样显示出来。**都是因为这个句子。
```

输出

```html
<p><strong>这些星号不会被识别为强调标记，而是就这么原样显示出来。</strong>都是因为这个句子。</p>
```

<!-- comparison:start -->

> 与上游参考实现的完整对比见[对比报告](compare.md)。

<!-- comparison:end -->
