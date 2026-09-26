import type { FieldAttr, FieldAttrDetail, FieldAttrQuote } from "./options.js";

const isSpace = (code: number): boolean => code === 0x20 /* space */ || code === 0x09; /* tab */

/**
 * Markdown ASCII punctuation characters, which are the only characters a backslash can escape.
 *
 * 可被反斜杠转义的 Markdown ASCII 标点字符。
 */
const ESCAPABLE_PUNCTUATION = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

/** Lookup table for {@link ESCAPABLE_PUNCTUATION} / 可转义标点字符的查找表 */
const ESCAPABLE_PUNCTUATION_TABLE = new Uint8Array(128);

for (let index = 0; index < ESCAPABLE_PUNCTUATION.length; index++)
  ESCAPABLE_PUNCTUATION_TABLE[ESCAPABLE_PUNCTUATION.charCodeAt(index)] = 1;

/** Quote style by the character code of the opening quote / 开引号字符码对应的引号类型 */
const QUOTE_STYLES: Record<number, FieldAttrQuote | undefined> = {
  34 /* " */: "double",
  39 /* ' */: "single",
  96 /* ` */: "backtick",
};

export interface AttrInfo {
  display: string;
  boolean?: boolean;
  index: number;
}

export type AllowedAttributes = Map<string, AttrInfo>;

interface ParsedAttr {
  value: string | true;
  quote: FieldAttrQuote;
}

export const ucFirst = (str: string): string => (str ? str[0].toUpperCase() + str.slice(1) : "");

/**
 * Check whether a character can be escaped with a backslash inside a `"` or `'` value, following
 * Markdown's rules.
 *
 * 检查字符在 `"` 或 `'` 值中是否可被反斜杠转义（遵循 Markdown 规则）。
 *
 * @param code - Character code / 字符码
 * @returns Whether the character can be escaped / 是否可被转义
 */
const isMdEscapableCharCode = (code: number): boolean =>
  code < 128 && ESCAPABLE_PUNCTUATION_TABLE[code] === 1;

/**
 * Check whether a character can be escaped with a backslash inside a backtick value, where only a
 * backtick and a backslash are escaped.
 *
 * 检查字符在反引号值中是否可被反斜杠转义，其中只有反引号和反斜杠会被转义。
 *
 * @param code - Character code / 字符码
 * @returns Whether the character can be escaped / 是否可被转义
 */
const isBacktickEscapableCharCode = (code: number): boolean =>
  code === 96 /* ` */ || code === 92; /* \ */

/**
 * Unescape a quoted value: a backslash before an escapable character is removed, any other
 * backslash is kept as-is.
 *
 * 反转义引号内的值：可转义字符前的反斜杠会被移除，其余反斜杠原样保留。
 *
 * @param content - Raw quoted value / 引号内的原始值
 * @param isEscapable - Check whether a character can be escaped / 检查字符是否可被转义
 * @returns Unescaped value / 反转义后的值
 */
const unescapeValue = (content: string, isEscapable: (code: number) => boolean): string => {
  if (!content.includes("\\")) return content;

  let result = "";
  let last = 0;
  const length = content.length;
  let pos = 0;

  while (pos < length) {
    if (content.charCodeAt(pos) !== 92 /* \ */) {
      pos++;
      continue;
    }

    const next = pos + 1;

    if (next < length && isEscapable(content.charCodeAt(next))) {
      result += content.slice(last, pos) + content[next];
      pos = next + 1;
      last = pos;
    } else {
      pos++;
    }
  }

  return result + content.slice(last);
};

/**
 * Find the end of an unquoted value, which stops at the first whitespace character.
 *
 * 查找无引号值的结束位置（遇到第一个空白字符即停止）。
 *
 * @param content - Content to scan / 待扫描内容
 * @param start - Start position / 起始位置
 * @param max - End of content / 内容结束位置
 * @returns End position of the value / 值的结束位置
 */
const scanUnquotedEnd = (content: string, start: number, max: number): number => {
  let pos = start;

  while (pos < max) {
    const code = content.charCodeAt(pos);

    if (code === 32 || code === 9 || code === 10 || code === 13) break;
    pos++;
  }

  return pos;
};

