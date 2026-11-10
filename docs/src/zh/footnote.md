---
title: "@mdit/plugin-footnote"
shortTitle: "plugin-footnote"
icon: quote-left
---

支持页脚的插件。

<!-- more -->

## 使用

```ts
import { footnote } from "@mdit/plugin-footnote";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(footnote);

mdIt.render("Inline footnote^[Text of inline footnote] definition.");
```

## 语法

- 在 Markdown 中使用 `[^锚点文字]` 来定义脚注。

- 在之后的任何行首使用 `[^锚点文字]: ...` 来描述脚注内容。

- 如果脚注包含多个段落，其后的段落应当保持双层缩进。

::: tip 嵌套和转义

- 支持嵌套：

  ```MD
  脚注 1 链接 [^first]。

  [^first]: 脚注可以参考[^second]。
  [^second]: 其他脚注。
  ```

- 转义可以通过添加 `\` 来完成：

  ```MD
  紧随的 \[^first] 不是脚注。
  ```

  将渲染为

  紧随的 \[^first] 不是脚注。

::::

## 选项

::: fields
@`refAttrs` type=`Record<string, string | number>`

为引用元素（即 `<sup class="footnote-ref">` 包裹层）添加额外属性。`class` 会与默认的 `footnote-ref` 合并，其他属性会覆盖生成的属性。

@`itemAttrs` type=`Record<string, string | number>`

为每个脚注项（即 `<li id="footnoteN" class="footnote-item">` 元素）添加额外属性。`class` 会与默认的 `footnote-item` 合并，其他属性会覆盖生成的属性（包括生成的 `id`）。

@`backrefAttrs` type=`Record<string, string | number>`

为回链（即 `<a class="footnote-backref">` 元素）添加额外属性。`class` 会与默认的 `footnote-backref` 合并，其他属性会覆盖生成的属性（包括生成的 `href`）。

@`containerAttrs` type=`Record<string, string | number>`

为脚注容器（即 `<section class="footnotes">` 元素）添加额外属性。`class` 会与默认的 `footnotes` 合并，其他属性会覆盖生成的属性。

:::

无法安全序列化的属性名会被忽略，包括空名称、包含空白或控制字符的名称，以及 `"`、`'`、`/`、`<`、`=`、`>`。空的 `class` 值也会被忽略。

`refAttrs` 只作用于 `<sup>` 包裹层，因此在这里写 `href` 或 `id` 不会改变任何一个链接。链接目标属于生成数据，覆盖其中一项时需要同步更新对应的 token 数据：通过 `itemAttrs` 覆盖脚注项的 `id` 会断开前向链接，除非同时更新 `footnote_ref` 的 `meta.href`；通过 `backrefAttrs` 覆盖回链的 `href` 不影响前向链接，但回链将不再指向锚点；修改引用内部的锚点 `id` 需要同时更新 `footnote_ref` 的 `meta.anchorId` 与 `footnote_anchor` 的 `href`。

## 自定义输出

插件在解析阶段就确定所有要渲染的属性和渲染数据，并把元素属性写入 `token.attrs`，把生成的 id、href、class 和文本写入 `token.meta`。渲染规则只负责序列化这些值，因此在 `footnoteTail` 之后通过 core rule 修改 token 即可调整输出。

```ts
import { footnote } from "@mdit/plugin-footnote";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(footnote);

mdIt.core.ruler.after("footnoteTail", "customize-footnote", (state) => {
  for (const token of state.tokens) {
    if (token.type === "footnote_block_open") {
      token.attrJoin("class", "custom-notes");
    } else if (token.type === "footnote_anchor" && token.meta) {
      token.meta.text = "↑";
    }
  }
});
```

脚注按首次引用的顺序编号。编号的分配不可配置，但渲染出的标题仍可通过 `footnote_caption` 渲染规则覆盖。锚点名在解析阶段就已确定，因此旧的内部辅助规则 `footnote_anchor_name` 已被移除；请改为直接修改 token 上生成的 id 与 `href`：`footnote_ref` 的 `meta.href` 与 `meta.anchorId`、`footnote_open` 的 `id` 属性、`footnote_anchor` 的 `href` 属性。`meta.id`、`meta.subId` 等字段属于内部解析状态，修改它们可能导致生成的引用错位。

## 示例

::: preview 示例

脚注 1 链接[^first]。

脚注 2 链接[^second]。

行内的脚注^[行内脚注文本] 定义。

重复的页脚定义[^second]。

[^first]: 脚注 **可以包含特殊标记**

    也可以由多个段落组成

[^second]: 脚注文字。

:::

<!-- comparison:start -->

---

> 与上游参考实现的完整对比见[对比报告](compare.md)。

<!-- comparison:end -->
