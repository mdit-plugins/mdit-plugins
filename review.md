# mdit-plugins 代码审查报告

- 审查日期：2026-10-20
- 审查范围：仓库级配置、`packages/*/src`、`packages/*/__tests__`、`docs/src`、`scripts`、CI 工作流
- 审查方式：人工通读 + 4 个只读子代理分维度审查（解析器状态、安全、打包/CI、测试与文档）+ 1 个独立子代理逐条复核 + 本地实际运行复现
- 本次结论：**未修改任何源码**，仅补充了 7 个测试文件中的 14 个用例

## 审查基线

在开始审查前，本地执行了完整校验，作为后续判断的基线：

| 命令                     | 结果                                         |
| ------------------------ | -------------------------------------------- |
| `pnpm run build`         | 全部包构建成功                               |
| `pnpm run lint:check`    | 通过                                         |
| `pnpm run lint:md`       | 通过（115 个文件）                           |
| `pnpm run type-check`    | 通过                                         |
| `pnpm run test:coverage` | 120 个测试文件、2216 个用例通过，覆盖率 100% |

> 注意：`lint:check` 和 `type-check` 依赖 `@mdit/helper` 的 `dist` 产物。首次在干净环境检查时，`packages/helper/dist` 是旧版本，缺少 `PluginSimple`、`scanFence` 等导出，导致 548 个类型错误。执行 `pnpm run build` 后全部消失。CI 已先构建再检查，因此不是缺陷，但本地开发需要注意。

## 已补充的测试

| 文件                                                         | 新增覆盖                                          |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `packages/plugin-img-lazyload/__tests__/imgLazyload.spec.ts` | 多图、保留 `title`、引用块内图片                  |
| `packages/plugin-img-mark/__tests__/imgMark.spec.ts`         | light 优先、空标记列表                            |
| `packages/plugin-tasklist/__tests__/tasklist.spec.ts`        | 自定义 class、跨 render id 重置                   |
| `packages/plugin-ruby/__tests__/ruby.spec.ts`                | 未闭合 ruby、多个冒号                             |
| `packages/plugin-uml/__tests__/uml.spec.ts`                  | EOF 自动闭合、`info` 作为 title、闭合标记尾随内容 |
| `packages/plugin-icon/__tests__/icon.spec.ts`                | 自定义 `render` 接收 `env`                        |
| `packages/plugin-align/__tests__/align.spec.ts`              | 嵌套容器、`\:::` 转义                             |

## 高优先级问题

### 1. 行内规则越过 `posMax`，破坏链接与图片解析

- 位置：`packages/plugin-embed/src/plugin.ts:39`、`packages/plugin-tex/src/plugin.ts:186-214`
- 代码特征：`const max = state.src.length`，而不是 `state.posMax`
- 影响：markdown-it 在解析链接/图片 label 时，通过 `silent` 模式调用 `skipToken` 定位 `]`。这两个规则会直接扫描到文档末尾并推进 `state.pos`，导致 `]` 被跳过，链接整体解析失败。
- 复现：

```md
[{%icon x](url)%}
```

```md
[\(a](url)\)
```

- 实际输出：

```html
<p>[<embed /></p>
<p>[<math>a](url)</math></p>
```

- 建议：
  - 所有 inline 扫描边界统一使用 `state.posMax`。
  - 查找闭合标记时一旦 `pos >= state.posMax` 立即放弃。
  - `silent` 分支不要产生副作用；只有确认完整匹配后才推进 `state.pos`。

### 2. `alert` 静默模式泄漏解析状态

- 位置：`packages/plugin-alert/src/plugins.ts:242`、`:289-298`
- 影响：规则在 `silent` 模式下仍执行终止扫描，把 `state.lineMax` 缩小到 `currentLine`。失败路径只在 `!silent` 时恢复状态，成功路径也不恢复。后续 `reference` 规则使用 `state.lineMax` 读取多行引用定义，因此会失败。
- 复现：

