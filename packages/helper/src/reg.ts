// https://spec.commonmark.org/0.29/#line-ending

/**
 * Matches any CommonMark line ending: `\n`, `\r\n`, or `\r`.
 *
 * 匹配任意 CommonMark 换行符：`\n`、`\r\n` 或 `\r`。
 */
export const NEWLINE_RE: RegExp = /\r\n?|\n/g;

/**
 * Matches a backslash escape of a CommonMark ASCII punctuation character.
 *
 * 匹配 CommonMark ASCII 标点字符的反斜杠转义。
 */
export const UNESCAPE_RE: RegExp = /\\(?<char>[ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/gu;
