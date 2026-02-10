---
title: "@mdit/plugin-emoji"
icon: face-smile
---

Emoji plugin for markdown-it.

<!-- more -->

## Install

::: code-tabs#shell

@tab pnpm

```bash
pnpm add @mdit/plugin-emoji
```

@tab yarn

```bash
yarn add @mdit/plugin-emoji
```

@tab npm

```bash
npm i @mdit/plugin-emoji
```

:::

## Usage

```ts
import MarkdownIt from "markdown-it";
import { fullEmoji } from "@mdit/plugin-emoji";

const mdIt = MarkdownIt().use(fullEmoji);

mdIt.render("Hello from mars :satellite:");
```

Different presets are available:

- `fullEmoji`: includes all available emojis support
- `lightEmoji`: includes small subset of most useable emojis
- `bareEmoji`: no defaults, only includes those you defined in options

## Syntax

- `:emoji_name:`
- shortcuts like `:)`, `:D`, etc. (if enabled)

## Demo

::: preview Demo

Hello from mars :satellite:

Classic shortcuts: :-) :-(

:::

## Options

### definitions

- Type: `Record<string, string>`
- Default: `{}` (preset dependent)

Rewrite available emoji definitions. The key is the emoji name, and the value is the emoji character.

Example: `{ name1: 'char1', name2: 'char2', ... }`

### enabled

- Type: `string[]`
- Default: `[]`

If specified, only emojis in this list will be rendered. Otherwise, all emojis in the definitions will be rendered.

### shortcuts

- Type: `Record<string, string | string[]>`
- Default: `{}` (preset dependent)

Rewrite default shortcuts. The key is the emoji name, and the value is the shortcut(s) for the emoji.

Example: `{ "smile": [ ":)", ":-)" ], "laughing": ":D" }`

## Custom Renderer

By default, emojis are rendered as appropriate unicode chars. But you can change the renderer function as you wish.

For example, to use [twemoji](https://github.com/twitter/twemoji):

```ts
import MarkdownIt from "markdown-it";
import { fullEmoji } from "@mdit/plugin-emoji";
import twemoji from "twemoji";

const mdIt = MarkdownIt().use(fullEmoji);

mdIt.renderer.rules.emoji = (tokens, idx) => {
  return twemoji.parse(tokens[idx].content);
};
```

And you can make image height match the line height with this style:

```css
.emoji {
  height: 1.2em;
}
```
