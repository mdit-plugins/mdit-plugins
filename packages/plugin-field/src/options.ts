import type { TokenMeta } from "@mdit/helper";
import type { Env, MarkdownItOptions, RendererRule, Renderer, Token } from "markdown-it";

export interface FieldAttr {
  /**
   * Attribute name
   *
   * 属性名
   */
  attr: string;

  /**
   * Display name of the attribute, if not provided, will use `attr` as display name with first
   * letter capitalized.
   *
   * 属性的显示名称，如果不提供，将使用 `attr` 并首字母大写作为显示名称。
   */
  name?: string;

  /**
   * Whether it's a boolean attribute, any attribute existence will be treated as true, and value
   * will be ignored.
   *
   * 是否为布尔属性，只要属性存在即便没有值也会被视为 true。
   *
   * @default false
   */
  boolean?: boolean;
}

/**
 * Quote style of an attribute value in source
 *
 * 属性值在源码中的引号类型
 *
 * - `none`: unquoted, the value ends at the first whitespace / 无引号，值以第一个空白结束
 * - `single`: quoted with `'` / 使用 `'` 包裹
 * - `double`: quoted with `"` / 使用 `"` 包裹
 * - `backtick`: quoted with `` ` ``, keeping the content literal / 使用反引号包裹，内容保持字面量
 */
export type FieldAttrQuote = "none" | "single" | "double" | "backtick";

/**
 * Parsed field attribute
 *
 * 解析后的字段属性
 */
export interface FieldAttrItem {
  /**
   * Attribute name
   *
   * 属性名
   */
  attr: string;

  /**
   * Attribute display name
   *
   * 属性显示名称
   */
  name: string;

  /**
   * Attribute value
   *
   * 属性值
   */
  value: string | true;
}

/**
 * Parsed field attribute
 *
 * 解析后的字段属性
 *
 * @deprecated Use {@link FieldAttrItem} instead.
 *
 * 已废弃，请使用 {@link FieldAttrItem}。
 */
export type FieldAttrInfo = FieldAttrItem;

/**
 * Parsed field attribute with extra info
 *
 * 带额外信息的解析后字段属性
 */
export interface FieldAttrDetail extends FieldAttrItem {
  /**
   * Quote style used in source
   *
   * 源码中使用的引号类型
   */
  quote: FieldAttrQuote;
}

export interface FieldMeta extends TokenMeta {
  /**
   * Field name
   *
   * 字段名
   */
  name: string;

  /**
   * Field level, starting from 1
   *
   * 字段层级，从 1 开始
   */
  level: number;

  /**
   * Sorted field attributes
   *
   * 排序后的字段属性
   */
  attributes: FieldAttrItem[];

  /**
   * Sorted field attributes with extra info
   *
   * 排序后的字段属性（含额外信息）
   */
  details: FieldAttrDetail[];
}

// oxlint-disable-next-line max-params
export type MarkdownItFieldOpenRenderer = (
  meta: FieldMeta,
  tokens: Token[],
  index: number,
  options: Required<MarkdownItOptions>,
  env: Env | undefined,
  self: Renderer,
) => string;

export interface MarkdownItFieldOptions {
  /**
   * Field container name
   *
   * 字段容器名称
   *
   * @default "fields"
   */
  name?: string;

  /**
   * CSS class prefix for generated class names
   *
   * 生成的 CSS 类名前缀
   *
   * @default "field-"
   */
  classPrefix?: string;

  /**
   * Whether to parse `key="val"` attributes after the field marker
   *
   * 是否解析字段标记后的 `key="val"` 属性
   *
   * @default true
   */
  parseAttributes?: boolean;

  /**
   * Allowed attributes for fields, if not provided, all attributes will be allowed and displayed
   * as-is.
   *
   * Attribute display will be sorted in the order of this array.
   *
   * 允许的字段属性，如果不提供，所有属性都将被允许并按原样显示。
   *
   * 属性显示将按此数组的顺序排序。
   */
  allowedAttributes?: FieldAttr[];

  /**
   * Fields open render
   *
   * 字段容器打开渲染函数
   */
  fieldsOpenRenderer?: RendererRule;

  /**
   * Fields close render
   *
   * 字段容器关闭渲染函数
   */
  fieldsCloseRenderer?: RendererRule;

  /**
   * Field item open render
   *
   * 字段项打开渲染函数
   */
  fieldOpenRenderer?: MarkdownItFieldOpenRenderer;

  /**
   * Field item close render
   *
   * 字段项关闭渲染函数
   */
  fieldCloseRenderer?: RendererRule;
}
