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

脚注引用标记（包裹引用链接的 `<sup class="footnote-ref">` 元素）的额外属性。

`class` 值会与内置的 `footnote-ref` 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。

@`itemAttrs` type=`Record<string, string | number>`

每个脚注项（`<li id="footnote…" class="footnote-item">` 元素）的额外属性。

`class` 值会与内置的 `footnote-item` 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。覆盖 `id` 会破坏 `href` 锚点。

@`backrefAttrs` type=`Record<string, string | number>`

反向引用链接（每个脚注项末尾的 `<a href="#footnote-ref…" class="footnote-backref">` 元素）的额外属性。

`class` 值会与内置的 `footnote-backref` 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。

@`containerAttrs` type=`Record<string, string | number>`

脚注容器（包裹有序列表和所有脚注项的 `<section class="footnotes">` 元素）的额外属性；分隔线 `<hr class="footnotes-sep">` 会紧挨在该元素之前输出。

`class` 值会与内置的 `footnotes` 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。
:::

脚注标记由默认渲染器从标准 markdown-it token（`section_open`、`ordered_list_open`、`list_item_open`、`sup_open`、`link_open` 等）渲染。上述选项覆盖常见场景；如需更多控制，可在 core 规则中修改这些 token（例如使用 `attrJoin`），或覆盖它们的渲染规则。

## 破坏性变更

::: warning v2 是破坏性的大版本

插件现在输出标准 markdown-it token，而不再输出自定义的 `footnote_*` token。升级前请先了解以下变化：

- 不再注册内部的 `footnote_ref`、`footnote_block_open`、`footnote_block_close`、`footnote_open`、`footnote_close` 与 `footnote_anchor` 渲染规则。请改为覆盖标准 token 的规则（`sup_open`、`section_open`、`ordered_list_open`、`list_item_open`、`link_open` 等）。
- core 规则在最终 token 流中不再看到 `footnote_ref` 或其他 `footnote_*` token，请改为修改对应的标准 token。
- `FootNoteToken.meta.subId` 与 `FootNoteToken.meta.label` 现在是可选的：行内引用与行内脚注不会设置它们。
- `env.docId` 在解析阶段读取，并原样插入生成的 id 与 `href`，由默认渲染器统一转义一次。请在解析时传入 `docId`（`md.render(src, { docId })` 即如此）；再向 `renderer.render()` 传不同环境不再改变生成的 id。token 的属性值不再预先转义。

:::

### 迁移

迁移前（v1），渲染规则覆盖使用内部规则：

```ts
md.renderer.rules.footnote_ref = (tokens, idx) => "...";
```

迁移后（v2），请使用上文选项或修改标准 token：

```ts
md.use(footnote, { refAttrs: { "data-kind": "reference" } });

md.core.ruler.push("footnote-custom", (state) => {
  for (const token of state.tokens) {
    if (token.type === "section_open") token.attrJoin("class", "custom-notes");
  }
});
```

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
