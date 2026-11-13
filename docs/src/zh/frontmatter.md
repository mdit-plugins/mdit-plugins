---
title: "@mdit/plugin-frontmatter"
shortTitle: "plugin-frontmatter"
icon: file-lines
---

提取 YAML frontmatter 与可选摘要的插件。

<!-- more -->

## 使用

```ts
import { frontmatter } from "@mdit/plugin-frontmatter";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt().use(frontmatter);
const env = {};

md.render(
  `---
title: Hello
---
# Hello`,
  env,
);

env.content; // "# Hello"
env.frontmatter; // { title: "Hello" }
env.excerpt; // ""
```

解析后的数据会合并到 `env.frontmatter`，因此解析值会覆盖已有值。移除 frontmatter 块后的 Markdown 内容会存入 `env.content`，并交给后续规则。

## 语法

以 `---` 分隔的首个块会作为 YAML 解析，并从渲染内容中移除：

```md
---
title: Hello
tags:
  - frontmatter
---

# Hello
```

在开始分隔符后紧跟语言标记可以选择其他解析器：

```md
---json
{"title":"Hello"}
---
```

`yaml` 与 `yml` 使用 `js-yaml` 的 `YAML11_SCHEMA`，`json` 使用 `JSON.parse`，`parsers` 选项可以添加自定义语言。时间戳会解析为 `Date`，`yes`/`no` 会解析为布尔值，并支持合并键以及 `!!binary`、`!!omap`、`!!pairs`、`!!set` 标签。

以 `----` 等扩展分隔符开头的行会被视为水平分割线，而不是 frontmatter。

### 摘要

启用 `excerpt` 后，会提取 `excerptSeparator` 之前的内容。优先级为：字符串 `excerpt` 选项、frontmatter 数据中的非空 `excerpt_separator` 键、`excerptSeparator` 选项、开始分隔符。选项为空字符串时也会回退到开始分隔符：

```md
---
title: Hello
---

# Hello

<!-- more -->

Body
```

使用 `{ excerpt: true, excerptSeparator: "<!-- more -->" }` 时，`env.excerpt` 会渲染为 `<h1>Hello</h1>\n`。仅设置 `excerptSeparator` 也会启用提取，即使 `excerpt` 为 `false`。设置 `renderExcerpt: false` 可以保留原始 Markdown。

## 选项

::: fields
@`delimiters` type=`string | [string, string]` default=`"---"`

开始与结束分隔符。传入单个字符串时开始与结束使用同一分隔符，也可以传入元组使用不同的分隔符。

```ts
delimiters: ["<!--", "-->"];
```

@`language` type=string default=`"yaml"`

开始分隔符后没有语言标记时使用的解析器。文档中的语言标记优先。

@`excerpt` type=`boolean | string | FrontmatterExcerptResolver` default=`false`

控制摘要提取。`true` 提取 `excerptSeparator`（回退到开始分隔符）之前的内容，字符串直接设置分隔符并优先于 `excerpt_separator`，函数可以自行设置 `file.excerpt`。

```ts
type FrontmatterExcerptResolver = (file: FrontmatterFile) => void;

interface FrontmatterFile {
  data: Record<string, unknown>;
  content: string;
  excerpt: string;
  matter: string;
  language: string;
  isEmpty: boolean;
}
```

@`excerptSeparator` type=string

摘要分隔符。优先级：字符串 `excerpt` 选项、frontmatter 数据中的非空字符串 `excerpt_separator`、此选项、开始分隔符。空值会回退到开始分隔符。仅设置此选项也会启用提取，即使 `excerpt` 为 `false`。

@`yamlOptions` type=LoadOptions

传递给 `js-yaml` 的 `load` 函数的选项。`schema` 默认为 `YAML11_SCHEMA`。可以传入其他模式改变 YAML 的解析方式。

@`parsers` type=`Record<string, FrontmatterParser>`

以小写语言为键的自定义解析器，例如使用 `toml` 而不是 `TOML`。自定义解析器会覆盖内置的 `yaml`、`yml` 与 `json` 解析器。

```ts
type FrontmatterParser = (source: string) => unknown;
```

解析器必须返回普通对象映射。返回 `null` 或 `undefined` 会被视为空数据，其他值会抛出错误。

@`renderExcerpt` type=boolean default=`true`

是否将提取的摘要渲染为 HTML。为 `false` 时，原始 Markdown 会存入 `env.excerpt`。
:::
