# Embed

Embed external content in your Markdown.

<!-- more -->

## Install

::: code-tabs#shell

@tab pnpm

```bash
pnpm add @mdit/plugin-embed
```

@tab yarn

```bash
yarn add @mdit/plugin-embed
```

@tab npm

```bash
npm i @mdit/plugin-embed
```

:::

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { embed } from "@mdit/plugin-embed";

const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "youtube",
      setup: (id: string) =>
        `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    },
    {
      name: "icon",
      allowInline: true,
      setup: (name: string) => `<i class="icon icon-${name}"></i>`,
    },
  ],
});
```

@tab JS

```js
import MarkdownIt from "markdown-it";
import { embed } from "@mdit/plugin-embed";

const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "youtube",
      setup: (id) =>
        `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    },
    {
      name: "icon",
      allowInline: true,
      setup: (name) => `<i class="icon icon-${name}"></i>`,
    },
  ],
});
```

:::

## Syntax

The plugin parses embed syntax in the format:

```markdown
{% name params %}
```

Where:

- `name` is the embed type identifier
- `params` are the parameters passed to the setup function

::: tip Escaping

To escape the embed syntax, use a backslash before the opening/closing brace:

```markdown
\{% name params %}
```

You can also escape these markers in contents:

```markdown
\{% name params-containing-\{%value%\} %}
```

## Examples

With usage example, the following embeds are supported:

**Input:**

```markdown
{% youtube dQw4w9WgXcQ %}
```

**Output:**

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  frameborder="0"
  allowfullscreen
></iframe>
```

**Input:**

```markdown
Click the {% icon home %} button to go home.
```

**Output:**

```html
Click the <i class="icon icon-home"></i> button to go home.
```

## Options

### config

- Type: `EmbedConfig[]`
- Default: `[]`

An array of embed configurations.

```ts
interface EmbedConfig {
  /**
   * Embed token name
   */
  name: string;

  /**
   * Setup function to generate embed HTML
   * @param params
   * @param isInline If `allowInline` is true, `isInline` represent that current matched content is inline
   * @returns
   */
  setup: (params: string, isInline: boolean) => string;

  /**
   * Whether the embed can be used inline
   * @default false
   */
  allowInline?: boolean;
}
```

Each configuration must have:

- `name`: The token name used in the embed syntax
- `setup`: A function that takes the parameters and returns the HTML string to embed
- `allowInline`: Optional, whether the embed can be used inline (defaults to `false`, block-level only)
