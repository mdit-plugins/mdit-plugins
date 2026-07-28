export type Attr = [key: string, value: string];

export interface AllowedAttrEntry {
  /**
   * Attribute name, supports string or RegExp
   *
   * 属性名，支持字符串或正则
   */
  name: string | RegExp;

  /**
   * Allowed attribute values, supports string or RegExp array
   *
   * Empty or omitted means allowing any value
   *
   * 允许的属性值，支持字符串或正则数组
   *
   * 空数组或省略表示允许任意值
   */
  value?: (string | RegExp)[];
}

export type AllowedAttrs = (string | RegExp)[] | AllowedAttrEntry[];

/**
 * Normalized attribute filter for fast matching
 *
 * 正则化后的属性过滤器，用于快速匹配
 */
export type AttrFilter = (name: string, value: string) => boolean;

export interface DelimiterConfig {
  /**
   * Left delimiter
   *
   * 左分隔符
   *
   * @default "{"
   */
  left: string;

  /**
   * Right delimiter
   *
   * 右分隔符
   *
   * @default "}"
   */
  right: string;

  /**
   * Allowed attributes (raw config)
   *
   * 允许的属性（原始配置）
   *
   * @default [ ]
   */
  allowed: AllowedAttrs;

  /**
   * Normalized attribute filter
   *
   * 正则化后的属性过滤器
   */
  filter: AttrFilter | null;
}
