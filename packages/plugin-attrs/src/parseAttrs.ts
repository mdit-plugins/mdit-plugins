import type { Attr } from "./helper/index.js";
import { createDelimiterChecker, getAttrs, normalizeAllowed } from "./helper/index.js";
import type { ParseAttrsOptions } from "./options.js";

/**
 * Parse attrs from a string containing a delimited attrs section
 *
 * 从包含分隔符属性部分的字符串中解析属性
 *
 * @example
 *   ```ts
 *   parseAttrs("foo {.bar #baz data-a=b}");
 *   // [["class", "bar"], ["id", "baz"], ["data-a", "b"]]
 *   ```;
 *
 * @param content - Content to parse / 要解析的内容
 * @param options - Parse options / 解析选项
 * @returns Parsed attrs, or `null` when no valid attrs section is found / 解析出的属性，未找到有效属性部分时为
 * `null`
 */
export const parseAttrs = (
  content: string,
  { where = "end", left = "{", right = "}", allowed = [] }: ParseAttrsOptions = {},
): Attr[] | null => {
  const filter = normalizeAllowed(allowed);
  const range = createDelimiterChecker({ left, right, allowed, filter }, where)(content);

  return range === false ? null : getAttrs(content, range, filter);
};
