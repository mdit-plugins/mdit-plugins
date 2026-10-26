---
title: "@mdit/plugin-embed"
shortTitle: "plugin-embed"
icon: code
---

Embed external content in your Markdown.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import { embed } from "@mdit/plugin-embed";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(embed, {
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
import { embed } from "@mdit/plugin-embed";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(embed, {
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

```md
{% name params %}
```

Where:

- `name` is the embed type identifier
- `params` are the parameters passed to the setup function

::: tip Escaping

To escape the embed syntax, use a backslash before the opening/closing brace:

```md
\{% name params %}
```

You can also escape these markers in contents:

```md
\{% name params-containing-\{%value%\} %}
```

:::

## Options

::: fields
@`config` type=`EmbedConfig[]` required

An array of embed configurations.

```ts
interface EmbedConfig {
  /** Embed token name */
  name: string;

  /**
   * Setup function to generate embed HTML
   *
   * @param ref
   * @param isInline If `allowInline` is true, `isInline` represent that current matched content is
   *   inline
   * @returns
   */
  setup: (ref: string, isInline: boolean) => string;

  /**
   * Whether the embed can be used inline
   *
   * @default false
   */
  allowInline?: boolean;
}
```

@@`config.name` type=string

The token name used in the embed syntax.

@@`config.setup` type=`(ref: string, isInline: boolean) => string`

A function that takes the parameters and returns the HTML string to embed.

@@`config.allowInline` type=boolean default=`false`

Whether the embed can be used inline. It is block-level only when set to `false`.

When `allowInline` is set to `true`, the embed works both as a block (on its own line) and inline (inside a paragraph).

:::

## Examples

With usage example, the following embeds are supported:

**Input:**

```md
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

```md
Click the {% icon home %} button to go home.
```

**Output:**

```html
Click the <i class="icon icon-home"></i> button to go home.
```

## Advanced Usage

### Complex Parameters

You can handle complex parameters inside the `setup` function:

```ts
const md = new MarkdownIt().use(embed, {
  config: [
    {
      name: "video",
      setup: (params: string, isInline: boolean) => {
        // Parse parameters: src width height
        const [src, width = "560", height = "315"] = params.split(" ");
        return `<video width="${width}" height="${height}" controls>
          <source src="${src}" type="video/mp4">
          Your browser does not support video playback.
        </video>`;
      },
    },
  ],
});
```

**Input:**

```md
{% video https://example.com/video.mp4 800 600 %}
```

### Multiple Embed Types

You can configure multiple different embed types:

```ts
const md = new MarkdownIt().use(embed, {
  config: [
    // YouTube
    {
      name: "youtube",
      setup: (id) => `<iframe src="https://www.youtube.com/embed/${id}"></iframe>`,
    },
    // Bilibili
    {
      name: "bilibili",
      setup: (bvid) =>
        `<iframe src="https://player.bilibili.com/player.html?bvid=${bvid}"></iframe>`,
    },
    // Custom HTML
    {
      name: "alert",
      setup: (message) => `<div class="alert alert-warning">${message}</div>`,
    },
  ],
});
```

**Usage:**

```md
{% youtube dQw4w9WgXcQ %}

{% bilibili BV1xx411c7mu %}

{% alert This is an important notice! %}
```

## Caveats

1. **Security**: Make sure to handle user input properly in the `setup` function to avoid XSS attacks.
2. **Performance**: Consider lazy loading when you have a large number of embeds.
3. **Compatibility**: Make sure the generated HTML is compatible with your target environment.

## Migration Guide

If you are migrating from another embed plugin, here are some common migration examples:

### Migrating from markdown-it-video

```ts
// Before
md.use(video);

// Now
md.use(embed, {
  config: [
    {
      name: "video",
      setup: (src) => `<video controls><source src="${src}"></video>`,
    },
  ],
});
```

### Migrating from markdown-it-youtube

```ts
// Before
md.use(youtube);

// Now
md.use(embed, {
  config: [
    {
      name: "youtube",
      setup: (id) => `<iframe src="https://www.youtube.com/embed/${id}"></iframe>`,
    },
  ],
});
```
