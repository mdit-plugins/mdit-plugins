---
title: "@mdit/plugin-advanced-links"
icon: paperclip
---

注册自定义的 `@[name ...props](link)` 语法，并使用你自己的渲染器。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { advancedLinks } from "@mdit/plugin-advanced-links";

const md = new MarkdownIt()
  .use(advancedLinks, {
    name: "video",
    renderer: (link, props) =>
      `<video src="${link}" controls${props.autoplay ? " autoplay" : ""}></video>`,
  })
  .use(advancedLinks, {
    name: "badge",
    inline: true,
    renderer: (link, props) => `<span class="badge badge-${link}">${props.text || link}</span>`,
  });
```

@tab JS

```js
import MarkdownIt from "markdown-it";
import { advancedLinks } from "@mdit/plugin-advanced-links";

const md = new MarkdownIt()
  .use(advancedLinks, {
    name: "video",
    renderer: (link, props) =>
      `<video src="${link}" controls${props.autoplay ? " autoplay" : ""}></video>`,
  })
  .use(advancedLinks, {
    name: "badge",
    inline: true,
    renderer: (link, props) => `<span class="badge badge-${link}">${props.text || link}</span>`,
  });
```

:::

插件可以使用任意多次，每次调用注册一个 `name`。

## 语法

```markdown
@[name ...props](link)
```

- `name` 是注册的标识符，其后必须紧跟空白或 `]`
- `props` 是可选的，可以写成 `key`、`key=value`、`key="value"` 或 `key='value'`
- `link` 是链接地址

属性会被解析为对象：

- 不带值的属性为 `true`，例如 `@[video autoplay](a.mp4)` 会得到 `{ autoplay: true }`
- 带值的属性会以字符串保留，例如 `@[video title=Hello](a.mp4)` 会得到 `{ title: "Hello" }`
- 重复的属性名会保留最后一个值，例如 `@[video a=1 a=2](a.mp4)` 会得到 `{ a: "2" }`

### 转义

大部分属性都是简单值。当值里包含空白、`]` 或 `=` 时，用引号把它包起来：

```markdown
@[video title="Hello world" caption="1]2"](a.mp4)
```

属性名不能用引号包起来，而 `]` 会结束属性，因此用 `\` 转义：

```markdown
@[video a\ b=1](a.mp4)
```

`\` 也可以在属性名与属性值中转义 `]`、`=` 以及 `\` 本身（写作 `\\`）。完整的规则见下方折叠区块。

::: details 语法细则

属性可以写成 `key`、`key=value`、`key="value"` 或 `key='value'`。

分词：

- 空白用于分隔属性，属性在结束语法的 `]` 处结束。
- 属性名结束于第一个空白或 `=`，且不能为空，因此 `@[video =1](a.mp4)` 不匹配。
- `=` 之后的 `"` 或 `'` 会开启引号包裹的属性值，它只会以配对的引号结束，因此可以包含空白、`]` 与 `=`。
- 否则属性值不带引号，以空白或 `]` 结束，但可以包含 `=`，因此 `@[video a=b=c](a.mp4)` 会得到 `{ a: "b=c" }`。

转义：

- `\` 用于转义属性名与属性值中的下一个字符，被转义的字符按字面处理。
- 在引号之外书写 `]` 必须转义：`@[video title=1\]2](a.mp4)` 会得到 `{ title: "1]2" }`。
- 只有经过转义，空白与 `=` 才能成为属性名或未加引号的属性值的一部分：`@[video a\ b=c\ d](a.mp4)` 会得到 `{ "a b": "c d" }`，`@[video a\=b](a.mp4)` 会得到 `{ "a=b": true }`。
- `\` 本身写作 `\\`，而属性末尾或换行之前的 `\` 属于格式错误。

引号：

- 只有紧跟在 `=` 之后的引号才会开启引号包裹的属性值，其他位置的引号都是普通字符，因此 `@[video a=it's](a.mp4)` 会得到 `{ a: "it's" }`。
- 因此 `@[video a= 'x'](a.mp4)` 会得到 `{ a: "", "'x'": true }`。
- 引号包裹的属性值内部同样适用上述转义，因此 `@[video a="x\"y"](a.mp4)` 会得到 `{ a: 'x"y' }`。

属性名：

- 属性名除 `\` 转义外保持原样：不会被转换为小写、不会被去掉引号，也不会被实体解码，因此 `@[video 'a' b](x)` 会得到 `{ "'a'": true, b: true }`。
- `__proto__` 会被忽略，因为赋值不会创建自有属性。

链接：

- 链接不加规范化与校验，这一点与普通的 Markdown 链接不同：MarkdownIt 会解析其中的反斜杠转义与 HTML 实体，但结果既不会被百分号编码，也不会被校验。

限制：

- 属性不能跨行。
- 属性不会被实体解码，因此 `@[video a=&amp;](a.mp4)` 会得到 `{ a: "&amp;" }`。
- 格式错误的属性（例如空 key、悬空的 `\`、没有闭合引号的引号值）会导致整个语法不匹配，随后该文本会交由其他规则处理，例如 `@[test a=1 = b=2](x)` 会渲染为普通链接。

:::

名称不能为空，也不能包含空白、`[`、`]`、`(`、`)`、`"` 或 `'`，否则插件会抛出错误。名称需要完全匹配，未注册的名称会交由其他规则处理，因此 `@[unknown](x)` 会渲染为普通链接。

链接不加规范化与校验地传递给渲染器，生成 HTML 时请自行转义和校验。不支持在链接中写标题（`@[video](a.mp4 "title")`），请改用属性。

::: tip 纯文本语法

若要保留为纯文本，请转义语法的每个部分，或使用行内代码：

```markdown
\@\[video\](a.mp4)
```

:::

### 块级与行内

默认情况下该语法仅在块级有效，且必须独占整行。

设置 `inline: true` 后也可在段落中使用。当此类语法独占整行时，仍会按块级渲染，因此不会生成 `<p>`。

块级语法无法打断 setext 标题的下划线，因此后面紧跟以 `===` 或 `---` 开头的行时，上一块会被转换为标题。

## 选项

### name

- 类型：`string`
- 必填：是
- 详情：语法中使用的名称。不能为空，也不能包含空白、`[`、`]`、`(`、`)`、`"` 或 `'`。重复注册同名会覆盖之前的配置。

### inline

- 类型：`boolean`
- 详情：语法是否也可在行内使用。

### renderer

- 类型：`(link: string, props: AdvancedLinkProps, env: unknown) => string`

```ts
type AdvancedLinkProps = Record<string, string | true>;

type AdvancedLinkRenderer = (link: string, props: AdvancedLinkProps, env: unknown) => string;
```

- 必填：是
- 详情：生成 HTML 的渲染器。`env` 为 MarkdownIt 环境。链接不会被规范化或校验。

## 示例

以上述用法为例：

**输入：**

```markdown
@[video](a.mp4)
```

**输出：**

```html
<video src="a.mp4" controls></video>
```

**输入：**

```markdown
@[video autoplay](a.mp4)
```

**输出：**

```html
<video src="a.mp4" controls autoplay></video>
```

**输入：**

```markdown
前往 @[badge primary text="首页"](home)。
```

**输出：**

```html
<p>前往 <span class="badge badge-home">首页</span>。</p>
```