export const normalizeAttributes = (allowedAttributes?: FieldAttr[]): AllowedAttributes | null => {
  if (!allowedAttributes) return null;

  const map: AllowedAttributes = new Map();

  allowedAttributes.forEach((item, index) => {
    map.set(item.attr, {
      display: item.name ?? ucFirst(item.attr),
      boolean: item.boolean ?? false,
      index,
    });
  });

  return map;
};

/**
 * Parse `key=value` attributes after a field marker
 *
 * 解析字段标记后的 `key=value` 属性
 *
 * @param content - Attribute content / 属性内容
 * @param allowedAttributes - Allowed attributes / 允许的属性
 * @returns Parsed attributes with extra info / 带额外信息的解析结果
 */
export const parseAttributes = (
  content: string,
  allowedAttributes: AllowedAttributes | null = null,
): FieldAttrDetail[] => {
  const attrs: Record<string, ParsedAttr> = {};
  const length = content.length;
  let pos = 0;

  while (pos < length) {
    let charCode = content.charCodeAt(pos);

    // skip spaces
    if (isSpace(charCode)) {
      pos++;
      continue;
    }

    // parse key
    const keyStart = pos;

    while (pos < length) {
      charCode = content.charCodeAt(pos);

      if (isSpace(charCode) || charCode === 61 /* = */) break;
      pos++;
    }
    const key = content.slice(keyStart, pos);

    if (!key) break;

    // check =
    if (pos < length && content.charCodeAt(pos) === 61 /* = */) {
      pos++; // skip =

      if (pos >= length) break; // trailing =

      const quoteCharCode = content.charCodeAt(pos);
      const quote = QUOTE_STYLES[quoteCharCode] ?? "none";

      if (quote === "none") {
        // unquoted value
        const valEnd = scanUnquotedEnd(content, pos, length);

        attrs[key] = { value: content.slice(pos, valEnd), quote };
        pos = valEnd;
      } else {
        const valueStart = pos + 1;
        let scan = valueStart;
        let closed = false;

        while (scan < length) {
          const scanCode = content.charCodeAt(scan);

          // a backslash escapes the next character, so an escaped quote does not close the value
          if (scanCode === 92 /* \ */) {
            scan += 2;
            continue;
          }

          if (scanCode === quoteCharCode) {
            closed = true;
            break;
          }

          scan++;
        }

        if (closed || quote !== "backtick") {
          // an unclosed `"` or `'` value takes the rest of the content
          const valueEnd = closed ? scan : length;
          // a backtick value is literal, so only a backtick and a backslash can be escaped in it
          const isEscapable =
            quote === "backtick" ? isBacktickEscapableCharCode : isMdEscapableCharCode;

          attrs[key] = {
            value: unescapeValue(content.slice(valueStart, valueEnd), isEscapable),
            quote,
          };
          pos = closed ? scan + 1 : length;
        } else {
          // an unclosed backtick value falls back to an unquoted value, so that existing
          // unquoted values starting with a backtick keep working
          const valEnd = scanUnquotedEnd(content, pos, length);

          attrs[key] = { value: content.slice(pos, valEnd), quote: "none" };
          pos = valEnd;
        }
      }
    } else {
      // boolean
      attrs[key] = { value: true, quote: "none" };
    }
  }

  if (!allowedAttributes) {
    return Object.entries(attrs).map(([key, { value, quote }]) => ({
      attr: key,
      name: key
        .split("-")
        .map((part) => ucFirst(part))
        .join(" "),
      value,
      quote,
    }));
  }

  return Object.entries(attrs)
    .filter(([key]) => allowedAttributes.has(key))
    .sort(
      (a, b) =>
        // oxlint-disable-next-line typescript/no-non-null-assertion
        allowedAttributes.get(a[0])!.index -
        // oxlint-disable-next-line typescript/no-non-null-assertion
        allowedAttributes.get(b[0])!.index,
    )
    .map(([key, { value, quote }]) => {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const info = allowedAttributes.get(key)!;

      return {
        attr: key,
        name: info.display,
        value: info.boolean ? true : value,
        quote,
      };
    });
};