```md
foo

> [!tip]
> body

- list item

[ref]: /url

[ref]
```

- 实际：启用 `alert` 时 `[ref]` 输出为字面量；不启用时正常生成链接。
- 建议：
  - 把 `oldLineMax` / `oldParentType` 的保存提前到任何修改之前。
  - `silent` 分支与所有 `return false` 路径统一调用 `restoreState()`。
  - 更好的做法是扫描阶段只记录 `currentLine`，确认成功后再写入 `state.lineMax`。

### 3. `tab` 的四个独立问题

#### 3.1 代码块内的 `@tab` 会切断 tab

- 位置：`packages/plugin-tab/src/plugin.ts:95-117`
- 影响：查找下一个 `@tab` 时不识别围栏代码块，代码块里的 `@tab` 会提前结束当前 tab。
- 复现：

````md
:::tabs
@tab A

```
@tab B
```
:::
````

- 实际：生成两个 tab，第一个代码块为空，第二个代码块还会吞掉容器的 `:::` 结束行。
- 建议：复用 `@mdit/helper` 的 `scanFence` 跳过 fence，`plugin-layout` 和 `plugin-include` 已有先例。

#### 3.2 outdent 内容被静默丢弃

- 位置：`packages/plugin-tab/src/plugin.ts:95-104`、`:117`、`:170`
- 影响：`state.blkIndent` 被设为 `@tab` 的缩进，但扫描循环没有在 `sCount < indent` 时结束。`tokenize` 遇到更浅缩进的行会停止，规则随后把 `state.line` 跳到 `nextLine`，该行既没有被解析，也没有回到上层容器。
- 复现：

```md
:::tabs
@tab A
content
:::
```

- 实际：`content` 完全消失。
- 建议：像 `container` 规则一样，在遇到 outdent 行时 `break`，并保证 `state.line` 与 `tokenize` 的实际结束位置一致。

#### 3.3 `lineMax` 少 1，破坏多行引用定义

- 位置：`packages/plugin-tab/src/plugin.ts:117`、`:288`
- 代码：`state.lineMax = nextLine - (autoClosed ? 1 : 0)`
- 影响：`lineMax` 是排他上界，减 1 后最后一个内容行对嵌套规则不可见。
- 复现：

```md
:::tabs
@tab A
[ref]:
/url
@tab B
x
:::

[ref]
```

- 建议：统一使用排他上界 `nextLine`，参考 markdown-it `blockquote` 对 `lineMax` 的处理。

#### 3.4 浏览器端交互缺陷

- 位置：`packages/plugin-tab/src/tab.ts:89-93`、`:34-40`
- 问题一：点击处理只检查 `event.target.classList`。点击按钮内的 `<strong>` 等子元素时 `target` 不是按钮，事件被直接忽略。
- 问题二：`data-id` 被直接拼进 CSS 选择器 `[data-id="${tabId}"]`。id 含引号等字符时 `querySelectorAll` 会抛 `DOMException`。
- 建议：
  - 用 `event.target.closest<HTMLElement>(".${name}-tab-button")` 定位按钮。
  - 用 `CSS.escape(tabId)` 转义，或遍历节点比较 `dataset.id`。

### 4. `layout` / `field` 同类内容丢失

#### 4.1 `layout` item 丢弃 outdent 内容

- 位置：`packages/plugin-layout/src/plugin.ts:99-130`
- 复现：

```md
@flexs
@flex
Content
@end
```

- 实际：`Content` 被丢弃，`@end` 也被跳过。
- 建议：扫描循环在 `state.sCount[nextLine] < indent` 时结束当前 item；同时确认 `state.line` 不越过未解析行。

#### 4.2 `field` item 扫描不跳过 fence

- 位置：`packages/plugin-field/src/rules.ts:319-338`
- 复现：

````md
:::fields
@`prop1`

```
@`prop2`
```
:::
````

