---
title: "@mdit/plugin-alert"
icon: bell
---

Plugin to support GFM style alerts. ([Ref](https://github.com/orgs/community/discussions/16925))

<!-- more -->

## Usage

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { alert } from "@mdit/plugin-alert";

const mdIt = MarkdownIt().use(alert);

mdIt.render(`
> [!warning]
> Warning Text
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { alert } = require("@mdit/plugin-alert");

const mdIt = MarkdownIt().use(alert);

mdIt.render(`
> [!warning]
> Warning Text
`);
```

::::

<!-- markdownlint-disable MD028 -->

## Syntax

With this plugin you can create block alerts with blockquote starting with `[!ALERT_NAME]` like:

```md
> [!warning]
> This is warning text
```

The `ALERT_NAME` isn't case sensitive and can be the following string:

- `note`
- `tip`
- `important`
- `caution`
- `warning`

::: tip Nesting and escaping

- By default, GFM style alerts can only be placed at root, but you can use `deep: true` to enable deep and nesting support:

  ```js
  md.use(alert, {
    name: "warning",
    deep: true,
  });
  ```

  ```md
  > [!warning]
  > This is warning text
  >
  > > [!warning]
  > > This is a nested warning

  - > [!warning]
    > This is warning text
  ```

  will be

  > [!warning]
  > This is warning text
  >
  > > [!warning]
  > > This is a nested warning
  - > [!warning]
    > This is warning text

- Escaping can be done by adding `\` to escape the `!` `[` or `]` marker:

  ```md
  > [\!warning]
  > This is warning text

  > \[!warning]
  > This is warning text
  ```

  will be

  > [\!warning]
  > This is warning text

  > \[!warning]
  > This is warning text

:::

## Options

```ts
interface MarkdownItAlertOptions {
  /**
   * Allowed alert names
   *
   * @default ['important', 'note', 'tip', 'warning', 'caution']
   */
  alertNames?: string[];

  /**
   * Whether handle deep alert syntax
   *
   * @default false
   */
  deep?: boolean;

  /**
   * Hint opening tag render function
   */
  openRender?: RenderRule;

  /**
   * Hint closing tag render function
   */
  closeRender?: RenderRule;

  /**
   * Hint title render function
   */
  titleRender?: RenderRule;
}
```

## Demo

::: preview Demo

> [!note]
> This is note text

> [!important]
> This is important text

> [!tip]
> This is tip text

> [!warning]
> This is warning text

> [!caution]
> This is caution text

:::

<!-- markdownlint-enable MD028 -->

::: tip Styles

With default options, you can import `@mdit/plugin-alert/style` to apply styles for alert box.

:::
