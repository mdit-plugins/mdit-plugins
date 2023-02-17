---
title: "@mdit/plugin-stylize"
icon: style
---

Plugin for stylizing token.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { stylize } from "@mdit/plugin-stylize";

const mdIt = MarkdownIt().use(stylize, {
  config: [
    // your options
  ],
});

mdIt.render("Check FAQ for more details._Recommended_");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { stylize } = require("@mdit/plugin-stylize");

const mdIt = MarkdownIt().use(stylize, {
  config: [
    // your options
  ],
});

mdIt.render("Check FAQ for more details._Recommended_");
```

:::

The `config` option receives an array, where each element accepts 2 options:

- `matcher`: should be `string` or `RegExp`.

- `replacer`: a function customizing the matched token

For example, you can use the following config to transform `*Recommended*` into a Badge `<Badge type="tip">Recommended</Badge>`:

```ts {3-13}
mdIt.use(stylize, {
  config: [
    {
      matcher: "Recommended",
      replacer: ({ tag }) => {
        if (tag === "em")
          return {
            tag: "Badge",
            attrs: { type: "tip" },
            content: "Recommended",
          };
      },
    },
  ],
});
```

<!-- markdownlint-disable MD033 -->

Another example is you want a to set all the emphasis `n’t` words to red color, so that `Setting this to a invalid syntax *doesn’t* have any effect.` becomes: "Setting this to a invalid syntax <span style="color:red">doesn’t</span> have any effect."

<!-- markdownlint-enable MD033 -->

```ts {3-13}
mdIt.use(stylize, {
  config: [
    {
      matcher: /n’t$/,
      replacer: ({ tag, attrs, content }) => {
        if (tag === "em")
          return {
            tag: "span",
            attrs: { ...attrs, style: "color: red" },
            content,
          };
      },
    },
  ],
});
```

Also, we provide a `localConfigGetter` to receive env object in case you want to apply local rules in certain situations.

```ts {2,7-17}
mdIt.use(stylize, {
  localConfigGetter: (env) => env.stylize || [],
});

mdIt.render("Check FAQ for more details._Recommended_", {
  stylize: [
    {
      matcher: "Recommended",
      replacer: ({ tag }) => {
        if (tag === "em")
          return {
            tag: "Badge",
            attrs: { type: "tip" },
            content: "Recommended",
          };
      },
    },
  ],
});
```

::: info Performance

To avoid performance impact, you should try to avoid using RegExp for better performance unless you need it.

Also try to create snippets with RegExp having lower costs, e.g: RegExp starting with `^` and ending with `$`.

For example, if you only want to match "SHOULD", "MUST" and "MAY", you should write `/^(?:SHOULD|M(?:UST|AY))$/u` instead of `/SHOULD|MUST|MAY/u`. The fist one will only match 2 time with "A loo...oong content" with 1000 characters, but will match nearly 3000 times with the second RegExp.

:::

## Options

```ts
interface MarkdownItStylizeResult {
  /**
   * Tag name
   */
  tag: string;

  /**
   * Attributes settings
   */
  attrs: Record<string, string>;

  /**
   * Tag content
   */
  content: string;
}

interface MarkdownItStylizeConfig {
  /**
   * Inline token matcher
   */
  matcher: string | RegExp;

  /**
   * Content Replacer
   */
  replacer: (options: {
    tag: string;
    content: string;
    attrs: Record<string, string>;
    env?: any;
  }) => MarkdownItStylizeResult | void;
}

interface MarkdownItStylizeOptions {
  /**
   * Stylize config
   */
  config?: MarkdownItStylizeConfig[];

  /**
   * Local config getter
   *
   * @param env Markdown env object
   * @returns local stylize config
   */
  localConfigGetter?: (env?: any) => MarkdownItStylizeConfig[] | null;
}
```
