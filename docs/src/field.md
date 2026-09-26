---
title: "@mdit/plugin-field"
icon: table-list
---

Plugin for creating block-level custom field containers.

<!-- more -->

## Installation

```bash
# pnpm
pnpm add @mdit/plugin-field
# npm
npm install @mdit/plugin-field
# yarn
yarn add @mdit/plugin-field
```

## Usage

```ts
import MarkdownIt from "markdown-it";
import { field } from "@mdit/plugin-field";

const mdIt = new MarkdownIt().use(field, {
  // your options
});

mdIt.render(`
::: fields
@prop1@ type="string" required
Description 1
:::
`);
```

## Syntax

### Container

You can create a field container using `::: fields` and `:::`. The name `fields` can be customized via the `name` option.

You can also provide an ID for the container using `::: fields #id`.

### Items

Inside the container, lines starting with `@name@` are field items. You can add attributes after the closing `@`.

```md
::: fields
@prop1@ type="string" required
Description 1
:::
```

Any contents after a `@name@` marker and before container closing marker or new `@name@` marker at the same level will be considered as the field content.

### Attributes

Attributes are key-value pairs separated by `=`. Values can be quoted or unquoted.

```md
@prop1@ type="string" required default="value"
```

- For unquoted values, the value will end at the first space or whitespace.
- Values can be quoted with `"`, `'` or `` ` ``.
- Backslashes inside a `"` or `'` quoted value follow Markdown's escaping rules: a backslash before an ASCII punctuation character is removed, while any other backslash is kept as-is. So `default="^\d+$"` and `default="C:\new"` keep their backslashes, while `default="hello \"world\""` gives `hello "world"`. Unquoted values are taken literally. Since a backslash also escapes the closing quote, write `default="C:\\"` to end a value with a backslash.
- If an attribute exists without `=`, it will be treated as a boolean attribute with the value `true`.

#### Backtick Values

A backtick value keeps its content literal, which is useful when the value collides with Markdown syntax:

```md
@prop1@ default=`['a', 'b']`
```

Values quoted with `"` or `'` are still parsed as Markdown by other tools, so `[a][b]` inside them may be reported as an undefined reference by linters. Other tools treat a backtick value as an inline code span, which avoids that.

Inside a backtick value only a backtick and a backslash can be escaped: escape a backtick as `` \` `` and a backslash as `\\`, while any other backslash is kept as-is, so `` default=`^\d+\.\d+$` `` keeps both backslashes.

```md
@prop1@ default=`a\`b`
```

A backtick value ends at the first unescaped backtick, just like a value quoted with `"` or `'`, so a value that starts with a backtick is parsed as a backtick value. An unclosed backtick value falls back to an unquoted value.

#### Allowed Attributes

By default, all attributes are allowed and displayed as-is. You can restrict and customize attribute display using the `allowedAttributes` option.

If `allowedAttributes` is provided:

- Only attributes defined in the array will be displayed.
- Attributes will be displayed in the order they appear in the array.
- You can provide a custom `name` for each attribute to change its label in the header.
- You can mark an attribute as `boolean` to always treat it as a flag (ignoring any value).

```ts
field(md, {
  allowedAttributes: [
    { attr: "type", name: "Property Type" },
    { attr: "required", boolean: true },
  ],
});
```

### Nesting

Same or different containers can be nested inside items at the same indentation or partial indentation (less than code fence indentation) level.

```md
:::: fields
@option@
Parent description.
::: props
@prop1@ type="string"
Key description.
@prop2@ type="number"
Key description.
:::
@option2@
Another parent description.
::::
```

To create a field item inside another field, increase the starting `@` by one for each level of nesting:

```md
::: fields
@prop1@
Parent description.
@@prop1.key1@ type="string"
Key description.
@@prop1.key2@ type="number"
Key description.
@prop2@
Another parent description.
:::
```

Now `prop1` has two nested keys `key1` and `key2`, while `prop2` has no nested keys.

Though common tools like prettier is not happy with indention less than 4, the plugin is designed to be flexible with indentation as long as it is less than code fence indentation (4 spaces by default). This allows for more natural nesting without strict indentation requirements.

```md
<!-- prettier-ignore-start -->
::: fields
@prop1@
  Parent description.

  @@prop1.key1@ type="string"
  Key description.

  @@prop1.key2@ type="number"
  Key description.
:::
<!-- prettier-ignore-end -->
```

::: tip Escaping

- If you need to use `@` at the beginning of the line inside a field container, you can use `\` to escape it to `\@`.

- If your field name contains `@`, you can escape it with `\`:

  ```md
  @user\@domain.com@
  ```

:::

## Options

### name

- Type: `string`
- Default: `"fields"`
- Details: Field container name.

### classPrefix

- Type: `string`
- Default: `"field-"`
- Details: CSS class prefix for generated class names.

### parseAttributes

- Type: `boolean`
- Default: `true`
- Details: Whether to parse `key="val"` attributes after the field marker.

### allowedAttributes

- Type: `FieldAttr[]`

```ts
interface FieldAttr {
  /**
   * attribute name
   */
  attr: string;

  /**
   * Display name of the attribute, if not provided, will use `attr` as display name with first letter capitalized.
   */
  name?: string;

  /**
   * boolean attribute, any attribute existence will be treated as true, and value will be ignored.
   *
   * @default false
   */
  boolean?: boolean;
}
```

- Details: Allowed attributes for fields. If not provided, all attributes will be allowed and displayed as-is.

### fieldsOpenRenderer

- Type: `RendererRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Fields container open render.

### fieldsCloseRenderer

- Type: `RendererRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Fields container close render.

### fieldOpenRenderer

- Type: `MarkdownItFieldOpenRenderer`

```ts
type FieldAttrQuote = "none" | "single" | "double" | "backtick";

interface FieldAttrItem {
  /**
   * attribute name
   */
  attr: string;

  /**
   * attribute display name
   */
  name: string;

  /**
   * attribute value
   */
  value: string | true;
}

interface FieldAttrDetail extends FieldAttrItem {
  /**
   * quote style used in source
   */
  quote: FieldAttrQuote;
}

interface FieldMeta {
  /**
   * field name
   */
  name: string;

  /**
   * field level, starting from 1
   */
  level: number;

  /**
   * sorted field attributes
   */
  attributes: FieldAttrItem[];

  /**
   * sorted field attributes with extra info, e.g. the quote style used in source
   */
  details: FieldAttrDetail[];
}

type MarkdownItFieldOpenRenderer = (
  meta: FieldMeta,
  tokens: Token[],
  index: number,
  options: Required<MarkdownItOptions>,
  env: Env | undefined,
  self: Renderer,
) => string;
```

- Details: Field item open render.

### fieldCloseRenderer

- Type: `RendererRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Field item close render.

## Demo

:::: preview Basic Fields

::: fields
@prop1@ type="string" required
Description 1

@prop2@ type="number"
Description 2
:::

::::

:::: preview Nested Fields

::: fields
@parent@
Parent description.

@@child@
Child description.
:::

::::

:::: preview Custom Name and Attributes

```ts
import MarkdownIt from "markdown-it";
import { field } from "@mdit/plugin-field";

const mdIt = new MarkdownIt().use(field, {
  name: "props",
  allowedAttributes: [
    { attr: "type", name: "Property Type" },
    { attr: "required", boolean: true },
  ],
});
```

::: props
@prop1@ type="string" required
This is a required string property.

@prop2@ type="number"
This is a number property.
:::

::::
