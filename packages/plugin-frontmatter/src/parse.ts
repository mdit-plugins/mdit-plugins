/** Forked and modified from https://github.com/jonschlinkert/gray-matter/blob/master/index.js */

import {
  binaryTag,
  CORE_SCHEMA,
  intYaml11Tag,
  load,
  mergeTag,
  omapTag,
  pairsTag,
  Schema,
  setTag,
  timestampTag,
} from "js-yaml";

import type {
  FrontmatterFile,
  FrontmatterParser,
  MarkdownItFrontmatterOptions,
} from "./options.js";

const BOM_CODE = 0xfeff;
const DEFAULT_DELIMITER = "---";
const DEFAULT_LANGUAGE = "yaml";
const COMMENT_LINE_RE = /^\s*#.*$/gm;

/**
 * YAML schema based on gray-matter's js-yaml 3 `safeLoad` default
 *
 * Js-yaml 3's safe schema is the core schema plus timestamps, merge keys, binary/omap/pairs/set
 * tags and YAML 1.1 scalar formats. js-yaml 5's `CORE_SCHEMA` no longer parses timestamps or YAML
 * 1.1 integers, so use `intYaml11Tag` in place of the core integer tag and add the missing tags.
 * The core float tag is kept so `1e3` stays a number (YAML 1.1 would make it a string), and
 * `yes`/`no` remain strings.
 */
const DEFAULT_YAML_SCHEMA = new Schema([
  ...CORE_SCHEMA.tags.map((tag) => (tag.tagName === "tag:yaml.org,2002:int" ? intYaml11Tag : tag)),
  timestampTag,
  mergeTag,
  binaryTag,
  omapTag,
  pairsTag,
  setTag,
]);

interface LanguageInfo {
  language: string;
  rest: string;
}

/**
 * Resolve configured delimiters
 *
 * @param delimiters - Delimiter option / 分隔符选项
 * @returns Opening and closing delimiters / 开始与结束分隔符
 */
const resolveDelimiters = (delimiters?: string | [string, string]): [string, string] => {
  if (typeof delimiters === "string") return [delimiters, delimiters];

  return delimiters ?? [DEFAULT_DELIMITER, DEFAULT_DELIMITER];
};

/**
 * Resolve the language used to parse the frontmatter
 *
 * @param frontmatterLanguage - Language marker from the document / 文档中的语言标记
 * @param optionLanguage - Configured language / 配置的语言
 * @returns Normalized language / 规范化后的语言
 */
const resolveLanguage = (
  frontmatterLanguage: string,
  optionLanguage: string | undefined,
): string => {
  if (frontmatterLanguage !== "") return frontmatterLanguage;

  const normalizedLanguage = optionLanguage?.toLowerCase() ?? "";

  if (normalizedLanguage !== "") return normalizedLanguage;

  return DEFAULT_LANGUAGE;
};

/**
 * Split the optional language marker from the rest of the frontmatter
 *
 * The newline after the marker is intentionally kept so the closing delimiter can still be found
 * with its leading newline.
 *
 * 从 frontmatter 的剩余内容中拆分可选的语言标记。
 *
 * 有意保留标记后的换行，以便仍可用带前导换行的结束分隔符进行查找。
 *
 * @param source - Content after the opening delimiter / 开始分隔符之后的内容
 * @returns Detected language and remaining content / 检测到的语言与剩余内容
 */
const splitLanguage = (source: string): LanguageInfo => {
  const newlineIndex = source.indexOf("\n");

  if (newlineIndex === -1) {
    const language = source.trim().toLowerCase();

    return { language, rest: language ? "" : source };
  }

  const lineEnd =
    source.charCodeAt(newlineIndex - 1) === 13 /* \r */ ? newlineIndex - 1 : newlineIndex;
  const language = source.slice(0, lineEnd).trim().toLowerCase();

  return { language, rest: language ? source.slice(lineEnd) : source };
};

/**
 * Get the parser for a language
 *
 * @param language - Normalized language / 规范化后的语言
 * @param options - Plugin options / 插件选项
 * @returns Parser, or `null` when the language is unsupported / 解析器，语言不支持时为 `null`
 */
const getParser = (
  language: string,
  options: MarkdownItFrontmatterOptions,
): FrontmatterParser | null => {
  const customParser = options.parsers?.[language];

  if (customParser) return customParser;
  if (language === "json") {
    return (source) => {
      const parsed: unknown = JSON.parse(source);
      return parsed;
    };
  }
  if (language === "yaml" || language === "yml")
    return (source) => load(source, { schema: DEFAULT_YAML_SCHEMA, ...options.yamlOptions });

  return null;
};

/**
 * Check whether a value is a plain object
 *
 * @param value - Value to check / 待检查的值
 * @returns Whether the value is a plain object / 是否为普通对象
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object") return false;

  const prototype: unknown = Object.getPrototypeOf(value);

  return prototype == null || prototype === Object.prototype;
};

/**
 * Parse the raw frontmatter block
 *
 * @param source - Raw frontmatter / 原始 frontmatter
 * @param language - Normalized language / 规范化后的语言
 * @param options - Plugin options / 插件选项
 * @returns Parsed data / 解析后的数据
 */