- 实际：`prop1` 在围栏内部被截断，并额外生成 `prop2` 字段。
- 建议：复用 `scanFence`，与 `layout`、`include` 保持一致。

### 5. `inline-rule` 共享 `attrs` 数组引用

- 位置：`packages/plugin-inline-rule/src/plugin.ts:70`、`:179`，`packages/plugin-spoiler/src/plugin.ts:12-17`
- 影响：同一个 `attrs` 数组被赋给每个 token。`@mdit/plugin-attrs` 的 `attrJoin` 会原地修改内层数组，导致属性泄漏到同一实例的所有 token。
- 复现：

```md
!!a!!{.x}

!!b!!
```

- 实际：两个 spoiler 都带 `class="spoiler x"`。
- 建议：赋值时复制，例如：

```ts
token.attrs = attrs.map(([key, value]) => [key, value]);
```

- 说明：`plugin-spoiler` 的注释只解决了跨实例共享，未解决跨 token 共享。

### 6. renderer 中修改 token，导致重复渲染结果错误

| 插件        | 位置                                                  | 症状                                                                          |
| ----------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `container` | `packages/plugin-container/src/plugin.ts:29`          | 同一 token 流渲染两次得到 `class="note note"`                                 |
| `plantuml`  | `packages/plugin-plantuml/src/plugin.ts:34-36`、`:59` | UML 模式重复 `src`/`alt`；fence 模式第二次渲染退化为 `<pre><code>`            |
| `include`   | `packages/plugin-include/src/plugin.ts:411-421`       | 子目录 include 的 `src` 每次渲染多一层：`./sub/img.png` → `./sub/sub/img.png` |

- 影响：`md.render()` 每次都会重新 parse，因此常规用法不易暴露；但对 `md.parse()` + `renderer.render()` 复用 token 流的场景（编辑器预览、缓存渲染、测试）会直接出错。
- 建议：
  - 把 token 变更移到 core 规则阶段。
  - 或在 renderer 中基于 `token.meta` 保存的原始值计算，而不是在当前值上递归拼接。
  - 至少保证操作幂等。

### 7. `uml` 默认渲染器存在 XSS

- 位置：`packages/plugin-uml/src/options.ts:38`
- 代码：`title` 已转义，但 `token.content` 原样拼入 HTML。
- 影响：不需要 `html: true`，只要启用 `uml` 且使用默认 renderer，Markdown 作者即可注入任意 HTML。
- 复现：

```md
@start
</div><script>alert(1)</script>
@end
```

- 建议：
  - 默认 renderer 对 `content` 使用 `escapeHtml`。
  - 需要原始 HTML 的调用方显式传入自定义 `renderer`。
  - 该修复会改变现有行为，建议在 CHANGELOG 中标注为安全修复。

### 8. 构建脚本失效

| 位置                                  | 问题                                                   | 影响                                                                         |
| ------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `scripts/analyze.ts:12`、`:24`、`:30` | 扫描 `packages/*/lib`，实际输出到 `dist`               | `bundle:analyze` 永远只打印 warning 并以 0 退出，Codecov bundle 分析从未上传 |
| `scripts/bootstrap.ts:6`、`:25`       | 把 `lerna.json` 的 `"version": "independent"` 写入新包 | 生成非法 semver，`lerna version` / `npm publish` 会失败                      |
| `scripts/bootstrap.ts:44-49`          | `exports` 使用 `type:`                                 | 标准条件应为 `types:`，在 `node16`/`bundler` 解析模式下类型失效              |
| `scripts/bootstrap.ts:9-21`           | 遍历 `packages/` 下所有目录                            | `packages/abbr` 等 36 个残留目录会生成重复包名，`pnpm install` 直接报错      |

- 建议：
  - `analyze.ts` 改为扫描 `dist`，并在找不到包时以非零码退出。
  - `bootstrap.ts` 使用 `0.0.0` 作为初始版本。
  - 只处理包含 `src/index.ts` 的目录，并跳过已存在 `package.json` 的目录。

