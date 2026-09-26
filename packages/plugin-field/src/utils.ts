import type { FieldAttr, FieldAttrItem, FieldAttrQuote } from "./options.js";

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

const isEscapableCharCode = (code: number): boolean =>
  code < 128 && ESCAPABLE_PUNCTUATION_TABLE[code] === 1;

/**
 * Normalize code span content following Markdown: when the content both begins and ends with a
 * space character, but is not made of spaces only, one space is removed from both ends. This makes
 * it possible to write a name or value starting or ending with a backtick.
 *
 * 按 Markdown 规则规范化代码片段内容：当内容同时以空格开头和结尾，且不全是空格时，两端各移除一个空格。这样可以写出以反引号开头或结尾的名字或值。
 *
 * @param content - Raw code span content / 代码片段的原始内容
 * @returns Normalized content / 规范化后的内容
 */
const normalizeCodeSpan = (content: string): string => {
  const length = content.length;

  if (length < 3) return content;
  if (content.charCodeAt(0) !== 32 /* space */ || content.charCodeAt(length - 1) !== 32 /* space */)
    return content;

  // content made of spaces only is kept as-is
  let pos = 0;

  while (pos < length && content.charCodeAt(pos) === 32 /* space */) pos++;

  return pos === length ? content : content.slice(1, length - 1);
};

/**
 * Scan a Markdown code span, delimited by a run of backticks and closed by another run of the same
 * length, so a backtick inside the content is written with longer delimiters instead of escaping.
 *
 * 扫描 Markdown 代码片段：由一段反引号作分隔符，并由等长的另一段反引号闭合，因此内容里的反引号通过更长的分隔符书写，而不是转义。
 *
 * The scan is bounded by `max`, which must not cut a delimiter run, so callers pass the end of a
 * single line.
 *
 * 扫描受 `max` 约束，且 `max` 不能截断分隔符，因此调用方传入单行的结束位置。
 *
 * @param content - Content to scan / 待扫描内容
 * @param start - Start position, pointing at the opening delimiter / 起始位置，指向起始分隔符
 * @param max - End of content / 内容结束位置
 * @returns Normalized code span content and the position after it, or `null` when not closed /
 *   规范化后的代码片段内容与结束位置，未闭合时返回 `null`
 */
export const scanCodeSpan = (
  content: string,
  start: number,
  max: number,
): { value: string; end: number } | null => {
  let pos = start;

  while (pos < max && content.charCodeAt(pos) === 96 /* ` */) pos++;

  const delimiterLength = pos - start;
  const contentStart = pos;

  while (pos < max) {
    if (content.charCodeAt(pos) !== 96 /* ` */) {
      pos++;
      continue;
    }

    const runStart = pos;

    while (pos < max && content.charCodeAt(pos) === 96 /* ` */) pos++;

    if (pos - runStart === delimiterLength)
      return { value: normalizeCodeSpan(content.slice(contentStart, runStart)), end: pos };
  }

  return null;
};

/**
 * Unescape a quoted value: a backslash before an escapable character is removed, any other
 * backslash is kept as-is.
 *
 * 反转义引号内的值：可转义字符前的反斜杠会被移除，其余反斜杠原样保留。
 *
 * @param content - Raw quoted value / 引号内的原始值
 * @returns Unescaped value / 反转义后的值
 */
const unescapeValue = (content: string): string => {
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

    if (next < length && isEscapableCharCode(content.charCodeAt(next))) {
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
 * @returns Parsed attributes / 解析后的属性
 */
export const parseAttributes = (
  content: string,
  allowedAttributes: AllowedAttributes | null = null,
): FieldAttrItem[] => {
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
      } else if (quote === "backtick") {
        // a backtick value is a code span, so its content is taken literally
        const span = scanCodeSpan(content, pos, length);

        if (span) {
          attrs[key] = { value: span.value, quote };
          pos = span.end;
        } else {
          // an unclosed backtick value falls back to an unquoted value, so that existing
          // unquoted values starting with a backtick keep working
          const valEnd = scanUnquotedEnd(content, pos, length);

          attrs[key] = { value: content.slice(pos, valEnd), quote: "none" };
          pos = valEnd;
        }
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

        // an unclosed value takes the rest of the content
        const valueEnd = closed ? scan : length;

        attrs[key] = { value: unescapeValue(content.slice(valueStart, valueEnd)), quote };
        pos = closed ? scan + 1 : length;
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
