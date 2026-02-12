import type { Options } from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

export interface FieldAttr {
  /**
   * Attribute name
   *
   * 属性名
   */
  attr: string;

  /**
   * Display name of the attribute, if not provided, will use `attr` as display name with first letter capitalized.
   *
   * 属性的显示名称，如果不提供，将使用 `attr` 并首字母大写作为显示名称。
   */
  name?: string;

  /**
   * Whether it's a boolean attribute, any attribute existence will be treated as true, and value will be ignored.
   *
   * 是否为布尔属性，只要属性存在即便没有值也会被视为 true。
   *
   * @default false
   */
  boolean?: boolean;
}

export interface FieldAttrInfo {
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

export interface FieldMeta {
  /**
   * Field name
   *
   * 字段名
   */
  name: string;

  /**
   * Field level, starting from 0
   *
   * 字段层级，从 0 开始
   */
  level: number;

  /**
   * Sorted field attributes
   *
   * 排序后的字段属性
   */
  attributes: FieldAttrInfo[];
}

export interface FieldToken extends Token {
  meta: FieldMeta;
}

export type MarkdownItFieldOpenRender = (
  tokens: FieldToken[],
  index: number,
  options: Options,
  // oxlint-disable-next-line typescript/explicit-module-boundary-types, typescript/no-explicit-any
  env: any,
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
   * Allowed attributes for fields, if not provided, all attributes will be allowed and displayed as-is.
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
  fieldsOpenRender?: RenderRule;

  /**
   * Fields close render
   *
   * 字段容器关闭渲染函数
   */
  fieldsCloseRender?: RenderRule;

  /**
   * Field item open render
   *
   * 字段项打开渲染函数
   */
  fieldOpenRender?: MarkdownItFieldOpenRender;

  /**
   * Field item close render
   *
   * 字段项关闭渲染函数
   */
  fieldCloseRender?: RenderRule;
}
