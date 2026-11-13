import type { LoadOptions } from "js-yaml";

/**
 * Parsed frontmatter file
 *
 * 解析后的 frontmatter 文件
 */
export interface FrontmatterFile {
  /**
   * Parsed frontmatter data
   *
   * 解析后的 frontmatter 数据
   */
  data: Record<string, unknown>;

  /**
   * Markdown content without the frontmatter block
   *
   * 不包含 frontmatter 块的 Markdown 内容
   */
  content: string;

  /**
   * Extracted excerpt
   *
   * 提取的摘要
   */
  excerpt: string;

  /**
   * Raw frontmatter block
   *
   * 原始 frontmatter 块
   */
  matter: string;

  /**
   * Language marker from the opening delimiter
   *
   * Empty when the document has no language marker. The configured `language` option is not
   * reflected here.
   *
   * 开始分隔符后的语言标记
   *
   * 文档没有语言标记时为空。这里不会反映配置的 `language` 选项。
   */
  language: string;

  /**
   * Whether the frontmatter block is empty
   *
   * Frontmatter 块是否为空
   */
  isEmpty: boolean;
}

/**
 * Frontmatter parser
 *
 * Receives the raw frontmatter block. Return a plain object mapping to use as frontmatter data;
 * returning `null` or `undefined` is treated as empty data, while other values throw.
 *
 * Frontmatter 解析器
 *
 * 接收原始 frontmatter 块。返回普通对象映射作为 frontmatter 数据；返回 `null` 或 `undefined` 会被视为空数据，其他值会抛出错误。
 *
 * @param source - Raw frontmatter source / 原始 frontmatter 内容
 * @returns Parsed data / 解析后的数据
 */
export type FrontmatterParser = (source: string) => unknown;

/**
 * Frontmatter excerpt resolver
 *
 * Mutate `file.excerpt` to set a custom excerpt. When set, the built-in delimiter extraction is
 * skipped.
 *
 * Frontmatter 摘要解析器
 *
 * 通过修改 `file.excerpt` 设置自定义摘要。设置后不会再使用内置的分隔符提取逻辑。
 *
 * @param file - Parsed frontmatter file / 解析后的 frontmatter 文件
 */
export type FrontmatterExcerptResolver = (file: FrontmatterFile) => void;

/**
 * Frontmatter plugin options
 *
 * Frontmatter 插件选项
 */
export interface MarkdownItFrontmatterOptions {
  /**
   * Frontmatter delimiters
   *
   * A single delimiter used for both opening and closing, or a tuple of `[open, close]`.
   *
   * Frontmatter 分隔符
   *
   * 可同时用于开始与结束的单个分隔符，或 `[开始, 结束]` 元组。
   *
   * @example
   *   ```ts
   *   delimiters: ["<!--", "-->"]
   *   ```;
   *
   * @default "---"
   */
  delimiters?: string | [start: string, end: string];

  /**
   * Default frontmatter language
   *
   * Used when the opening delimiter is not followed by a language marker. A marker in the document
   * takes precedence.
   *
   * 默认 frontmatter 语言
   *
   * 在开始分隔符后没有语言标记时使用。文档中的语言标记优先。
   *
   * @default "yaml"
   */
  language?: string;

  /**
   * Excerpt extraction setting
   *
   * `true` extracts the content before `excerptSeparator` (falling back to the opening delimiter);
   * a string sets the delimiter directly and takes precedence over `excerpt_separator`; a function
   * receives the parsed file and may set `file.excerpt` itself.
   *
   * 摘要提取设置
   *
   * `true` 提取 `excerptSeparator`（回退到开始分隔符）之前的内容；字符串直接设置分隔符，并优先于
   * `excerpt_separator`；函数接收解析后的文件，可自行设置 `file.excerpt`。
   *
   * @default false
   */
  excerpt?: boolean | string | FrontmatterExcerptResolver;

