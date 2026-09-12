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
- 属性名保持原样，引号只对值生效，因此 `@[video 'a' b](x)` 会得到 `{ "'a'": true, b: true }`
- `__proto__` 会被忽略，因为赋值不会创建自有属性
- 在引号包裹的值中，`\` 用于转义下一个字符

畸形的属性会导致整个语法不匹配，随后该文本会交由其他规则处理，例如 `@[test a=1 = b=2](x)` 会渲染为普通链接。

名称不能为空，也不能包含空白、`[`、`]`、`(`、`)`、`"` 或 `'`，否则插件会抛出错误。名称需要完全匹配，未注册的名称会交由其他规则处理，因此 `@[unknown](x)` 会渲染为普通链接。

链接会原样传递给渲染器：与普通的 Markdown 链接不同，它不会被规范化或校验。生成 HTML 时请自行转义和校验。

不支持在链接中写标题（`@[video](a.mp4 "title")`），请改用属性。

::: tip 转义

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

- Type: `string`
- Required: Yes
- Details: 语法中使用的名称。不能为空，也不能包含空白、`[`、`]`、`(`、`)`、`"` 或 `'`。重复注册同名会覆盖之前的配置。

### inline

- Type: `boolean`
- Details: 语法是否也可在行内使用。

### renderer

- Type: `(link: string, props: AdvancedLinkProps, env: unknown) => string`

```ts
type AdvancedLinkProps = Record<string, string | true>;

type AdvancedLinkRenderer = (link: string, props: AdvancedLinkProps, env: unknown) => string;
```

- Required: Yes
- Details: 生成 HTML 的渲染器。`env` 为 MarkdownIt 环境。链接原样传入，不做规范化与校验。

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
