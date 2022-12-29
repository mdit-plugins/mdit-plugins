---
title: "@mdit/plugin-align"
icon: align
---

Plugin to align contents.

::: note

This plugin is based on [@mdit/plugin-container](container.md).

:::

## Usage

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { align } from "@mdit/plugin-align";

const mdIt = MarkdownIt().use(align);

mdIt.render(`\
::: center
Contents to align center
:::
`);
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { align } = require("@mdit/plugin-align");

const mdIt = MarkdownIt().use(align);

mdIt.render(`\
::: center
Contents to align center
:::
`);
```

::::

## Syntax

```md
::: left
Contents to align left
:::

::: center
Contents to align center
:::

::: right
Contents to align right
:::

::: justify
Contents to align justify
:::
```

::::: tip Nesting and escaping

- Nestings can be done by increasing marker number of outer container:

  ```md
  :::: center
  Center contents...
  ::: left
  Left contents..
  :::
  Center contents...
  ::::
  ```

  will be

  :::: center
  Center contents...
  ::: left
  Left contents..
  :::
  Center contents...
  ::::

- Escaping can be done by adding `\` to escape the marker:

  ```md
  \::: left

  :::
  ```

  will be

  \::: left

  :::

:::::

## Demo

:::: center

### Twinkle, Twinkle, Little Star

::: right

——Jane Taylor

:::

Twinkle, twinkle, little star,

How I wonder what you are!

Up above the world so high,

Like a diamond in the sky.

When the blazing sun is gone,

When he nothing shines upon,

Then you show your little light,

Twinkle, twinkle, all the night.

Then the traveller in the dark,

Thanks you for your tiny spark,

He could not see which way to go,

If you did not twinkle so.

In the dark blue sky you keep,

And often thro' my curtains peep,

For you never shut your eye,

Till the sun is in the sky.

'Tis your bright and tiny spark,

Lights the trav’ller in the dark,

Tho' I know not what you are,

Twinkle, twinkle, little star.

::::

::::: details Code

```md
:::: center

### Twinkle, Twinkle, Little Star

::: right

——Jane Taylor

:::

Twinkle, twinkle, little star,

How I wonder what you are!

Up above the world so high,

Like a diamond in the sky.

When the blazing sun is gone,

When he nothing shines upon,

Then you show your little light,

Twinkle, twinkle, all the night.

Then the traveller in the dark,

Thanks you for your tiny spark,

He could not see which way to go,

If you did not twinkle so.

In the dark blue sky you keep,

And often thro' my curtains peep,

For you never shut your eye,

Till the sun is in the sky.

'Tis your bright and tiny spark,

Lights the trav’ller in the dark,

Tho' I know not what you are,

Twinkle, twinkle, little star.

::::
```

:::::