  /**
   * Excerpt separator
   *
   * Precedence: a string `excerpt` option, then a non-empty string `excerpt_separator` in the
   * frontmatter data, then this option, then the opening delimiter. An empty option value falls
   * back to the opening delimiter. Setting this option alone enables extraction, even when
   * `excerpt` is `false`.
   *
   * 摘要分隔符
   *
   * 优先级：字符串 `excerpt` 选项、frontmatter 数据中的非空字符串
   * `excerpt_separator`、此选项、开始分隔符。选项为空字符串时会回退到开始分隔符。仅设置此选项也会启用提取，即使 `excerpt` 为 `false`。
   */
  excerptSeparator?: string;

  /**
   * Whether to parse YAML timestamps into `Date` objects
   *
   * Date-only values are anchored at 00:00:00 in `timezone`; if midnight is skipped, the first
   * valid time on that date is used. Quoted timestamps remain strings. This option only affects the
   * `yaml` and `yml` parsers. When `yamlOptions.schema` is set, that schema takes precedence.
   *
   * 是否将 YAML 时间戳解析为 `Date` 对象
   *
   * 仅日期的值会以 `timezone` 的 00:00:00 为基准；如果午夜被跳过，则使用该日期第一个有效时间。带引号的时间戳会保持字符串。此选项只影响 `yaml` 与 `yml`
   * 解析器。设置 `yamlOptions.schema` 时，该模式优先。
   *
   * @default false
   */
  parseTimestamps?: boolean;

  /**
   * IANA timezone for YAML timestamps without an explicit offset
   *
   * This includes date-only values. Explicit offsets such as `Z` or `+08:00` always take
   * precedence. Empty values fall back to `UTC`; invalid names throw a `TypeError`. Ambiguous
   * repeated local times use the earlier occurrence. The option is only used when `parseTimestamps`
   * is enabled and `yamlOptions.schema` is not set.
   *
   * 用于无显式偏移的 YAML 时间戳的 IANA 时区
   *
   * 包括仅日期的值。`Z` 或 `+08:00` 等显式偏移始终优先。空值会回退到 `UTC`；无效名称会抛出 `TypeError`。重复出现的歧义本地时间取较早的一次。仅当启用
   * `parseTimestamps` 且未设置 `yamlOptions.schema` 时使用。
   *
   * @default "UTC"
   */
  timezone?: string;

  /**
   * Options passed to `js-yaml`'s `load` function
   *
   * `schema` defaults to `CORE_SCHEMA`, js-yaml's YAML 1.2 core schema. Unless `parseTimestamps` is
   * enabled, timestamps and `yes`/`no` remain strings, while `1e3` is parsed as a number. Pass
   * `YAML11_SCHEMA` or another schema to change how YAML is parsed.
   *
   * 传递给 `js-yaml` 的 `load` 函数的选项
   *
   * `schema` 默认为 `CORE_SCHEMA`，即 js-yaml 的 YAML 1.2 核心模式。除非启用 `parseTimestamps`，时间戳与 `yes`/`no`
   * 会保持字符串，`1e3` 会解析为数字。可以传入 `YAML11_SCHEMA` 或其他模式改变 YAML 的解析方式。
   */
  yamlOptions?: LoadOptions;

  /**
   * Custom frontmatter parsers
   *
   * Keyed by lowercased language, for example `toml` rather than `TOML`. A custom parser overrides
   * the built-in `yaml`, `yml` and `json` parsers.
   *
   * 自定义 frontmatter 解析器
   *
   * 以小写语言为键，例如使用 `toml` 而不是 `TOML`。自定义解析器会覆盖内置的 `yaml`、`yml` 与 `json` 解析器。
   */
  parsers?: Record<string, FrontmatterParser>;

  /**
   * Whether to render the excerpt to HTML
   *
   * When `false`, the raw excerpt Markdown is stored on `env.excerpt`.
   *
   * 是否将摘要渲染为 HTML
   *
   * 为 `false` 时，原始摘要 Markdown 会存入 `env.excerpt`。
   *
   * @default true
   */
  renderExcerpt?: boolean;
}