const parseData = (
  source: string,
  language: string,
  options: MarkdownItFrontmatterOptions,
): Record<string, unknown> => {
  const parser = getParser(language, options);

  if (!parser)
    throw new Error(`[@mdit/plugin-frontmatter]: Unsupported frontmatter language "${language}"`);

  const data: unknown = parser(source);
  const normalizedData = data ?? {};

  if (!isPlainObject(normalizedData)) {
    throw new TypeError(
      `[@mdit/plugin-frontmatter]: Frontmatter language "${language}" must parse to a plain object mapping`,
    );
  }

  return normalizedData;
};

/**
 * Resolve the excerpt separator
 *
 * A non-empty string in the frontmatter data takes precedence over the plugin option.
 *
 * 解析摘要分隔符。
 *
 * Frontmatter 数据中的非空字符串优先于插件选项。
 *
 * @param data - Frontmatter data / frontmatter 数据
 * @param options - Plugin options / 插件选项
 * @returns Excerpt separator / 摘要分隔符
 */
const resolveExcerptSeparator = (
  data: Record<string, unknown>,
  options: MarkdownItFrontmatterOptions,
): string | null => {
  const separator = data.excerpt_separator;

  return typeof separator === "string" && separator
    ? separator
    : (options.excerptSeparator ?? null);
};

/**
 * Resolve the delimiter used to split the excerpt
 *
 * An empty configured separator falls back to the opening delimiter, matching gray-matter.
 *
 * 解析用于拆分摘要的分隔符。
 *
 * 配置的空字符串分隔符会回退到开始分隔符，与 gray-matter 一致。
 *
 * @param excerpt - Excerpt option / 摘要选项
 * @param separator - Excerpt separator / 摘要分隔符
 * @param openingDelimiter - Opening frontmatter delimiter / 开始 frontmatter 分隔符
 * @returns Excerpt delimiter / 摘要分隔符
 */
const resolveExcerptDelimiter = (
  excerpt: MarkdownItFrontmatterOptions["excerpt"],
  separator: string | null,
  openingDelimiter: string,
): string => {
  if (typeof excerpt === "string") return excerpt;
  if (separator == null || separator === "") return openingDelimiter;

  return separator;
};

/**
 * Extract the excerpt
 *
 * @param file - Parsed frontmatter file / 解析后的 frontmatter 文件
 * @param options - Plugin options / 插件选项
 * @param delimiters - Resolved delimiters / 解析后的分隔符
 */
const extractExcerpt = (
  file: FrontmatterFile,
  options: MarkdownItFrontmatterOptions,
  delimiters: [string, string],
): void => {
  const { excerpt } = options;

  if (typeof excerpt === "function") {
    excerpt(file);

    return;
  }

  const separator = resolveExcerptSeparator(file.data, options);

  if (separator == null && excerpt !== true && typeof excerpt !== "string") return;

  const delimiter = resolveExcerptDelimiter(excerpt, separator, delimiters[0]);
  const index = file.content.indexOf(delimiter);

  if (index === -1) return;

  file.excerpt = file.content.slice(0, index);
};

/**
 * Parse frontmatter from Markdown source
 *
 * Supports YAML (default), JSON and custom parsers, custom delimiters, language markers and
 * optional excerpt extraction.
 *
 * 从 Markdown 源码中解析 frontmatter。
 *
 * 支持 YAML（默认）、JSON 与自定义解析器、自定义分隔符、语言标记以及可选的摘要提取。
 *
 * @example
 *   ```ts
 *   parseFrontmatter("---\ntitle: Hello\n---\n# Hello");
 *   ```;
 *
 * @param input - Markdown source / Markdown 源码
 * @param options - Plugin options / 插件选项
 * @returns Parsed frontmatter file / 解析后的 frontmatter 文件
 */
export const parseFrontmatter = (
  input: string,
  options: MarkdownItFrontmatterOptions = {},
): FrontmatterFile => {
  const source = input.charCodeAt(0) === BOM_CODE ? input.slice(1) : input;
  const delimiters = resolveDelimiters(options.delimiters);
  const [open, close] = delimiters;

  if (!open || !close)
    throw new TypeError("[@mdit/plugin-frontmatter]: delimiters must not be empty");

  const file: FrontmatterFile = {
    data: {},
    content: source,
    excerpt: "",
    matter: "",
    language: "",
    isEmpty: false,
  };

  if (!source.startsWith(open)) {
    extractExcerpt(file, options, delimiters);

    return file;
  }

  // A delimiter that starts with another instance of its last character (e.g. `----`) is a
  // horizontal rule, not frontmatter.
  if (source.charCodeAt(open.length) === open.charCodeAt(open.length - 1)) return file;

  const languageInfo = splitLanguage(source.slice(open.length));

  if (languageInfo.language) file.language = languageInfo.language;

  const closeDelimiter = `\n${close}`;
  const closeIndex = languageInfo.rest.indexOf(closeDelimiter);
  const blockEnd = closeIndex === -1 ? languageInfo.rest.length : closeIndex;

  file.matter = languageInfo.rest.slice(0, blockEnd);

  const block = file.matter.replaceAll(COMMENT_LINE_RE, "").trim();

  if (block === "") {
    file.isEmpty = true;
  } else {
    const language = resolveLanguage(file.language, options.language);

    file.data = parseData(file.matter, language, options);
  }

  if (closeIndex === -1) {
    file.content = "";
  } else {
    let content = languageInfo.rest.slice(closeIndex + closeDelimiter.length);

    if (content.charCodeAt(0) === 13 /* \r */) content = content.slice(1);
    if (content.charCodeAt(0) === 10 /* \n */) content = content.slice(1);

    file.content = content;
  }

  extractExcerpt(file, options, delimiters);

  return file;
};
