---
title: "@mdit/plugin-cjk-friendly"
shortTitle: "plugin-cjk-friendly"
icon: bold
---

Plugin to make emphasis and strong emphasis friendly to Chinese, Japanese and Korean text.

<!-- more -->

## Usage

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

This plugin implements the [CJK-friendly CommonMark amendments](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md). It only affects delimiter runs adjacent to CJK characters, so documents in other languages keep the plain markdown-it output.

VuePress 2's [`@vuepress/plugin-markdown-ext`](https://ecosystem.vuejs.press/plugins/markdown/markdown-ext.html) already depends on the reference implementation `markdown-it-cjk-friendly`.

:::

## Syntax

CommonMark only lets `**` open emphasis when it is not followed by punctuation, unless the character before it is whitespace or punctuation. Since CJK punctuation is commonly placed right before the closing marker, many CJK emphasis markers are left unrecognized:

Input

```md
これは**私のやりたかったこと。**だからするの。
```

Output with plain markdown-it

```html
<p>これは**私のやりたかったこと。**だからするの。</p>
```

Output with this plugin

```html
<p>これは<strong>私のやりたかったこと。</strong>だからするの。</p>
```

CJK characters, CJK punctuation and variation selector sequences are treated as valid neighbors of `*`, `**` and GFM `~~` delimiter runs. markdown-it keeps the intraword restrictions for `_` and `__`, so the amendment does not change underscore emphasis. Characters with a default emoji presentation, such as 😀, are not treated as CJK characters.

## Demo

Input

```md
**这些星号不会被识别为强调标记，而是就这么原样显示出来。**都是因为这个句子。
```

Output

```html
<p><strong>这些星号不会被识别为强调标记，而是就这么原样显示出来。</strong>都是因为这个句子。</p>
```

<!-- comparison:start -->

> See the [comparison report](compare.md) for the full upstream comparison.

<!-- comparison:end -->
