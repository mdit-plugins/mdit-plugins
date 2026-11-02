---
title: "@mdit/plugin-cjk-breaks"
shortTitle: "plugin-cjk-breaks"
icon: text-width
---

Plugin to remove line breaks between East Asian characters.

<!-- more -->

## Usage

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

## Syntax

The plugin suppresses soft line breaks that cannot be converted to spaces, following the segment break transformation rules of [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#line-break-transform):

- A line break adjacent to a zero-width space (U+200B) is removed.
- A line break is removed when both adjacent characters have an East Asian Width of `F`, `W` or `H`, and neither of them is Hangul.
- Other line breaks are kept.

Input

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

Output

```html
<p>Remove linebreaks near ZWSP</p>
<p>foo​bar​baz</p>
<p>Remove linebreaks between hiragana (wide) characters</p>
<p>あおえいう</p>
<p>Keep linebreaks between hangul characters</p>
<p>ㅏㅗㅔ ㅣㅜ</p>
```

## Demo

Input

```md
あおえ
aoe
あおえ
```

Output

```html
<p>あおえ aoe あおえ</p>
```

<!-- comparison:start -->

> See the [comparison report](compare.md) for the full upstream comparison.

<!-- comparison:end -->
