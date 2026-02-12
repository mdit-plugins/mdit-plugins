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

::: tip Nesting and escaping

- Nesting can be supported by adding 2 indents in your nested content:

  ```md
  ::: fields
  @parent@
  @child@
  Child description
  :::
  ```

- You can also nest different field containers:

  ```ts
  import MarkdownIt from "markdown-it";
  import { field } from "@mdit/plugin-field";

  const mdIt = MarkdownIt().use(field, { name: "props" }).use(field, { name: "events" });
  ```

  ```md
  ::: props
  @prop1@
  ::: events
  @event1@
  :::
  :::
  ```

- If you need to use `@` at the beginning of the line inside a field container, you can use `\` to escape it to `\@`.

- If your field name contains `@`, you can escape it with `\`:

  ```md
  @user\@domain.com@
  ```

:::

## Options

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

interface MarkdownItFieldOptions {
  /**
   * field container name
   *
   * @default "fields"
   */
  name?: string;

  /**
   * Allowed attributes for fields, if not provided, all attributes will be allowed and displayed as-is.
   *
   * Attribute display will be sorted in the order of this array
   */
  allowedAttributes?: FieldAttr[];

  /**
   * fields container open renderer
   */
  fieldsOpenRender?: RenderRule;

  /**
   * fields container close renderer
   */
  fieldsCloseRender?: RenderRule;

  /**
   * field item open renderer
   */
  fieldOpenRender?: MarkdownItFieldOpenRender;

  /**
   * field item close renderer
   */
  fieldCloseRender?: RenderRule;
}
```

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