## 中优先级问题

| 问题                                                                                        | 位置                                                                                         | 建议                                                                                    |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `\[...\]` block 规则 silent 返回 `true`，但非 silent 找不到闭合标记时返回 `false`，拆分段落 | `packages/plugin-tex/src/plugin.ts:345`、`:390`                                              | silent 时也确认存在 `\]`，或失败时不返回 `true`                                         |
| `::foo\nbar::` 跨行匹配，class 中出现换行                                                   | `packages/plugin-icon/src/plugin.ts:20-75`                                                   | 扫描到 `\n` 即失败                                                                      |
| snippet 拒绝符号链接                                                                        | `packages/plugin-snippet/src/plugin.ts:136`                                                  | 用 `statSync` 或 `realpath` 后再 `isFile()`；若有意限制则写入文档                       |
| demo code token map 错误                                                                    | `packages/plugin-demo/src/plugin.ts:150`                                                     | `showCodeFirst` 时在 `tokenize` 之后设置 map，统一为 `[startLine + 1, nextLine]`        |
| include 只解析以 `.` 开头的 URL                                                             | `packages/plugin-include/src/plugin.ts:411`                                                  | 与 `docs/src/include.md:57` 对齐：支持裸相对路径，或把文档改为“仅 `./`、`../` 前缀”     |
| `attrs` 可注入 `javascript:` 与事件属性                                                     | `packages/plugin-attrs/src/helper/addAttrs.ts:26`、`getAttrs.ts:42-51`                       | 默认拒绝 `on*` 与危险 URL scheme，或显著标注安全边界                                    |
| `icon` 内置 renderer 支持任意属性                                                           | `packages/plugin-icon/src/utils.ts:175-179`                                                  | 同上，过滤 `on*`                                                                        |
| `engines` 不一致                                                                            | `packages/plugin-field/package.json:64`（`>=20`），`plugin-anchor`、`plugin-layout` 缺失     | 统一为 `>=22`                                                                           |
| slim 包 `repository.directory` 指向错误                                                     | `packages/plugin-katex-slim/package.json:23`、`packages/plugin-mathjax-slim/package.json:23` | 指向自身目录                                                                            |
| `footnote` 缺少 `peerDependenciesMeta`                                                      | `packages/plugin-footnote/package.json:49-52`                                                | 与其余包一致，标记 `markdown-it` 为 optional                                            |
| 覆盖率没有阈值                                                                              | `vitest.config.ts:15-19`                                                                     | 增加 `thresholds`，否则 CI 无法守住 100% 覆盖率的约定                                   |
| 发布门禁弱于文档                                                                            | `.github/workflows/publish.yml:51-54`                                                        | 增加 `type-check`、`lint:md`、`test:coverage`                                           |
| type-aware lint 从未执行                                                                    | `package.json:12-13`、`.husky/pre-commit`                                                    | 加 `--type-check --type-aware`，或移除 `oxlint-tsgolint` 并修正文档                     |
| `lint:md` glob 未加引号                                                                     | `package.json:14`                                                                            | 改为 `markdownlint-cli2 "**/*.md"`                                                      |
| `tsconfig` 纳入 `dist`                                                                      | `tsconfig.json:3-4`                                                                          | `exclude` 增加 `**/dist/**`                                                             |
| 文档配置存在死代码                                                                          | `docs/src/.vuepress/config.ts:50`                                                            | `token.info.trim().slice(4).trim()` 不会是 `null`，`?? "Hint"` 无效；改用 `\|\| "Hint"` |

## 文档与 JSDoc 问题

