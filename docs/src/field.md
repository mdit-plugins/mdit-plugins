---
title: "@mdit/plugin-field"
icon: list
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

const mdIt = MarkdownIt().use(field, {
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
- For quoted values, both `"` and `'` are supported, and you can escape quotes with `\`.
- If an attribute exists without `=`, it will be treated as a boolean attribute with the value `true`.

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

### fieldsOpenRender

- Type: `MarkdownItFieldOpenRender`

```ts
interface FieldAttrInfo {
  name: string;
  value: string | true;
}

interface FieldMeta {
  /**
   * field name
   */
  name: string;

  /**
   * field level, starting from 0
   */
  level: number;

  /**
   * sorted field attributes, key is attribute name, value is attribute value.
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
```

- Details: Fields container open render.

### fieldsCloseRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Fields container close render.

### fieldOpenRender

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Field item open render.

### fieldCloseRender

- Type: `RenderRule`

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

@child@
Child description.
:::

::::

:::: preview Custom Name and Attributes

```ts
import MarkdownIt from "markdown-it";
import { field } from "@mdit/plugin-field";

const mdIt = MarkdownIt().use(field, {
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
