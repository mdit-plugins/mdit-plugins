export type Attr = [key: string, value: string];

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
   * Allowed attributes
   *
   * An empty list means allowing all attribute 允许的属性
   *
   * 设置空数组意味着允许所有属性
   *
   * @default [ ]
   */
  allowed: (string | RegExp)[];
}
