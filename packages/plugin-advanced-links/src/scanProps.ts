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
 * Scanned token
 *
 * 扫描出的字符片段
 */
interface ScannedToken {
  /**
   * Unescaped text, `null` when the token is malformed
   *
   * 反转义后的文本，格式错误时为 `null`
   */
  text: string | null;

  /**
   * Position right after the token, or the furthest position reached by a malformed read
   *
   * 片段之后的位置，格式错误时为读取到的最远位置
   */
  end: number;

  /**
   * Highest position of a whitespace or `]` read as token content, `-1` when there is none
   *
   * 作为片段内容读取到的最后一个空白或 `]` 的位置，没有时为 `-1`
   */
  lastHidden: number;

  /**
   * Whether a `]` was read as token content
   *
   * 是否将 `]` 作为片段内容读取过
   */
  sawClose: boolean;
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
  let index = raw.indexOf("\\");

  // a token without any escape is returned as-is
  if (index === -1) return raw;

  let pos = 0;
  let text = "";

  while (index !== -1) {
    // the escaped character is taken literally
    text += raw.slice(pos, index) + raw.charAt(index + 1);
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
 * @returns Scanned token / 扫描结果
 */
const readToken = (
  src: string,
  start: number,
  max: number,
  quote: number,
  isKey: boolean,
): ScannedToken => {
  let pos = start;
  let lastHidden = -1;
  let sawClose = false;

  while (pos < max) {
    const code = src.charCodeAt(pos);

    if (isLineBreak(code)) return { text: null, end: pos, lastHidden, sawClose };

    if (quote === NO_QUOTE) {
      // `]` ends the props, whitespaces end the token, and `=` also ends a key
      if (code === CLOSE_BRACKET || isWhitespace(code) || (isKey && code === EQUAL)) break;
    } else if (code === quote) {
      return { text: unescape(src.slice(start, pos)), end: pos + 1, lastHidden, sawClose };
    }

    if (code === BACKSLASH) {
      const nextPos = skipEscape(src, pos, max);

      // a dangling `\` is malformed
      if (nextPos === -1) return { text: null, end: pos, lastHidden, sawClose };

      const escapedCode = src.charCodeAt(pos + 1);

      // an escaped whitespace or `]` is content instead of a boundary
      if (escapedCode === CLOSE_BRACKET) sawClose = true;
      if (escapedCode === CLOSE_BRACKET || isWhitespace(escapedCode)) lastHidden = pos + 1;

      pos = nextPos;

      continue;
    }

    // a whitespace or `]` inside a quoted value is content instead of a boundary
    if (quote !== NO_QUOTE && (code === CLOSE_BRACKET || isWhitespace(code))) {
      if (code === CLOSE_BRACKET) sawClose = true;
      lastHidden = pos;
    }

    pos++;
  }

  // an unterminated quoted value
  if (quote !== NO_QUOTE) return { text: null, end: max, lastHidden, sawClose };

  return { text: unescape(src.slice(start, pos)), end: pos, lastHidden, sawClose };
};

/**
 * Scanned props
 *
 * 扫描出的属性
 */
export interface PropsScan {
  /**
   * Parsed props, `null` when the props are malformed
   *
   * 解析后的属性，格式错误时为 `null`
   */
  props: AdvancedLinkProps | null;

  /**
   * Position where the scan stopped: the `]` that ends the props, `max` when the props are not
   * closed by one, or the furthest position reached by a malformed scan
   *
   * 扫描停止的位置：结束属性的 `]`，属性未被 `]` 结束时的 `max`，或者格式错误的扫描到达的最远位置
   */
  end: number;

  /**
   * Highest position of a whitespace or `]` read as props content, `-1` when there is none
   *
   * 作为属性内容读取到的最后一个空白或 `]` 的位置，没有时为 `-1`
   */
  lastHidden: number;

  /**
   * Whether a `]` was read as props content
   *
   * 是否将 `]` 作为属性内容读取过
   */
  sawClose: boolean;
}

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
 * @returns Scanned props / 扫描结果
 */
export const scanProps = (src: string, start: number, max: number): PropsScan => {
  const props: AdvancedLinkProps = {};
  let pos = start;
  let lastHidden = -1;
  let sawClose = false;

  while (pos < max) {
    // skip whitespaces between props
    while (pos < max && isWhitespace(src.charCodeAt(pos))) pos++;

    // `]` ends the props
    if (pos >= max || src.charCodeAt(pos) === CLOSE_BRACKET) break;

    // read the key, which ends with a whitespace or `=`
    const key = readToken(src, pos, max, NO_QUOTE, true);

    if (key.lastHidden > lastHidden) lastHidden = key.lastHidden;
    if (key.sawClose) sawClose = true;

    // a malformed prop like `=value` has no key, reject the whole syntax
    if (!key.text) return { props: null, end: key.end, lastHidden, sawClose };

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

      if (value.lastHidden > lastHidden) lastHidden = value.lastHidden;
      if (value.sawClose) sawClose = true;
      if (value.text == null) return { props: null, end: value.end, lastHidden, sawClose };

      props[key.text] = value.text;
      pos = value.end;

      continue;
    }

    const value = readToken(src, pos, max, NO_QUOTE, false);

    if (value.lastHidden > lastHidden) lastHidden = value.lastHidden;
    if (value.sawClose) sawClose = true;
    if (value.text == null) return { props: null, end: value.end, lastHidden, sawClose };

    props[key.text] = value.text;
    pos = value.end;
  }

  // `pos < max` only holds when the `]` ending the props was found
  return { props, end: pos, lastHidden, sawClose: sawClose || pos < max };
};
