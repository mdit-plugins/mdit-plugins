---
title: "@mdit/plugin-cjk-breaks"
shortTitle: "plugin-cjk-breaks"
icon: text-width
---

移除东亚字符之间换行的插件。

<!-- more -->

## 使用

```ts
import { cjkBreaks } from "@mdit/plugin-cjk-breaks";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(cjkBreaks);

mdIt.render(`\
あおえ
うい
aoe
ui
`);
// <p>あおえうい
// aoe
// ui</p>
```

## 语法

此插件会移除无法转换为空格的软换行，遵循 [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#line-break-transform) 的段换行转换规则：

- 紧邻零宽空格（U+200B）的换行会被移除。
- 当换行两侧字符的东亚宽度均为 `F`、`W` 或 `H`，且任意一侧都不是韩文时，换行会被移除。
- 其他换行会保留。

输入

```md
Remove linebreaks near ZWSP

foo​
bar
​baz

Remove linebreaks between hiragana (wide) characters

あおえ
いう

Keep linebreaks between hangul characters

ㅏㅗㅔ
ㅣㅜ
```

输出

```html
<p>Remove linebreaks near ZWSP</p>
<p>foo​bar​baz</p>
<p>Remove linebreaks between hiragana (wide) characters</p>
<p>あおえいう</p>
<p>Keep linebreaks between hangul characters</p>
<p>ㅏㅗㅔ ㅣㅜ</p>
```

## 示例

输入

```md
あおえ
aoe
あおえ
```

输出

```html
<p>あおえ aoe あおえ</p>
```

<!-- comparison:start -->

> 与上游参考实现的完整对比见[对比报告](compare.md)。

<!-- comparison:end -->