- 根 `README.md:21-56` 漏列 `@mdit/plugin-advanced-links` 与 `@mdit/plugin-field`；`:48` 有多余右括号。
- `docs/src/icon.md:58`、`:60`（及中文版）链接指向不存在的 `__tests__/render.ts` / `utils.ts`，应为 `.spec.ts`。
- `docs/src/mathjax.md:113` 声称 `createMathjaxInstance` 可能 resolve 为 `null`，实现从不返回 `null`。
- `docs/src/uml.md:57-73`、`docs/src/tab.md:80` 把运行时已有默认值的选项标为“必填”。
- `packages/plugin-alert/src/options.ts:9` 的默认值顺序与 `packages/plugin-alert/src/plugins.ts:337` 不一致（集合语义下无行为差异）。
- 双语 JSDoc 缺失：
  - `packages/plugin-icon/src/options.ts:2`
  - `packages/plugin-spoiler/src/options.ts:3`、`:6`
  - `packages/plugin-tab/src/options.ts:84-96`
  - `packages/plugin-inline-rule/src/options.ts:90-91`
  - `packages/plugin-uml/src/options.ts:5-31`
- `packages/plugin-include/src/options.ts:9` 与 `packages/plugin-snippet/src/options.ts:9` 把必填的 `currentPath` 误标为 `@default (path) => path`，该默认值实际属于 `resolvePath`。
- 超过 500 行的测试文件建议按 `basic` / `nesting` / `options` 拆分：
  - `plugin-include/__tests__/include.spec.ts`
  - `plugin-tab/__tests__/tab.spec.ts`
  - `plugin-embed/__tests__/embed.spec.ts`
  - `plugin-dl/__tests__/dl.spec.ts`
  - `plugin-tex/__tests__/tex.spec.ts`
  - `plugin-container/__tests__/container.spec.ts`
  - `plugin-alert/__tests__/alert.spec.ts`
  - `plugin-attrs/__tests__/rules/table.spec.ts`

## 判定为非问题

以下现象在审查中出现，但复核后认为不应按缺陷处理：

- **`md.parse(src)` 不传 `env` 会崩溃**：`abbr`、`footnote`、`tasklist`、`anchor`、`field`、`tab`、`dl`、`layout` 会直接解引用 `state.env`。但 markdown-it 15 的类型签名要求 `parse(src, env)`，只有 `render()` / `renderInline()` 默认传入 `{}`。这属于不支持的用法，不是插件缺陷。若想增强健壮性，可在规则入口 `state.env ??= {}`，但不必作为本次修复项。
- **`include` / `snippet` 的任意文件读取**：这是插件的设计能力。风险在于文档没有声明“仅用于可信 Markdown”，建议补充安全说明，而不是改变行为。
- **`include` 裸相对路径不解析**：文档表述较宽泛，但所有示例都使用 `./` 前缀，是否算缺陷存在解释空间，建议以文档澄清为主。
- **`icon` 跨行匹配**：行为本身已确认，但 HTML class 中的换行等价于空白分隔，文档也未规定必须单行，严重性取决于设计意图，可按低优先级处理。

## 建议的修复顺序

1. **解析正确性**：`embed` / `tex` 的 `posMax`、`alert` 状态恢复、`tab` / `layout` / `field` 的 fence 与 outdent、`inline-rule` 的 `attrs` 复制。
2. **渲染幂等性**：`container`、`plantuml`、`include` 的渲染期 token 修改。
3. **安全**：`uml` 内容转义、`attrs` / `icon` 属性白名单与文档警告。
4. **工程化**：`bootstrap` / `analyze` 脚本、覆盖率阈值、发布门禁、包元数据。
5. **文档与 JSDoc**：统一清理。

## 附录：验证方法

- 每个疑似缺陷都先写最小复现用例，在对应包目录下执行 `pnpm exec vitest run`。
- 涉及 `@deflate` 别名的 `plugin-plantuml` 从仓库根目录运行，以便加载 `vitest.config.ts` 中的别名。
- 复核阶段由独立子代理只读检查源码与 markdown-it 15.0.2 打包源码，逐条给出 `CONFIRMED` / `PARTIALLY CORRECT` / `FALSE POSITIVE` 结论。
- 所有临时验证文件在结束后已删除，仓库仅保留正式新增的测试用例。
