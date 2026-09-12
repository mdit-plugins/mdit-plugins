import type { AdvancedLinkProps } from "./options.js";

const SPACE = 0x20; /*   */
const TAB = 0x09; /* \t */
const EQUAL = 0x3d; /* = */
const DOUBLE_QUOTE = 0x22; /* " */
const SINGLE_QUOTE = 0x27; /* ' */
const CLOSE_BRACKET = 0x5d; /* ] */
const BACKSLASH = 0x5c; /* \ */
const LINE_FEED = 0x0a; /* \n */
const CARRIAGE_RETURN = 0x0d; /* \r */

/** No quote, for a bare token / 无引号，用于裸字符片段 */
const NO_QUOTE = -1;

const isWhitespace = (code: number): boolean => code === SPACE || code === TAB;
const isLineBreak = (code: number): boolean => code === LINE_FEED || code === CARRIAGE_RETURN;

/**
 * Scanned bare token
 *
 * 扫描出的裸字符片段
 */
interface ScannedToken {
  /**
   * Unescaped text
   *
   * 反转义后的文本
   */
  text: string;

  /**
   * Position right after the token
   *
   * 片段之后的位置
   */
  end: number;
}

/**
 * Scanned props
 *
 * 扫描出的属性
 */
export interface ScannedProps {
  /**
   * Parsed props
   *
   * 解析后的属性
   */
  props: AdvancedLinkProps;

  /**
   * Position of the `]` that ends the props, or `max` when the props are not closed
   *
   * 结束属性时右中括号的位置，未闭合时为 `max`
   */
  end: number;
}

/**
 * Skip an escape sequence
 *
 * 跳过一个转义序列
 *
 * @param src - Source string / 源字符串
 * @param pos - Position of the `\` / `\` 所在位置
 * @param max - Max position / 结束位置
 * @returns Position right after the escaped character, or `-1` when the escape is dangling /
 *   被转义字符之后的位置，转义符悬空时为 `-1`
 */
const skipEscape = (src: string, pos: number, max: number): number => {
  const nextPos = pos + 1;

  // a dangling `\` is malformed
  if (nextPos >= max || isLineBreak(src.charCodeAt(nextPos))) return -1;

  return nextPos + 1;
};

/**
 * Resolve the escapes of a token
 *
 * 解析字符片段中的转义
 *
 * @param raw - Raw text / 原始文本
 * @returns Unescaped text / 反转义后的文本
 */
const unescape = (raw: string): string => {
  let pos = 0;
  let index = raw.indexOf("\\");
  let text = "";

  while (index !== -1) {
    // the escaped character is taken literally
    text += raw.slice(pos, index) + raw.slice(index + 1, index + 2);
    pos = index + 2;
    index = raw.indexOf("\\", pos);
  }

  return text + raw.slice(pos);
};

/**
 * Read a token, where `\` escapes the next character
 *
 * 读取字符片段，其中的 `\` 用于转义下一个字符
 *
 * A bare token ends with a whitespace or the `]` that ends the props, and a quoted value only ends
 * with the matching quote.
 *
 * 裸片段以空白或结束属性的 `]` 结束，引号包裹的值只会以配对的引号结束。
 *
 * @param src - Source string / 源字符串
 * @param start - Start position, right after the opening quote for a quoted value /
 *   起始位置，引号包裹的值从引号之后开始
 * @param max - Max position / 结束位置
 * @param quote - Quote character of a quoted value, or `NO_QUOTE` for a bare token /
 *   引号包裹的值的引号字符，裸片段为 `NO_QUOTE`
 * @param isKey - Whether `=` also ends a bare token / 裸片段是否为 key（key 也会以 `=` 结束）
 * @returns Scanned token, or `null` if the token is malformed / 扫描结果，格式错误时为 `null`
 */
const readToken = (
  src: string,
  start: number,
  max: number,
  quote: number,
  isKey: boolean,
): ScannedToken | null => {
  let pos = start;
  let hasEscape = false;

  while (pos < max) {
    const code = src.charCodeAt(pos);

    if (isLineBreak(code)) return null;

    if (quote === NO_QUOTE) {
      // `]` ends the props, whitespaces end the token, and `=` also ends a key
      if (code === CLOSE_BRACKET || isWhitespace(code) || (isKey && code === EQUAL)) break;
    } else if (code === quote) {
      const raw = src.slice(start, pos);

      return { text: hasEscape ? unescape(raw) : raw, end: pos + 1 };
    }

    if (code === BACKSLASH) {
      const nextPos = skipEscape(src, pos, max);

      // a dangling `\` is malformed
      if (nextPos === -1) return null;

      hasEscape = true;
      pos = nextPos;

      continue;
    }

    pos++;
  }

  // an unterminated quoted value
  if (quote !== NO_QUOTE) return null;

  const raw = src.slice(start, pos);

  return { text: hasEscape ? unescape(raw) : raw, end: pos };
};

/**
 * Scan props from the source
 *
 * 从源字符串中扫描属性
 *
 * Supported formats: `key`, `key=value`, `key="value with spaces"` and `key='value'`. `\` escapes
 * the next character in keys and values, so any character can be written within a single line,
 * including `]` which otherwise ends the props.
 *
 * 支持的格式：`key`、`key=value`、`key="包含空格的 value"` 与 `key='value'`。 `\` 用于转义 key 与 value
 * 中的下一个字符，因此可以在单行内书写任意字符，包括原本会结束属性的 `]`。
 *
 * @param src - Source string / 源字符串
 * @param start - Start position / 起始位置
 * @param max - Max position, usually the end of the line / 结束位置，通常为行尾
 * @returns Scanned props, or `null` if the props are malformed / 扫描结果，格式错误时为 `null`
 */
export const scanProps = (src: string, start: number, max: number): ScannedProps | null => {
  const props: AdvancedLinkProps = {};
  let pos = start;

  while (pos < max) {
    // skip whitespaces between props
    while (pos < max && isWhitespace(src.charCodeAt(pos))) pos++;

    // `]` ends the props
    if (pos >= max || src.charCodeAt(pos) === CLOSE_BRACKET) break;

    // read the key, which ends with a whitespace or `=`
    const key = readToken(src, pos, max, NO_QUOTE, true);

    if (!key) return null;

    // a malformed prop like `=value` has no key, reject the whole syntax
    if (!key.text) return null;

    pos = key.end;

    if (pos >= max || src.charCodeAt(pos) !== EQUAL) {
      props[key.text] = true;

      continue;
    }

    pos++; // skip `=`

    // a quote right after `=` starts a quoted value
    const quote = pos < max ? src.charCodeAt(pos) : NO_QUOTE;

    if (quote === DOUBLE_QUOTE || quote === SINGLE_QUOTE) {
      const value = readToken(src, pos + 1, max, quote, false);

      if (!value) return null;

      props[key.text] = value.text;
      pos = value.end;

      continue;
    }

    const value = readToken(src, pos, max, NO_QUOTE, false);

    if (!value) return null;

    props[key.text] = value.text;
    pos = value.end;
  }

  return { props, end: pos };
};
