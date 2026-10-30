const ESCAPE_REGEXP = /[-/\\^$*+?.()|[\]{}]/g;
const REPLACE_WITH = String.raw`\$&`;

/**
 * Escapes HTML special characters (`& < > " '`).
 *
 * 转义 HTML 特殊字符（`& < > " '`）。
 *
 * @example
 *   escapeHtml('<a href="x">'); // '&lt;a href=&quot;x&quot;&gt;'
 *
 * @param unsafeHTML - The HTML content to escape / 要转义的 HTML 内容
 * @returns The escaped HTML content / 转义后的 HTML 内容
 */
export const escapeHtml = (unsafeHTML: string): string =>
  unsafeHTML
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Escapes special characters in a string so it can be used as a literal in `new RegExp`.
 *
 * 转义字符串中的正则特殊字符，使其可作为 `new RegExp` 的字面量使用。
 *
 * @example
 *   escapeRegExp("[test]"); // String.raw`\[test\]`
 *
 * @param regexp - The string to escape / 要转义的字符串
 * @returns The escaped string / 转义后的字符串
 */
// NOTE:  This should be a bug of oxlint
export const escapeRegExp = (regexp: string): string =>
  regexp.replaceAll(ESCAPE_REGEXP, REPLACE_WITH);
