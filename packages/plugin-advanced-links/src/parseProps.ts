import type { AdvancedLinkProps } from "./options.js";

const SPACE = 0x20; /*   */
const TAB = 0x09; /* \t */
const EQUAL = 0x3d; /* = */
const DOUBLE_QUOTE = 0x22; /* " */
const SINGLE_QUOTE = 0x27; /* ' */
const BACKSLASH = 0x5c; /* \ */

/**
 * Parse props from an info string
 *
 * 从信息字符串中解析属性
 *
 * Supported formats: `key`, `key=value`, `key="value with spaces"` and `key='value'`. `\` escapes
 * the next character inside a quoted value.
 *
 * 支持的格式：`key`、`key=value`、`key="包含空格的 value"` 与 `key='value'`。 在引号包裹的值中，`\` 用于转义下一个字符。
 *
 * @param info - Info string / 信息字符串
 * @returns Parsed props, or `null` if the info string is malformed / 解析后的属性，信息字符串格式错误时为 `null`
 */
export const parseProps = (info: string): AdvancedLinkProps | null => {
  const props: AdvancedLinkProps = {};
  const length = info.length;
  let pos = 0;

  while (pos < length) {
    // skip whitespaces between props
    while (pos < length) {
      const code = info.charCodeAt(pos);

      if (code !== SPACE && code !== TAB) break;

      pos++;
    }

    if (pos >= length) break;

    // read the key, which ends with a whitespace or `=`
    const keyStart = pos;

    while (pos < length) {
      const code = info.charCodeAt(pos);

      if (code === SPACE || code === TAB || code === EQUAL) break;

      pos++;
    }

    const key = info.slice(keyStart, pos);

    // a malformed prop like `=value` has no key, reject the whole syntax
    if (!key) return null;

    if (pos >= length || info.charCodeAt(pos) !== EQUAL) {
      props[key] = true;

      continue;
    }

    pos++; // skip `=`

    const quote = pos < length ? info.charCodeAt(pos) : -1;

    if (quote !== DOUBLE_QUOTE && quote !== SINGLE_QUOTE) {
      // an unquoted value ends with the next whitespace
      const valueStart = pos;

      while (pos < length) {
        const code = info.charCodeAt(pos);

        if (code === SPACE || code === TAB) break;

        pos++;
      }

      props[key] = info.slice(valueStart, pos);

      continue;
    }

    pos++; // skip the opening quote

    let value = "";
    let valueStart = pos;

    while (pos < length) {
      const code = info.charCodeAt(pos);

      if (code === BACKSLASH) {
        // the escaped character is kept as-is, `slice` clamps for the last character
        value += info.slice(valueStart, pos) + info.slice(pos + 1, pos + 2);

        pos += 2;
        valueStart = pos;
      } else if (code === quote) {
        break;
      } else {
        pos++;
      }
    }

    value += info.slice(valueStart, pos);
    props[key] = value;

    // skip the closing quote, the outer loop stops when the value is unterminated
    pos++;
  }

  return props;
};
