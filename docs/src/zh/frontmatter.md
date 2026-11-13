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

`yaml` 与 `yml` 使用 `js-yaml` 的 `CORE_SCHEMA`（YAML 1.2 核心模式），`json` 使用 `JSON.parse`，`parsers` 选项可以添加自定义语言。默认情况下，时间戳与 `yes`/`no` 为字符串，`1e3` 为数字。启用 `parseTimestamps` 只会改变时间戳标量。

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

### 时间戳

默认情况下 YAML 时间戳会保持字符串。设置 `parseTimestamps: true` 后，未加引号的时间戳会解析为 `Date` 对象。仅日期的值会以 `timezone` 的 00:00:00 为基准；如果该本地时间被夏令时跳过，则使用该日期第一个有效的整分钟。

```md
---
date: 2022-07-06
created: 2022-07-06 00:30:00
---
```

使用 `{ parseTimestamps: true, timezone: "Asia/Shanghai" }` 时，`date` 会变成 `2022-07-05T16:00:00.000Z`，`created` 会变成 `2022-07-05T16:30:00.000Z`。`Z` 与 `+08:00` 等显式偏移始终优先。

重复出现的歧义本地时间会取较早的一次。本地时间被夏令时跳过的时间戳会保持字符串；整日被跳过的日期也会保持字符串。无效的 IANA 时区会抛出 `TypeError`。

`Date` 表示某个瞬间，而不是日历日期。仅日期的值应使用同一时区进行格式化；直接调用 `toISOString()` 可能显示为另一天。

## 选项

::: fields
@`delimiters` type=`string | [start: string, end: string]` default=`"---"`

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

@`parseTimestamps` type=boolean default=`false`

是否将未加引号的 YAML 时间戳解析为 `Date` 对象。仅日期的值会以 `timezone` 的 00:00:00 为基准；如果午夜被跳过，则使用该日期第一个有效的整分钟。带引号的时间戳会保持字符串。设置 `yamlOptions.schema` 时，该模式优先。

@`timezone` type=string default=`"UTC"`

用于无显式偏移的时间戳的 IANA 时区，包括仅日期的值。`Z` 与 `+08:00` 始终优先。空值会回退到 `UTC`；无效名称会抛出 `TypeError`。仅当启用 `parseTimestamps` 且未设置 `yamlOptions.schema` 时使用。

@`yamlOptions` type=LoadOptions

传递给 `js-yaml` 的 `load` 函数的选项。`schema` 默认为 `CORE_SCHEMA`（YAML 1.2 核心模式）。启用 `parseTimestamps` 时，默认为 `CORE_SCHEMA` 加一个隐式时间戳标签。可以传入 `YAML11_SCHEMA` 或其他模式改变 YAML 的解析方式。

@`parsers` type=`Record<string, FrontmatterParser>`

以小写语言为键的自定义解析器，例如使用 `toml` 而不是 `TOML`。自定义解析器会覆盖内置的 `yaml`、`yml` 与 `json` 解析器。

```ts
type FrontmatterParser = (source: string) => unknown;
```

解析器必须返回普通对象映射。返回 `null` 或 `undefined` 会被视为空数据，其他值会抛出错误。

@`renderExcerpt` type=boolean default=`true`

是否将提取的摘要渲染为 HTML。为 `false` 时，原始 Markdown 会存入 `env.excerpt`。
:::
