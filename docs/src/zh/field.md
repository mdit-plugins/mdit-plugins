---
title: "@mdit/plugin-field"
icon: list
---

支持创建块级自定义字段容器的插件。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { field } from "@mdit/plugin-field";

const mdIt = MarkdownIt().use(field, {
  // 你的选项
});

mdIt.render(`
::: fields
@prop1@ type="string" required
Description 1
:::
`);
```

## 语法

### 容器

你可以使用 `::: fields` 和 `:::` 创建字段容器。默认名称为 `fields`，你可以通过 `name` 选项进行自定义。

你还可以使用 `::: fields #id` 为容器提供 ID。

### 项目

在容器内部，以 `@名称@` 开头的行是字段项目。你可以在闭合的 `@` 后添加属性。

```md
::: fields
@prop1@ type="string" required
项目 1 描述
:::
```

在 `@名称@` 标记之后、容器关闭标记之前或同级的下一个 `@名称@` 标记之前的任何内容都将被视为字段内容。

### 属性

属性是以 `=` 分隔的键值对。值可以使用引号，也可以不用。

```md
@prop1@ type="string" required default="value"
```

- 对于不带引号的值，值将在第一个空格或空白处结束。
- 对于带引号的值，支持 `"` 和 `'`，并且你可以使用 `\` 转义引号。
- 如果一个属性存在但没有 `=`，它将被视为布尔属性，值为 `true`。

#### 允许的属性

默认情况下，所有属性都是允许的并按原样显示。你可以使用 `allowedAttributes` 选项来限制和自定义属性显示。

如果提供了 `allowedAttributes`：

- 只有数组中定义的属性会被显示。
- 属性将按照在数组中出现的顺序进行显示。
- 你可以为每个属性提供自定义的 `name`，以更改其在页眉中的标签。
- 你可以将属性标记为 `boolean`，以将其始终视为标志（忽略其任何值）。

```ts
field(md, {
  allowedAttributes: [
    { attr: "type", name: "属性类型" },
    { attr: "required", boolean: true },
  ],
});
```

### 嵌套

Same or different containers can be nested inside items at the same indentation or partial indentation (less than code fence indentation) level.

相同或不同的容器可以嵌套在项目内，缩进级别可以是相同的，也可以是部分缩进（小于代码块缩进级别，默认为4个空格）。

```md
:::: fields
@option@
父级描述。
::: props
@prop1@ type="string"
键描述。
@prop2@ type="number"
键描述。
:::
```

为了在另一个字段内创建字段项目，每个嵌套级别将起始 `@` 增加一个：

```md
::: fields
@prop1@
父级描述。
@@prop1.key1@ type="string"
键描述。
@@prop1.key2@ type="number"
键描述。
@prop2@
另一个父级描述。
:::
```

现在 `prop1` 有两个嵌套键 `key1` 和 `key2`，而 `prop2` 没有嵌套键。

虽然像 prettier 这样的常用工具不喜欢小于4个空格的缩进，但插件设计为只要缩进小于代码块缩进（默认为4个空格）就可以灵活处理。这允许更自然的嵌套，而不需要严格的缩进要求。

```md
<!-- prettier-ignore-start -->
::: fields
@prop1@
  父级描述。

  @@prop1.key1@ type="string"
  键描述。

  @@prop1.key2@ type="number"
  键描述。
:::
<!-- prettier-ignore-end -->
```

::: tip 嵌套和转义

- 如果你需要在字段容器内的行首使用 `@`，你可以使用 `\` 将其转义为 `\@`。

- 如果你的字段名称包含 `@`，你可以使用 `\` 进行转义：

  ```md
  @user\@domain.com@
  ```

:::

## 选项

```ts
interface FieldAttr {
  /**
   * 属性名称
   */
  attr: string;

  /**
   * 属性的显示名称，如果不提供，将使用 `attr` 作为显示名称，首字母大写。
   */
  name?: string;

  /**
   * 是否为布尔属性，任何属性的存在都将被视为 true，其值将被忽略。
   *
   * @default false
   */
  boolean?: boolean;
}

interface FieldAttrInfo {
  name: string;
  value: string | true;
}

interface FieldMeta {
  /**
   * 字段名称
   */
  name: string;

  /**
   * 字段级别，从 0 开始
   */
  level: number;

  /**
   * 排序后的字段属性
   */
  attributes: FieldAttrInfo[];
}

interface FieldToken extends Token {
  meta: FieldMeta;
}

type MarkdownItFieldOpenRender = (
  tokens: FieldToken[],
  index: number,
  options: Options,
  env: any,
  self: Renderer,
) => string;

interface MarkdownItFieldOptions {
  /**
   * 字段容器名称
   *
   * @default "fields"
   */
  name?: string;

  /**
   * 字段允许的属性，如果不提供，所有属性都将被允许并按原样显示。
   *
   * 属性显示将按照数组中的顺序进行排序。
   */
  allowedAttributes?: FieldAttr[];

  /**
   * fields 容器开启渲染函数
   */
  fieldsOpenRender?: RenderRule;

  /**
   * fields 容器关闭渲染函数
   */
  fieldsCloseRender?: RenderRule;

  /**
   * field 项目开启渲染函数
   */
  fieldOpenRender?: MarkdownItFieldOpenRender;

  /**
   * field 项目关闭渲染函数
   */
  fieldCloseRender?: RenderRule;
}
```

## 演示

:::: preview 基础字段

::: fields
@prop1@ type="string" required
项目 1 描述

@prop2@ type="number"
项目 2 描述
:::

::::

:::: preview 嵌套字段

::: fields
@parent@
父级项目描述。

@child@
子级项目描述。
:::

::::

:::: preview 自定义名称和属性

```ts
import MarkdownIt from "markdown-it";
import { field } from "@mdit/plugin-field";

const mdIt = MarkdownIt().use(field, {
  name: "props",
  allowedAttributes: [
    { attr: "type", name: "属性类型" },
    { attr: "required", boolean: true },
  ],
});
```

::: props
@prop1@ type="string" required
这是一个必填的字符串属性。

@prop2@ type="number"
这是一个数字属性。
:::

::::
